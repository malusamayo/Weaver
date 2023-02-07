import os
from .knowledge_models import ChatGPTModel
from .cache import Cache
from .relations import RELATIONS, PROMPT_TEMPLATES

class Prompter(object):
    
    def __init__(self, config_file, domain=None):
        self.model = ChatGPTModel(config_file)
        self.cache = Cache()
        if domain != None:
            self.initialize_prompt(domain)

    
    def initialize_prompt(self, domain):
        prompt = ""
        prompt += f"From now on, all your response should be around {domain}."
        self.model(prompt, rollback=False)

    # [TODO] Use perplexity or external models to evaluate prompt likelihood
    def select_prompts(self, prompts):
        return prompts[0]

    def generate_prompt(self, topic, relation, N=10):
        """ Generate the best prompt for given topic and relation.
        Parameters
        ----------
        topic : str
            The topic under queries.
        relation: str
            The relation between user-given topic (A) and generated related topics (B).
            It could be from the close set we provide or any open relations.
            Open relation R will be parsed in this order: (B, R, A).  
            For example: (?, features of, software).
        N: int
            The desired number of topics.
        """
        prompts = []
        if RELATIONS.has_relation(relation):
            relation = RELATIONS.translate(relation)
            prompts += [prompt.format(topic=topic, N=N) for prompt in PROMPT_TEMPLATES[relation]]
        else:
            # open relations
            prompts.append(f"List {N}] {relation} {topic}")
        prompt = self.select_prompts(prompts)
        return prompt

    def postprocess_to_list(self, text):
        text = text.strip().rstrip('.').lower()
        words = text.split(", ")
        return words

    def query_topics(self, topic, relation, extend=False):
        """ Query the model of related topics.
        Parameters
        ----------
        topic : str
            The topic under queries.
        relation: str
            The relation between user-given topic (A) and generated related topics (B).
            It could be from the close set we provide or any open relations.
            Open relation R will be parsed in this order: (B, R, A).  
            For example: (?, features of, software).
        extend: bool
            Ask the model for more topics under the same (topic, relation) query tuple.
        """
        
        prompt = ""

        # check caches
        if self.cache.exists_cached_queries(topic, relation):
            if RELATIONS.translate(relation) == RELATIONS.RELATEDTO:
                known_topic_list = self.cache.read_cached_queries_per_topic(topic)
            else:
                known_topic_list = self.cache.read_cached_queries(topic, relation)
            if not extend:
                return known_topic_list
            else:
                if self.cache.exists_prompt(topic, relation):
                    prompt += self.cache.get_prompt(topic, relation)
                else:
                    prompt += self.generate_prompt(topic, relation)
                    self.cache.save_prompt(topic, relation, prompt)
                prompt += "\n"
                prompt += f"Exclude these known topics: \"{', '.join(known_topic_list)}\"."
        else:
            if self.cache.exists_prompt(topic, relation):
                prompt += self.cache.get_prompt(topic, relation)
            else:
                prompt += self.generate_prompt(topic, relation)
                self.cache.save_prompt(topic, relation, prompt)
        
        # adding format instructions
        prompt += "\n"
        prompt += "Summarize in a list of words. Separate the list by commas. Keep only the list."
        response = self.model(prompt)
        topic_list = self.postprocess_to_list(response)

        self.cache.cache_queries(topic, relation, topic_list, extend=extend)
        return topic_list

    # [TODO] more engineering needed
    def query_examples(self, domain, label, topic):
        prompt = ""
        prompt += f"Imagine you are writing a {domain}. You are {label}.\n"
        prompt += f"Write some comments on {topic}."
        text = self.model(prompt)
        return text

    # [TODO] more engineering needed
    def query_relations(self, topic, related_topic):
        prompt = ""
        prompt += f"What is the relation between {related_topic} and {topic}?\n"
        prompt += f"Select from the following relations: \"{', '.join(self.relations)}\"."
        response = self.model(prompt)
        response = response.strip().rstrip('.')
        return response

    def recommend_relation(self, topic):
        prompts = []
        for relation in self.relations:
            prompt = self.generate_prompt(topic, relation)
            prompts.append(prompt)
        ## ranking [TODO]
        

    def generate_relation(self, topic):
        pass

    def extract_relation(self, data):
        pass

    def rank_topic(self, topic_list):
        pass

if __name__ == "__main__":
    prompter = Prompter(config_file="notebooks/config.json")
    prompter.query_topics("hate speech", "MANNEROF")