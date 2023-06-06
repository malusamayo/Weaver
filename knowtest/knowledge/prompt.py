import os
import re
import json
import urllib
import numpy as np
import threading
import importlib.resources
from .knmodel import GPT3Model, GPT3ModelAsync, CurieModel
from .cache import Cache
from .relations import RELATIONS, PROMPT_TEMPLATES
from .utils import normalize, is_subtopic, SScorer

class Prompter(object):
    
    def __init__(self, taskid, generator_specs=None):
        self.taskid = taskid
        self.seed_topic = ' '.join(taskid.split("_")) 
        self.model = GPT3Model()
        self.model_async = GPT3ModelAsync()
        self.curie_model = CurieModel()
        self.cache = Cache(taskid)
        self.sep = "#"
        self.quote = "\""
        self.lock = threading.Lock() # for multi-threading
        with importlib.resources.open_text("knowtest.specs", 'generators.json') as file:
            self.generator_prompts = json.load(file)
        if generator_specs is not None:
            for k, v in generator_specs.items():
                self.generator_prompts[k] = self.generator_prompts[v]

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
            prompts.append(f"List {N} {relation} {topic}.")
        prompt = self.select_prompts(prompts)
        return prompt

    def postprocess_to_list(self, text):
        text = text.strip().strip(self.sep).rstrip(self.sep).lower()
        words = text.split(self.sep)
        words = [normalize(word) for word in words]
        return words

    def query_topics(self, topic, relation, context="", known_topics=[], N=20):
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
        
        # check caches
        if self.cache.exists_cached_queries(topic, relation):
            cached_topics = self.cache.read_cached_queries(topic, relation)
            new_topics = [topic for topic in cached_topics if topic not in known_topics]
            if len(new_topics) > 0:
                return new_topics
        else:
            cached_topics = []

        if len(cached_topics) == 0:
            prompt = self.generator_prompts["zero_shot_knowledge_graph"]
            prompt = prompt.format(context=context, list_prompt=self.generate_prompt(topic, relation, N), sep=self.sep)
        else:
            prompt = self.generator_prompts["few_shot_knowledge_graph"]
            prompt = prompt.format(context=context, list_prompt=self.generate_prompt(topic, relation, N+len(cached_topics)), sep=self.sep, examples=self.sep.join(cached_topics))

        print(prompt)
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

    def suggest_examples(self, topic, context="", examples=[], N=5):
        ''' Query the model of examples.
        Parameters
        ----------
        topic : str
            The topic of the examples.
        context : str
            The context of the examples.
        examples : list of str
            The examples that are already curated by the user.
        N : int
            The desired number of examples.
        '''
        seed = self.seed_topic

        if len(examples) == 0:
            prompt = self.generator_prompts["zero_shot_data_gen"]
            prompt = prompt.format(context=context, topic=topic, seed=seed)
        else:
            prompt = self.generator_prompts["few_shot_data_gen"]
            prompt = prompt.format(context=context, topic=topic, seed=seed, examples="\n\n".join(["- " + e for e in examples])) # [TODO] add label to the examples???
        
        print(prompt)
        response = self.model(prompt, n=N, max_tokens=2560)
        new_examples = [response] if isinstance(response, str) else response
        # new_examples = response.split("\n")
        # new_examples = [example[1:].strip() if example.startswith("-") else example.strip() for example in new_examples]

        return new_examples
    
    def select_topics_adatest(self, known_topics, topic, working_set_size=100, prompt_size=7, repetitions=1,
                                slot_randomization=0.25, score_randomization=0.05, skip_randomization=0.25):
        """ Select top topics for prompting.
        Parameters
        ----------
        known_topics : List[str]
            The known topics with tree prefix.
        
        topic : str
            The topic to build a prompt for.
        working_set_size : int
            How many top tests to consider when doing the full iterative scoring process. Larger values may take longer.
            Note that this has no effect as long as we never go more than working_set_size tests deep during the prompt
            item selection process.
        prompt_size : int
            The number of test slots to include in the prompt.
        """

        # list to index
        ids = np.arange(len(known_topics))

        # return early for an empty test tree
        if len(ids) == 0:
            return []
        
        # we compute each test's distance from current topic, where distance is measured
        # by the length of the topic prefix shared between the test and the current topic
        topic_scaling = np.ones(len(ids))
        topic_parts = topic.split("/")
        for i in range(1, len(topic_parts)):
            prefix = "/".join(topic_parts[:i+1])
            prefix += "/"
            topic_scaling *= 1 + 99 * np.array([v.startswith(prefix) for v in known_topics])
        
        # promote direct children over subtopic descendants and filter for topics vs tests
        topic_scaling *= 1 + 99 * np.array([v.rsplit('/', 1)[0] == topic for v in known_topics])

        # return early if we have nothing to build a prompt with
        if np.sum(topic_scaling) == 0:
            return []

        topic_scaling /= np.max(topic_scaling)

        # filter down to a single test type (chosen to match the top scoring test)
        # scores currently do not influence topic suggestions
        # TODO: can we score topics and topic suggestions?
        scores = np.ones(len(ids))
        hidden_scaling = np.ones(len(ids))

        # filter down to just top rows we will use during the iterative scoring process
        rank_vals = scores * topic_scaling * hidden_scaling
        top_inds = np.argsort(-rank_vals)[:working_set_size]
        ids = ids[top_inds]
        topic_scaling = topic_scaling[top_inds]
        hidden_scaling = hidden_scaling[top_inds]
        scores = scores[top_inds] * 1.0
        

        # build a list of randomized prompts
        prompts = []
        for _ in range(repetitions):

            # store tmp versions of things we update during the iteration
            scores_curr = scores.copy()
            topic_scaling_curr = topic_scaling.copy()

            # score randomization
            scores_curr += score_randomization * np.random.rand(len(ids))

            # sim_avoidance is a vector that marks which items (and items related through similarities)
            # should be avoided (ranked lower for prompt selection)
            sim_avoidance = np.zeros(len(ids))
            topics = [urllib.parse.unquote(known_topics[id].split("/")[-1]) for id in ids]
            similarities = SScorer.similarity_matrix(topics).numpy()

            hard_avoidance = np.zeros(len(ids))
            diversity = np.ones(len(ids))

            # compute how many greedy and how many random positions we will have
            num_random = max(0, min(np.random.binomial(prompt_size, slot_randomization), len(ids) - prompt_size))
            num_greedy = max(0, min(prompt_size - num_random, len(ids) - num_random))
            
            # iteratively select prompt items
            prompt_ids = []
            outside_topics_used = np.ones(len(ids))
            while len(prompt_ids) < num_greedy + num_random:

                # once we get to the random part of the process we scramble the scores
                if len(prompt_ids) == num_greedy:
                    scores_curr = 1 + np.random.rand(len(ids))*0.1

                # find the next bext index
                diversity = 1 - (similarities * sim_avoidance).max(1)
                
                rank_vals = scores_curr * topic_scaling_curr * diversity * (1 - hard_avoidance) * hidden_scaling * outside_topics_used

                if np.nanmax(rank_vals) <= 0 and len(prompt_ids) > 0: # stop if we have run out of the current subtree
                    break

                new_ind = np.nanargmax(rank_vals)
                skip_rand = np.random.rand()

                # make it unlikely we will choose the same outside topic twice
                new_ind_topic = known_topics[ids[new_ind]]
                if not is_subtopic(topic, new_ind_topic):
                    outside_topics_used *= 1 - 0.9 * np.array([known_topics[id] == new_ind_topic for id in ids])

                # add or skip this item
                if skip_rand >= skip_randomization:
                    prompt_ids.append(ids[new_ind])
                    avoidance_level = 1
                else:
                    avoidance_level = 1 - 0.1

                # avoid this IO pair as we select the next pairs
                hard_avoidance[new_ind] = avoidance_level
                
                sim_avoidance[new_ind] = avoidance_level

                # lower the weight of the subtopic we just picked from
                
                new_topic = known_topics[ids[new_ind]]
                if topic != new_topic and is_subtopic(topic, new_topic):
                    subtopic = topic + "/" + new_topic[(len(topic)+1):].split("/")[0]
                    subtopic_scaling = np.array([0.001 if is_subtopic(subtopic, known_topics[k]) else 1 for k in ids])
                    topic_scaling_curr *= subtopic_scaling

            # create the prompt as a list of tuples
            prompt = []
            for k in reversed(prompt_ids):
                topic = known_topics[k]
                parents,child = topic.rsplit("/", 1)
                if parents == "":
                    continue # we can't use the root to help suggest topic names
                prompt.append((parents, urllib.parse.unquote(child)))
            prompts.append(prompt)
        
        return prompts
    
    def sugges_topics_adatest(self, known_topics, topic, K=5):
        prompts = self.select_topics_adatest(known_topics, topic, repetitions=K)

        prompt_strings = []
        for prompt in prompts:
            # create prompts to generate the model input parameters of the tests
            prompt_string = ""
            for p_topic, input in prompt:
                prompt_string += "A subtopic of " + self.quote + p_topic + self.quote + " is " + self.quote
                prompt_string += input + self.quote
                prompt_string += "\n"
            
            prompt_string += "A subtopic of " + self.quote + topic + self.quote + " is " + self.quote
            prompt_strings.append(prompt_string)
        
        topics = []
        for prompt_string in prompt_strings:
            response = self.curie_model(prompt_string)
            topics.append(response) 
        topics = [normalize(word.lower()) for word in topics]
        return topics

if __name__ == "__main__":
    prompter = Prompter("test")
    print(prompter.query_topics("smartphone", "downsides of", known_topics=["data-usage"]))
    # print(prompter.suggest_examples("feminism", "Twitter", "online comments", examples=["We must continue to fight against the hate speech that targets women and girls. #Feminism", "We must end the wage gap between men and women. #EqualPay"]))

    # known_topics = [
    #     '/hate speech',
    #     '/hate speech/abusive language',
    #     '/hate speech/racism',
    #     '/hate speech/sexism',
    #     '/hate speech/sexism/sexist language',
    #     '/hate speech/racism/anti-semitism',
    #     '/hate speech/racism/anti-black',
    #     '/hate speech/racism/white supremacy',
    #     '/hate speech/racism/anti-asian',
    # ]
    # for _ in range(3):
    #     topic = "/hate speech/racism"
    #     topics = prompter.sugges_topics_adatest(known_topics, topic, K=5)
    #     print(topics)
    #     known_topics += [topic + '/' + t for t in topics]