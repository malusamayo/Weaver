import os
import threading
from .knmodel import GPT3Model
from .cache import Cache
from .relations import RELATIONS, PROMPT_TEMPLATES
from .utils import normalize

class Prompter(object):
    
    def __init__(self, taskid):
        self.taskid = taskid
        self.model = GPT3Model()
        self.cache = Cache(taskid)
        self.sep = "#"
        self.lock = threading.Lock() # for multi-threading

    # [TODO] Use external models to evaluate prompt likelihood
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
            prompts.append(f"List {N} {relation} {topic}")
        prompt = self.select_prompts(prompts)
        return prompt

    def postprocess_to_list(self, text):
        text = text.strip().strip(self.sep).rstrip(self.sep).lower()
        words = text.split(self.sep)
        words = [normalize(word) for word in words]
        return words

    def query_topics(self, topic, relation, known_topics=[], N=20):
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
        known_topics: list of str
            The topics that are already known to the user.
        """
        
        prompt = ""
        cached_topics = []

        # check caches
        if self.cache.exists_cached_queries(topic, relation):
            # if RELATIONS.translate(relation) == RELATIONS.RELATEDTO:
            #     known_topic_list = self.cache.read_cached_queries_per_topic(topic)
            # else:
            cached_topics = self.cache.read_cached_queries(topic, relation)
            if len(known_topics) < len(cached_topics):
                new_topics = [topic for topic in cached_topics if topic not in known_topics]
                return new_topics
            else:
                prompt += self.generate_prompt(topic, relation, N)
                prompt = prompt.replace("List", "List extra")
        else:
            prompt += self.generate_prompt(topic, relation, N)
        
        # adding format instructions
        prompt += "\n"
        prompt += f"Summarize in a list of words. Separate the list by '{self.sep}' only. Keep only the list."
        extend = len(cached_topics) > 0 # if there are cached topics, we are extending the list
        if extend:
            prompt += "\n"
            prompt += "Known examples: "
            prompt += self.sep.join(cached_topics) + "\n"
            prompt += "Extra examples: "
        response = self.model(prompt)
        topic_list = self.postprocess_to_list(response)

        # deal with the case when the model can't generate topics
        if len(topic_list) <= 3:
            return []

        # deduplication
        topic_list = list(set(topic_list))
        topic_list = [topic for topic in topic_list if topic not in cached_topics]
        # [TODO] deduplication based on similarity and normalization

        self.lock.acquire()
        self.cache.cache_queries(topic, relation, cached_topics + topic_list)
        self.lock.release()
        return topic_list

    # [TODO] more engineering needed
    def suggest_examples(self, domain, topic, context="", examples=[], N=5):
        ''' Query the model of examples.
        Parameters
        ----------
        domain : str
            The domain of the examples.
        topic : str
            The topic of the examples.
        context : str
            The context of the examples.
        examples : list of str
            The examples that are already curated by the user.
        N : int
            The desired number of examples.
        '''
        prompt = ""
        prompt += context
        prompt += "\n"
        prompt += f"Write {N + len(examples)} comments on the topic '{topic}' in {domain}.\n"
        for i, example in enumerate(examples):
            prompt += f"{i+1}. {example}\n"
        prompt += f"{len(examples) + 1}. "
        
        response = self.model(prompt)
        new_examples = response.split("\n")
        for i in range(len(new_examples)):
            idx = i + 1 + len(examples)
            new_examples[i] = new_examples[i].strip().replace(f"{idx}. ", "")

        return new_examples

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

if __name__ == "__main__":
    prompter = Prompter()
    print(prompter.query_topics("smartphone", "downsides of"))