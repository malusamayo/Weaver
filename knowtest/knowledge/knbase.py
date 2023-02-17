import json
import pandas as pd
from .prompt import Prompter
from .relations import RELATIONS

class KnowledgeBase(object):

    def __init__(self, path) -> None:
        self.dir = path
        self.nodes = pd.read_csv(path + "/nodes.csv")
        self.edges = pd.read_csv(path + "/edges.csv")
        self.prompter = Prompter()

    def save(self):
        self.nodes.to_csv(self.dir + "/nodes.csv", index=False)
        self.edges.to_csv(self.dir + "/edges.csv", index=False)

    def find_children(self, topic):
        children = self.edges[self.edges["from"] == topic]
        children = children.merge(self.nodes, left_on='to', right_on='id')
        return children[['to', 'relation', 'weight']]

    def extend_node(self, topic, relation):
        old_topics = self.prompter.query_topics(topic, relation)
        topic_list = self.prompter.query_topics(topic, relation, extend=True)
        new_nodes = [{"id": new_topic, 'weight': 1} for new_topic in topic_list]
        new_edges = [{"from": topic, "to": new_topic, "relation": relation} for new_topic in topic_list]
        
        # [TODO] deduplicate nodes and edges


        self.nodes = self.nodes.append(new_nodes, ignore_index=True)
        self.edges = self.edges.append(new_edges, ignore_index=True)

    def extend_node_all_relation(self, topic):
        for relation in RELATIONS.relations:
            self.extend_node(topic, relation)
        self.save()

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
        '''

        # initialize children nodes
        if len(existing_children) == 0:
            children = self.find_children(topic)
            # if the node has no children, extend the node
            if len(children) == 0:
                self.extend_node_all_relation(topic)
                children = self.find_children(topic)
            # stratified sampling for each relation
            children = children.groupby('relation').apply(lambda x: x.sample(min(len(x), 3)))
            return children.to_dict('records')

        # refresh children nodes
        highlighted_topics = [child["topic"] for child in existing_children if child["is_highlighted"]]
        unhighlighted_topics = [child["topic"] for child in existing_children if not child["is_highlighted"]]
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

        # [TODO] compute final weights based on path and existing_children
        children = children.sample(n=n_expand, weights='weight')
        return children.to_dict('records')
    

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

    # deduplicate nodes
    nodes = nodes.drop_duplicates(subset=['id'])

    # merge semantically similar nodes


    nodes.to_csv(path + "/nodes.csv", index=False)
    edges.to_csv(path + "/edges.csv", index=False)


if __name__ == "__main__":
    # constructing kb
    with open("output/graph.json", "r") as file:
        graph = json.load(file)
    knbase = graph_to_knbase(graph)
    store_kb(knbase, "output")