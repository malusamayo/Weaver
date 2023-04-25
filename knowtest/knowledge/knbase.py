import json
import os
import threading
import random
import pandas as pd
from .prompt import Prompter
from .relations import RELATIONS, path_to_nl_description
from .graph import run_graph_construction
from .utils import normalize, recommend_topics, PScorer

class KnowledgeBase(object):

    def __init__(self, path: str, taskid: str, uid: str="", is_baseline_mode: bool=False) -> None:
        self.dir = os.path.join(path, taskid)
        self.path_to_nodes = os.path.join(self.dir, "nodes.csv")
        self.path_to_edges = os.path.join(self.dir, "edges.csv")
        self.path_to_specs = os.path.join(self.dir, "specs.json")

        self.domain = "online platform" # setting domain to "online platform" by default
        self.input_type = "comments" 
        if os.path.exists(self.path_to_specs):
            with open(self.path_to_specs, 'r') as f:
                specs = json.load(f)
                self.domain = specs["domain"]
                self.input_type = specs["input_type"]
            print("Specs loaded: ", specs)
        print("Path: ", path, "OS Path: ", os.getcwd())
        self.lock = threading.Lock() # for multi-threading
        print(normalize("Initializing wordnet"))
        self.prompter = Prompter(taskid=taskid)

        if uid == None:
            uid = 0
        self.upath = path + f"/user_{uid}_history.csv"

        self.is_baseline_mode = is_baseline_mode
        if is_baseline_mode:
            self.nodes = pd.DataFrame(columns=['id', 'weight'])
            self.edges = pd.DataFrame(columns=['from', 'to', 'relation', 'score'])
            return
        
        # initialize knowledge base if it does not exist
        if not os.path.exists(self.dir) or not os.path.exists(self.path_to_nodes) or not os.path.exists(self.path_to_edges):
            seed = ' '.join(taskid.split("_")) 
            print(f"Creating knowledge base for {seed}...")
            print(f"It may need to take a few minutes...")
            run_kb_contruction(seed, max_depth=1, KGOutput=path)

        self.nodes = pd.read_csv(self.path_to_nodes)
        self.edges = pd.read_csv(self.path_to_edges)

        # if os.path.exists(self.upath):
        #     self.user_history = pd.read_csv(self.upath)
        # else:
        #     self.user_history = pd.DataFrame(columns=['from', 'to', 'relation', 'recommended', 'selected'])
        #     self.user_history[['from', 'to', 'relation']] = self.edges[['from', 'to', 'relation']]
        #     self.user_history['recommended'] = False
        #     self.user_history['selected'] = None

        # with open(path + f"/{taskid}.json", 'r') as f:
        #     master_JSON = json.load(f)
        #     self.recommended = {node["name"] for node in master_JSON}

    def save(self):
        if not self.is_baseline_mode:
            self.nodes.to_csv(self.path_to_nodes, index=False)
            self.edges.to_csv(self.path_to_edges, index=False)
        # self.user_history.to_csv(self.upath, index=False)

    # def update_user_history(self, recommended=None, existing_children=None):
    #     if recommended is not None:
    #         merged = self.user_history.merge(recommended, on = ['from', 'to', 'relation'], how='left', indicator=True)['_merge']
    #         merged = merged.map(lambda x: x=='both')
    #         self.user_history.loc[merged, 'recommended'] = True

    #     if existing_children is not None:
    #         selected = existing_children[existing_children['is_highlighted']]
    #         merged = self.user_history.merge(selected, on = ['from', 'to', 'relation'], how='left', indicator=True)['_merge']
    #         merged = merged.map(lambda x: x=='both')
    #         self.user_history.loc[merged, 'selected'] = True

    #         unselected = existing_children[~existing_children['is_highlighted']]
    #         merged = self.user_history.merge(unselected, on = ['from', 'to', 'relation'], how='left', indicator=True)['_merge']
    #         merged = merged.map(lambda x: x=='both')
    #         self.user_history.loc[merged, 'selected'] = False
    #     self.save()

    def find_children(self, topic, relation=None):
        if relation is None:
            children = self.edges[self.edges["from"] == topic]
        else:
            children = self.edges[(self.edges["from"] == topic) & (self.edges["relation"] == relation)]
        children = children.merge(self.nodes, left_on='to', right_on='id')
        return children

    def extend_node(self, topic, relation, context=""):
        children = self.find_children(topic, relation)
        known_topics = children['to'].to_list()
        new_topics = self.prompter.query_topics(topic, relation, context=context, known_topics=known_topics)
        if topic in new_topics:
            new_topics.remove(topic) # remove self-loop

        if len(new_topics) == 0:
            return

        node_ids = self.nodes['id'].to_list()
        new_nodes = [{"id": new_topic, 'weight': 1} for new_topic in new_topics if new_topic not in node_ids]
        new_scores = PScorer.score_topics(new_topics, topic).tolist()
        new_edges = [{"from": topic, "to": new_topic, "relation": relation, "score": score} for new_topic, score in zip(new_topics, new_scores)]
        # new_user_history = [{"from": topic, "to": new_topic, "relation": relation, "recommended": False, "selected": False} for new_topic in new_topics]

        self.lock.acquire()
        self.nodes = pd.concat([self.nodes, pd.DataFrame(new_nodes)], ignore_index=True)
        self.edges = pd.concat([self.edges, pd.DataFrame(new_edges)], ignore_index=True)
        # self.user_history = pd.concat([self.user_history, pd.DataFrame(new_user_history)], ignore_index=True)
        self.lock.release()

    def extend_node_all_relation(self, topic, context=""):
        threads = []
        for relation in RELATIONS.relations:
            # # skip the relation if more than half topics under the relation are recommended but not selected
            # u_history = self.user_history.loc[(self.user_history['from'] == topic) & (self.user_history['relation'] == relation)]
            # n_topics = len(u_history)
            # n_recommended = len(u_history[u_history['recommended']])
            # n_selected = u_history['selected'].map(lambda x: x == True).sum()
            # if n_topics > 0 and n_recommended / n_topics > 0.5 and n_selected / n_recommended == 0 and RELATIONS.translate(relation) != RELATIONS.RELATEDTO:
            #     continue

            # synchronous call for RELATEDTO
            if RELATIONS.translate(relation) == RELATIONS.RELATEDTO:            
                self.extend_node(topic, relation, context=context)
            else:
                thread_name = f"{topic}_{relation}"
                t = threading.Thread(target=self.extend_node, args=(topic,relation,context), name=thread_name)
                threads.append(t)
                t.start()

        for thread in threads:
            thread.join()
        # save after all threads are done
        self.save()

    # def compute_weight(self, topic, rows):
    #     rows['final_weight'] = rows['weight']

    #     # adjust weights based on user history
    #     for relation in RELATIONS.relations:
    #         # reduce weights if more than half topics under the relation are recommended but not selected
    #         u_history = self.user_history.loc[(self.user_history['from'] == topic) & (self.user_history['relation'] == relation)]
    #         n_topics = len(u_history)
    #         n_recommended = len(u_history[u_history['recommended']])
    #         n_selected = u_history['selected'].map(lambda x: x == True).sum()
    #         if n_topics > 0 and n_recommended / n_topics > 0.5 and n_selected / n_recommended == 0 and RELATIONS.translate(relation) != RELATIONS.RELATEDTO:
    #             rows.loc[rows['relation'] == relation, 'final_weight'] *= 0.5
        
    #     # [TODO] adjust weights based on topic similarity
    #     return rows

    def prefech_init_children(self, topics, context=""):
        for topic in topics:
            children = self.find_children(topic)
            if len(children) == 0:
                self.extend_node_all_relation(topic, context=context)

    def prefech_new_children(self, topic, known_topics, threshold, context=""):
        self.extend_node_all_relation(topic, context=context)
        children = self.find_children(topic)
        
        # [TODO] disable prefetching when there are too few new topics
        new_topics = children[~children['to'].isin(known_topics)]['to'].to_list()
        if len(new_topics) < threshold:
            return

    def expand_node(self, topic, path=[], existing_children=[], known_topics=[], n_expand=5):
        ''' Expand a node to find related topics.
        Parameters
        ----------
        topic : str
            The topic to be expanded.
        path : list of dict {topic, relation}
            The path from the root to the current node.
        existing_children : list of dict {topic, relation, is_highlighted}
            The existing children of the current node.
        known_topics : list of str
            The topics that are already known to the user.
        n_expand : int
            The number of children returned.
        Returns
        -------
        children : list of dict {to, relation}
            The expanded children of the current node.
        '''

        topic = topic.lower() # temporary fix
        known_items = []
        print(f"Expanding node {topic}...")

        context = "Context: " + path_to_nl_description(path)

        children = self.find_children(topic)
        # if the node has no children, extend the node
        if len(children) == 0:
            print("Initializing children...")
            self.extend_node_all_relation(topic, context=context)
            children = self.find_children(topic)
        
        # remove the ancesters of the current node
        ancesters = [item['topic'] for item in path]
        children = children[~children['to'].isin(ancesters)]
        children = children[~children['to'].isin(known_topics)] # and all known topics in the tree

        if len(existing_children) > 0:
            # remove existing children
            existing_children = pd.DataFrame(existing_children)
            existing_children['from'] = topic
            existing_children['to'] = existing_children['topic']
            known_items = existing_children[['to', 'relation']].to_dict('records')
            known_topics = existing_children['topic'].to_list()
            children = children[~children['to'].isin(known_topics)]

        # # prefetch children if there are not enough fresh children
        # threshold = 2*n_expand
        # if len(children) <= threshold:
        #     print("Prefetching extra children...")
        #     t = threading.Thread(target=self.prefech_new_children, args=(topic, known_topics, threshold, context), name=f"prefetch_c_{topic}")
        #     t.start()
            
        print("Recommending children...")
        children = children.dropna() # in case there are empty pre-computed scores
        items = children[['to', 'relation', 'score']].to_dict('records')
        recommended_items = recommend_topics(items, topic, known_items, K=n_expand)
        # self.recommended |= set([item['to'] for item in recommended_items])

        # # prefetch children of the recommended topics
        # print("Prefetching grandchildren...")
        # recommended_topics = [item['to'] for item in recommended_items]
        # t = threading.Thread(target=self.prefech_init_children, args=(recommended_topics, context), name=f"prefetch_gc_{topic}")
        # t.start()
                
        print(f"Done with expanding node {topic}.")
        return recommended_items

    def expand_node_adatest(self, topic, tree=[], n_expand=5):
        ''' Expand a node to find related topics.
        Parameters
        ----------
        topic : str
            The topic to be expanded.
        tree : list of dict {topic, parent}
            The full pre-order topic trees.
        n_expand : int
            The number of children returned.
        Returns
        -------
        children : list of dict {to, relation}
            The expanded children of the current node.
        '''

        # compute the full path of each topic
        full_path = {}
        for node in tree:
            cur_topic, parent = node['topic'], node['parent']
            if cur_topic in full_path:
                continue
            if parent is None:
                full_path[cur_topic] = '/' + cur_topic
            else:
                assert parent in full_path
                full_path[cur_topic] = full_path[parent] + '/' + cur_topic
        
        known_topics = list(full_path.values())
        topics = self.prompter.sugges_topics_adatest(known_topics, full_path[topic], K=n_expand)
        items = [{'to': topic, 'relation': "RELATEDTO"} for topic in topics]
        return items

    def initialize_tree(self, topic, n_expand=10):
        ''' Initialize the tree with the root node.
        Parameters
        ----------
        topic : str
            The root topic.
        n_expand : int
            The number of children of the root node.
        Returns
        -------
        tree : list of dict {topic, relation, parent}
            The initial tree of depth 2.
        '''

        tree = [{'topic': topic, 'relation': None, 'parent': None}]
        children = self.expand_node(topic, n_expand=n_expand)
        for child in children:
            tree.append({'topic': child['to'], 'relation': child['relation'], 'parent': topic})

        # expand children of the root node
        children_n_expand = n_expand // 3 # expand children with one thirds the number of children
        children = children[:children_n_expand]
        for child in children:
            path = [{'topic': topic, 'relation': None}, {'topic': child['to'], 'relation': child['relation']}] # depth-2 path
            grand_children = self.expand_node(child['to'], path=path, n_expand=children_n_expand)
            for grand_child in grand_children:
                tree.append({'topic': grand_child['to'], 'relation': grand_child['relation'], 'parent': child['to']})

        return tree

    # [DEPRECATED]
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

        assert len(path) >= 2
        assert path[-1]['topic'] == topic
        parent = path[-2]['topic']
        print('parent', parent, 'relation', relation, 'topic', topic)
        children = self.find_children(parent, relation)
        print('children', children)
        
        assert len(existing_siblings) > 0
        existing_siblings = pd.DataFrame(existing_siblings)
        existing_siblings['from'] = parent
        existing_siblings['to'] = existing_siblings['topic']

        known_topics = existing_siblings[existing_siblings['relation'] == relation]['topic'].to_list()
        new_topics = children[~children['to'].isin(known_topics)]

        if len(new_topics) <= n_expand:
            self.extend_node(parent, relation)
            self.save()
            children = self.find_children(parent, relation)
            new_topics = children[~children['to'].isin(known_topics)]

        # [TODO] compute final weights based on topic, path and user history

        new_topics = new_topics.sample(n=n_expand)
        recommended_items = new_topics[['to', 'relation']].to_dict('records')
        # self.recommended |= set([item['to'] for item in recommended_items])
        return recommended_items

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

        context = ""
        if not self.is_baseline_mode:
            context += "Context: " + path_to_nl_description(path)
        
        # remove the "New example" and empty examples
        examples = [example for example in examples 
                    if example.strip() not in ["New example", ""]]
        
        # examples = examples[::-1]

        # sample 7 examples from the existing examples
        # [TODO] sample examples based on failure and diversity
        if len(examples) > 7:
            examples = [
                examples[i] for i in sorted(random.sample(range(len(examples)), 7))
            ]

        # if len(examples) == 0:
        #     print("Zero-shot example suggestion disabled. No examples provided.")
        #     return []
        
        new_examples = self.prompter.suggest_examples(topic, self.domain, self.input_type, context=context, examples=examples, N=N)
        return new_examples

    def add_node(self, topic, parent_topic, relation, path=[]):
        if topic not in self.nodes['id'].values:
            self.nodes = self.nodes.append({"id": topic, "weight":1}, ignore_index=True)

        if len(self.edges[(self.edges['from'] == parent_topic) & (self.edges['to'] == topic) & (self.edges['relation'] == relation)]) > 0:
            return

        score = PScorer.score_topics([topic], parent_topic).tolist()[0]
        self.edges = self.edges.append({"from": parent_topic, "to": topic, "relation": relation, "score": score}, ignore_index=True)
        
        # # prefetch children when none exists
        # children = self.find_children(topic) 
        # if len(children) == 0:
        #     print("Prefetching children...")
        #     context = "Context: " + path_to_nl_description(path)
        #     t = threading.Thread(target=self.prefech_init_children, args=([topic], context), name=f"prefetch_gc_{topic}")
        #     t.start()
        self.save()


