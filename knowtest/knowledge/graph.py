from .prompt import Prompter
from .relations import RELATIONS, NL_DESCRIPTIONS
from collections import defaultdict
import os
import queue
import json
import time, openai

def build_graph(init_topic, prompter, max_depth = 3):
    graph = defaultdict(dict)
    known_topics = set()
    topic_queue = queue.Queue()
    topic_queue.put((init_topic, 0))
    known_topics.add(init_topic)

    while not topic_queue.empty():
        (topic, d) = topic_queue.get()
        if d >= max_depth:
            continue
        
        for relation in RELATIONS.relations:
            
            topic_list = prompter.query_topics(topic, relation)
            # remove self-loop edge
            if topic in topic_list:
                topic_list.remove(topic) 
            known_topics |= set(topic_list)
            if topic_list != []:
                print(topic, relation, topic_list)

            graph[topic][relation] = topic_list

            # filter known topics 
            topic_list = [topic for topic in topic_list if topic not in known_topics]   
            for new_topic in topic_list:
                topic_queue.put((new_topic, d + 1))
    
    return graph

# more resilient version of chunk of requests:
def build_graph_resilient(topic, prompter):
    while True:
        try:
            graph = build_graph(topic, prompter)
            break
        except openai.error.RateLimitError:
            print("Too frequent requests! Sleeping now...")
            time.sleep(30)
        except openai.error.ServiceUnavailableError:
            print("Service unavailable! Sleeping now...")
            time.sleep(30)
        except Exception as e:
            print(e)
            break
    return graph

def build_tree(init_topic, graph):
    traversed = set()
    tree_pre_order = []

    def add_node(topic, level, relation, parent):
        tree_pre_order.append((topic, level, relation, parent))
        traversed.add(topic)
        children = graph[topic]
        if len(children) == 0:
            return
        for relation in RELATIONS.relations:
            for topic_r in children[relation]:
                if topic_r not in traversed:
                    add_node(topic_r, level+1, relation, topic)
    
    add_node(init_topic, 0, '', '')

    return tree_pre_order


def print_tree(tree_pre_order, taskid):
    tree_string = ''
    for node in tree_pre_order:
        (topic, level, relation, parent) = node
        if RELATIONS.has_relation(relation):
            relation = NL_DESCRIPTIONS[RELATIONS.translate(relation)][0]
        tree_string += '-' + "---"*level + ' ' + parent + '\t' + relation + '\t' + topic +'\n'
    
    with open(os.path.join("output", taskid, "tree.txt"), "w") as file:
        file.write(tree_string)

def run_graph_construction(seed, taskid, max_depth = 3):
    prompter = Prompter(taskid=taskid)
    graph = build_graph(seed, prompter, max_depth = max_depth)

    if not os.path.exists(os.path.join("output", taskid)):
        os.makedirs(os.path.join("output", taskid))
    with open(os.path.join("output", taskid, "graph.json"), "w") as file:
        json.dump(graph, file)
    return graph

if __name__ == "__main__":
    seed = "sarcasm"
    taskid = "_".join(seed.split())
    run_graph_construction(seed, taskid, max_depth = 1)
