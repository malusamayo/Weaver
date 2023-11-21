import os
import pickle
from pathlib import Path
from .relations import RELATIONS

class EmbeddingsCache(object):
    def __init__(self, taskid) -> None:
        self.cache_dir = os.path.join(Path(__file__).parent.parent.parent, "query_cache", taskid)
        self.embeddings_path = os.path.join(self.cache_dir, "embeddings.pickle")
        self.text_embeddings = dict()
        if os.path.exists(self.embeddings_path):
            with open(self.embeddings_path, 'rb') as pkl:
                self.text_embeddings = pickle.load(pkl)

    def cache_embeddings(self, texts, embeddings):
        for text, embedding in zip(texts, embeddings):
            self.text_embeddings[text] = embedding
        with open(self.embeddings_path, 'wb') as pkl:
            pickle.dump(self.text_embeddings, pkl)

    def read_embeddings(self, texts):
        return [self.text_embeddings[text] if text in self.text_embeddings else None for text in texts ]

class Cache(object):
    def __init__(self, taskid) -> None:
        # self.saved_prompts = dict()
        self.cache_dir = os.path.join(Path(__file__).parent.parent.parent, "query_cache", taskid)
        self.embdCache = None
        print("Cache directory: " + self.cache_dir)

    # def save_prompt(self, topic, relation, prompt):
    #     self.saved_prompts[(topic, relation)] = prompt

    # def exists_prompt(self, topic, relation):
    #     return (topic, relation) in self.saved_prompts 
        
    # def get_prompt(self, topic, relation):
    #     return self.saved_prompts[(topic, relation)]

    def cache_queries(self, topic, relation, topic_list):
        topic_dir = os.path.join(self.cache_dir, topic)
        if not os.path.exists(topic_dir):
            print("Creating cache directory: " + topic_dir)
            os.makedirs(topic_dir)
        saved_path = os.path.join(topic_dir, relation + ".txt")

        with open(saved_path, "w") as f:
            f.write("\n".join(topic_list))

    def exists_cached_queries(self, topic, relation):
        topic_dir = os.path.join(self.cache_dir, topic)
        cache_path = os.path.join(topic_dir, relation + ".txt")
        return os.path.exists(cache_path)

    def read_cached_queries(self, topic, relation):
        topic_list = []

        topic_dir = os.path.join(self.cache_dir, topic)
        cache_path = os.path.join(topic_dir, relation + ".txt")
        if os.path.exists(cache_path):
            with open(cache_path, "r") as f:
                topic_list = f.read().splitlines()
        return topic_list

    def read_cached_queries_per_topic(self, topic):
        topic_list = []

        topic_dir = os.path.join(self.cache_dir, topic)

        topic_list = []
        for relation in RELATIONS.relations:
            cache_path = os.path.join(topic_dir, relation + ".txt")
            if os.path.exists(cache_path):
                with open(cache_path, "r") as f:
                    topic_list += f.read().splitlines()
        return topic_list