def graph_to_knbase(graph):
    nodes = []
    edges = []
    for topic, children in graph.items():
        nodes.append({"id": topic})
        for relation, topics in children.items():
            scores = PScorer.score_topics(topics, topic).tolist() # compute relevancy scores
            for topic_r, score in zip(topics, scores):
                edges.append({"from": topic, "to": topic_r, "relation": relation, "score": score})
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

    print("Knowledge base stored at {}".format(path))

def run_kb_contruction(seed, max_depth=1, KGOutput="./output"):

    taskid = "_".join(seed.split())

    task_path = os.path.join(KGOutput, taskid)
    if not os.path.exists(task_path):
        os.makedirs(task_path)

    graph = run_graph_construction(seed, taskid, task_path=task_path, max_depth=max_depth)
    knbase = graph_to_knbase(graph)
    store_kb(knbase, os.path.join(KGOutput, taskid))

if __name__ == "__main__":
    # # constructing kb
    seed = "feminism"
    run_kb_contruction(seed, max_depth=1, path='./output/kg/feminism')
    # knbase = KnowledgeBase("output", "hate_speech")
    # tree = [
    #     {'topic': 'hate speech', 'parent': None},
    #     {'topic': 'abusive language', 'parent': 'hate_speech'},
    #     {'topic': 'racism', 'parent': 'hate_speech'},
    #     {'topic': 'sexism', 'parent': 'hate_speech'},
    #     {'topic': 'anti-black', 'parent': 'racism'},
    #     {'topic': 'anti-asian', 'parent': 'racism'},
    #     {'topic': 'anti-semitism', 'parent': 'racism'},
    #     {'topic': 'sexist language', 'parent': 'sexism'},
    #     {'topic': 'white supremacy', 'parent': 'racism'}
    # ]
    # print(knbase.expand_node_adatest('racism', tree))
