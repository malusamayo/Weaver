import os
from pathlib import Path
class Cache(object):

    def __init__(self) -> None:
        self.saved_prompts = dict()
        self.cache_dir = os.path.join(Path(__file__).parent.parent.parent, "query_cache")

    def save_prompt(self, topic, relation, prompt):
        self.saved_prompts[(topic, relation)] = prompt

    def exists_prompt(self, topic, relation):
        return (topic, relation) in self.saved_prompts 
        
    def get_prompt(self, topic, relation):
        return self.saved_prompts[(topic, relation)]

    def cache_queries(self, topic, relation, topic_list, extend=False):
        topic_dir = os.path.join(self.cache_dir, topic)
        if not os.path.exists(topic_dir):
            os.mkdir(topic_dir)
        saved_path = os.path.join(topic_dir, relation + ".txt")

        if extend:
            topic_list_before = self.read_cached_queries(topic, relation)
            topic_list = topic_list_before + topic_list
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