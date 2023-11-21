import json
from .knmodel import ChatGPTModel
import importlib.resources
from ..specs.manager import SpecManager

class RephraseModel(object):

    def __init__(self) -> None:
        self.sys_msg = f''''''
        self.model = ChatGPTModel(self.sys_msg, temparature=0)

    def __call__(self, sentence):
        msg = f'''Rephrase the sentence to make it less ambiguous and more readable.
Sentence: {sentence}
Rephrased sentence:'''
        prompts = [{"role": "user", "content": msg}]
        response = self.model(prompts)
        return response['content']

class Relations(object):
    def __init__(self, path_to_relations='relations_default.json'):
        if SpecManager.use_custom_relation_specs:
            path_to_relations = 'relations.json'
        with importlib.resources.open_text("weaver.specs", path_to_relations) as file:
            self.relation_specs = json.load(file)
        # with open(path_to_relations, 'r') as f:
        #     self.relation_specs = json.loads(f.read()) 
        self.relations = [r['id'] for r in self.relation_specs]
        self.translate_dict = dict(zip(self.relations , range(len(self.relations))))
        self.rephrase_model = RephraseModel()

    def has_relation(self, relation):
        relation = relation.upper()
        return relation in self.relations

    def translate(self, relation):
        return self.translate_dict[relation.upper()]
    
    def get_nl_tags(self):
        return {i: [r['tag']] for i, r in enumerate(self.relation_specs)}
    
    def get_nl_description(self):
        return {i: (r['description']['text'],  0 if r['description']['position'] == "second" else 1) for i, r in enumerate(self.relation_specs)}

    def get_prompt_template(self):
        return {i: [r['prompt']] for i, r in enumerate(self.relation_specs)}

def to_nl_tags(relation):
    if RELATIONS.has_relation(relation):
        relation = RELATIONS.translate(relation)
        return RELATION_NL_TAGS[relation][0]
    return relation

def to_nl_description(topic, relation, parent_topic, rephrase=False):
    if RELATIONS.has_relation(relation):
        relation = RELATIONS.translate(relation)
        (descrp, pos) = NL_DESCRIPTIONS[relation]
        if pos == 0:
            sentence = f"{topic} {descrp} {parent_topic}."
        else:
            sentence = f"{parent_topic} {descrp} {topic}."
    else:
        sentence = f"{topic} is {relation} {parent_topic}." # all custom relations should be in this form
    sentence = sentence.capitalize()
    if rephrase: ## disabled, too costly
        sentence = RELATIONS.rephrase_model(sentence)
        print(sentence)
    return sentence

def path_to_nl_description(path):
    '''
    path: list of dict {topic, relation}
        Path from root to leaf.
    '''
    parents = [item['topic'] for item in path][:-1]
    children = path[1:]
    sentences = []
    for parent, child in zip(parents, children):
        relation = child['relation']
        topic = child['topic']
        sentence = to_nl_description(topic, relation, parent)
        sentences.append(sentence)
    
    descrps = ' '.join(sentences)
    return descrps

RELATIONS = Relations()
PROMPT_TEMPLATES = RELATIONS.get_prompt_template()
NL_DESCRIPTIONS = RELATIONS.get_nl_description()
RELATION_NL_TAGS = RELATIONS.get_nl_tags()