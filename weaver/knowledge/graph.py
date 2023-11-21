from .prompt import Prompter
from .relations import RELATIONS, NL_DESCRIPTIONS, path_to_nl_description
from .utils import normalize
from collections import defaultdict
import os
import queue
import json
import time, openai
from threading import Thread 

class ThreadWithReturnValue(Thread):
    
    def __init__(self, group=None, target=None, name=None,
                 args=(), kwargs={}, Verbose=None):
        Thread.__init__(self, group, target, name, args, kwargs)
        self._return = None
        self._name = name

    def run(self):
        if self._target is not None:
            self._return = self._target(*self._args,
                                                **self._kwargs)
    def join(self, *args):
        Thread.join(self, *args)
        return self._return

def build_graph(init_topic, prompter, max_depth = 3):
    graph = defaultdict(dict)
    known_topics = set()
    topic_queue = queue.Queue()

    init_topic = normalize(init_topic)
    topic_queue.put((init_topic, [{"topic": init_topic, "relation": ""}], 0))
    known_topics.add(init_topic)

    while not topic_queue.empty():
        (topic, path, d) = topic_queue.get()
        if d >= max_depth:
            continue
        
        # for relation in RELATIONS.relations:
            
        #     context = ""
        #     if len(path) > 1:
        #         context += "Context: " + path_to_nl_description(path)
        #     topic_list = prompter.query_topics(topic, relation, context=context)
        #     # remove self-loop edge
        #     if topic in topic_list:
        #         topic_list.remove(topic) 
        #     if topic_list != []:
        #         print(topic, relation, topic_list)

        #     graph[topic][relation] = topic_list

        #     # filter known topics 
        #     topic_list = [topic for topic in topic_list if topic not in known_topics] 
        #     known_topics |= set(topic_list)  
        #     for new_topic in topic_list:
        #         topic_queue.put((new_topic, path + [{"topic": new_topic, "relation": relation}], d + 1))

        # threading version
        threads = []
        for relation in RELATIONS.relations:
            context = ""
            if len(path) > 1:
                context += "Context: " + path_to_nl_description(path)
            thread_name = f"{topic}_{relation}"
            t = ThreadWithReturnValue(target=prompter.query_topics, args=(topic,relation,context), name=thread_name)
            threads.append(t)
            t.start()

        for thread in threads:
            relation = thread._name.split("_")[-1]
            topic_list = thread.join()
            if topic in topic_list:
                topic_list.remove(topic) 
            if topic_list != []:
                print(topic, relation, topic_list)

            graph[topic][relation] = topic_list

            # filter known topics 
            topic_list = [topic for topic in topic_list if topic not in known_topics] 
            known_topics |= set(topic_list)  
            for new_topic in topic_list:
                topic_queue.put((new_topic, path + [{"topic": new_topic, "relation": relation}], d + 1))

    
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

def run_graph_construction(seed, taskid, task_path, max_depth = 3):
    prompter = Prompter(taskid=taskid)
    graph = build_graph(seed, prompter, max_depth = max_depth)

    with open(os.path.join(task_path, "graph.json"), "w") as file:
        json.dump(graph, file)
    return graph

if __name__ == "__main__":
    seed = "sarcasm"
    taskid = "_".join(seed.split())
    run_graph_construction(seed, taskid, os.path.join("output", "kg", taskid) , max_depth = 1)
