import json
import os
import threading
import pandas as pd
from .prompt import Prompter
from .relations import RELATIONS
from .utils import normalize

class KnowledgeBase(object):

    def __init__(self, path, taskid, domain="", uid=None) -> None:
        self.dir = os.path.join(path, taskid)
        self.domain = "online platform" if domain == "" else domain # setting domain to "online platform" by default
        self.nodes = pd.read_csv(self.dir + "/nodes.csv")
        self.edges = pd.read_csv(self.dir + "/edges.csv")
        self.lock = threading.Lock() # for multi-threading

        if uid == None:
            uid = 0
        self.upath = path + f"/user_{uid}_history.csv"

        if os.path.exists(self.upath):
            self.user_history = pd.read_csv(self.upath)
        else:
            self.user_history = pd.DataFrame(columns=['from', 'to', 'relation', 'recommended', 'selected'])
            self.user_history[['from', 'to', 'relation']] = self.edges[['from', 'to', 'relation']]
            self.user_history['recommended'] = False
            self.user_history['selected'] = None

        self.prompter = Prompter(taskid=taskid)

    def save(self):
        self.nodes.to_csv(self.dir + "/nodes.csv", index=False)
        self.edges.to_csv(self.dir + "/edges.csv", index=False)
        self.user_history.to_csv(self.upath, index=False)

    def update_user_history(self, recommended=None, existing_children=None):
        if recommended is not None:
            merged = self.user_history.merge(recommended, on = ['from', 'to', 'relation'], how='left', indicator=True)['_merge']
            merged = merged.map(lambda x: x=='both')
            self.user_history.loc[merged, 'recommended'] = True

        if existing_children is not None:
            selected = existing_children[existing_children['is_highlighted']]
            merged = self.user_history.merge(selected, on = ['from', 'to', 'relation'], how='left', indicator=True)['_merge']
            merged = merged.map(lambda x: x=='both')
            self.user_history.loc[merged, 'selected'] = True

            unselected = existing_children[~existing_children['is_highlighted']]
            merged = self.user_history.merge(unselected, on = ['from', 'to', 'relation'], how='left', indicator=True)['_merge']
            merged = merged.map(lambda x: x=='both')
            self.user_history.loc[merged, 'selected'] = False
        self.save()

    def find_children(self, topic, relation=None):
        if relation is None:
            children = self.edges[self.edges["from"] == topic]
        else:
            children = self.edges[(self.edges["from"] == topic) & (self.edges["relation"] == relation)]
        children = children.merge(self.nodes, left_on='to', right_on='id')
        return children

    def extend_node(self, topic, relation):
        children = self.find_children(topic, relation)
        known_topics = children['to'].to_list()
        new_topics = self.prompter.query_topics(topic, relation, known_topics=known_topics)

        node_ids = self.nodes['id'].to_list()
        new_nodes = [{"id": new_topic, 'weight': 1} for new_topic in new_topics if new_topic not in node_ids]
        new_edges = [{"from": topic, "to": new_topic, "relation": relation} for new_topic in new_topics]
        new_user_history = [{"from": topic, "to": new_topic, "relation": relation, "recommended": False, "selected": False} for new_topic in new_topics]

        self.lock.acquire()
        self.nodes = pd.concat([self.nodes, pd.DataFrame(new_nodes)], ignore_index=True)
        self.edges = pd.concat([self.edges, pd.DataFrame(new_edges)], ignore_index=True)
        self.user_history = pd.concat([self.user_history, pd.DataFrame(new_user_history)], ignore_index=True)
        self.lock.release()

    def extend_node_all_relation(self, topic):
        for relation in RELATIONS.relations:
            # skip the relation if more than half topics under the relation are recommended but not selected
            u_history = self.user_history.loc[(self.user_history['from'] == topic) & (self.user_history['relation'] == relation)]
            n_topics = len(u_history)
            n_recommended = len(u_history[u_history['recommended']])
            n_selected = u_history['selected'].map(lambda x: x == True).sum()
            if n_topics > 0 and n_recommended / n_topics > 0.5 and n_selected / n_recommended == 0 and RELATIONS.translate(relation) != RELATIONS.RELATEDTO:
                continue

            # synchronous call for RELATEDTO
            if RELATIONS.translate(relation) == RELATIONS.RELATEDTO:            
                self.extend_node(topic, relation)
            else:
                t = threading.Thread(target=self.extend_node, args=(topic,relation,))
                t.start()

        # [TODO] save after all threads are done??
        self.save()

    def compute_weight(self, topic, rows):
        rows['final_weight'] = rows['weight']

        # adjust weights based on user history
        for relation in RELATIONS.relations:
            # reduce weights if more than half topics under the relation are recommended but not selected
            u_history = self.user_history.loc[(self.user_history['from'] == topic) & (self.user_history['relation'] == relation)]
            n_topics = len(u_history)
            n_recommended = len(u_history[u_history['recommended']])
            n_selected = u_history['selected'].map(lambda x: x == True).sum()
            if n_topics > 0 and n_recommended / n_topics > 0.5 and n_selected / n_recommended == 0 and RELATIONS.translate(relation) != RELATIONS.RELATEDTO:
                rows.loc[rows['relation'] == relation, 'final_weight'] *= 0.5
        
        # [TODO] adjust weights based on topic similarity
        return rows

    def expand_node(self, topic, path=[], existing_children=[], n_expand=10):
        ''' Expand a node to find related topics.
        Parameters
        ----------
        topic : str
            The topic to be expanded.
        path : list of dict {topic, relation}
            The path from the root to the current node.
        existing_children : list of dict {topic, relation, is_highlighted}
            The existing children of the current node.
        n_expand : int
            The number of children returned.
        Returns
        -------
        children : list of dict {to, relation}
            The expanded children of the current node.
        '''

        topic = topic.lower() # temporary fix

        # initialize children nodes
        if len(existing_children) == 0:
            children = self.find_children(topic)
            # if the node has no children, extend the node
            if len(children) == 0:
                self.extend_node_all_relation(topic)
                children = self.find_children(topic)
            # stratified sampling for each relation
            children = children.groupby('relation').apply(lambda x: x.sample(min(len(x), 3))).reset_index(drop=True)
            self.update_user_history(recommended=children)
            return children[['to', 'relation']].to_dict('records')

        # update user history based on existing children
        existing_children = pd.DataFrame(existing_children)
        existing_children['from'] = topic
        existing_children['to'] = existing_children['topic']
        self.update_user_history(existing_children=existing_children)

        # refresh children nodes
        highlighted_topics = existing_children[existing_children['is_highlighted']]['topic'].to_list()
        unhighlighted_topics = existing_children[~existing_children['is_highlighted']]['topic'].to_list()
        self.nodes.loc[self.nodes['id'].isin(highlighted_topics), 'weight'] = 0 # set highlighted children to weight 0
        self.nodes.loc[self.nodes['id'].isin(unhighlighted_topics), 'weight'] *= 0.2 # lower the weights of unhighlighted children
        
        children = self.find_children(topic)
        children = children[~children["to"].isin(highlighted_topics)] # remove highlighted children
        fresh_children = children[children['weight'] == 1] # get fresh children

        # if the node has too few children, extend the node
        if len(fresh_children) <= n_expand:
            self.extend_node_all_relation(topic)
            children = self.find_children(topic)
            children = children[~children["to"].isin(highlighted_topics)] # remove highlighted children

        # compute final weights based on path and user history
        children = self.compute_weight(topic, children)
        children = children.sample(n=n_expand, weights='final_weight')
        self.update_user_history(recommended=children)
        return children[['to', 'relation']].to_dict('records')

    def suggest_siblings(self, topic, relation, path=[], existing_siblings=[], n_expand=3):
        ''' Suggest siblings of a node.
        Parameters
        ----------
        topic : str
        relation : str
            The relation used to find siblings.
        path : list of dict {topic, relation}
            The path from the root to the current node.
        existing_siblings : list of dict {topic, relation, is_highlighted}
            The existing siblings of the current node, including the current node.
        n_expand : int
            The number of siblings returned.
        Returns
        -------
        siblings : list of dict {to, relation}
            The expanded siblings of the current node.
        '''

        parent = path[-1]['topic']
        children = self.find_children(parent, relation)
        
        assert len(existing_siblings) > 0
        existing_siblings = pd.DataFrame(existing_siblings)
        existing_siblings['from'] = parent
        existing_siblings['to'] = existing_siblings['topic']

        known_topics = existing_siblings[existing_siblings['relation'] == relation]['topic'].to_list()
        new_topics = children[~children['to'].isin(known_topics)]

        if len(new_topics) <= n_expand:
            self.extend_node(parent, relation)
            children = self.find_children(parent, relation)
            new_topics = children[~children['to'].isin(known_topics)]

        # [TODO] compute final weights based on topic, path and user history

        new_topics = new_topics.sample(n=n_expand)
        return new_topics[['to', 'relation']].to_dict('records')

    def suggest_examples(self, topic, path=[], examples=[], N=5):
        ''' Suggest examples of a node.
        Parameters
        ----------
        topic : str
            The topic of the examples.
        path : list of dict {topic, relation}
            The path from the root to the current node.
        examples : list of str
            The examples that are already curated by the user.
        N : int
            The desired number of examples.
        Returns
        -------
        new_examples : list of str
            The suggested examples.
        '''

        # [TODO] translate path to context
        context = ""
        new_examples = self.prompter.suggest_examples(self.domain, topic, context=context, examples=examples, N=N)
        return new_examples

    def add_node(self, topic, parent_topic, relation):
        self.nodes = self.nodes.append({"id": topic}, ignore_index=True)
        self.edges = self.edges.append({"from": parent_topic, "to": topic, "relation": relation}, ignore_index=True)


def graph_to_knbase(graph):
    nodes = []
    edges = []
    for topic, children in graph.items():
        nodes.append({"id": topic})
        for relation, topics in children.items():
            for topic_r in topics:
                edges.append({"from": topic, "to": topic_r, "relation": relation})
    return {"nodes": nodes, "edges": edges}

def store_kb(knbase, path):
    nodes = pd.DataFrame(knbase['nodes'])
    nodes["weight"] = 1
    edges = pd.DataFrame(knbase['edges'])

    # normalize words
    nodes['id'] = nodes['id'].map(normalize)
    edges['to'] = edges['to'].map(normalize)

    # deduplicate nodes
    nodes = nodes.drop_duplicates(subset=['id'])
    edges = edges.drop_duplicates(subset=['to']) # drop duplicated topics in different paths

    # [TODO] merge semantically similar nodes??

    nodes.to_csv(path + "/nodes.csv", index=False)
    edges.to_csv(path + "/edges.csv", index=False)


if __name__ == "__main__":
    # constructing kb
    with open("output/hate-speech-001/graph.json", "r") as file:
        graph = json.load(file)
    knbase = graph_to_knbase(graph)
    store_kb(knbase, "output/hate-speech-001")