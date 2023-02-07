
class Relations(object):
    RELATEDTO = 0
    TYPESOF = 1
    PARTOF = 2
    HASA = 3
    HASPROPERTY = 4
    USEDFOR = 5
    ATLOCATION = 6
    CAUSES = 7
    MOTIVATEDBY = 8
    OBSTRUCTEDBY = 9
    MANNEROF = 10
    LOCATEDNEAR = 11
    HASAGENT = 12
    HASPATIENT = 13
    ASPECTOF = 14

    def __init__(self):
        self.relations = ["RELATEDTO", "TYPESOF", "PARTOF", "HASA", "HASPROPERTY", "USEDFOR", "ATLOCATION", "CAUSES", "MOTIVATEDBY", "OBSTRUCTEDBY", "MANNEROF", "LOCATEDNEAR", "HASAGENT", "HASPATIENT", "ASPECTOF"]
        self.translate_dict = dict(zip(self.relations , range(len(self.relations))))

    def has_relation(self, relation):
        relation = relation.upper()
        return relation in self.relations

    def translate(self, relation):
        return self.translate_dict[relation.upper()]

RELATIONS = Relations()
PROMPT_TEMPLATES = {
    RELATIONS.TYPESOF: 
        ["List {N} types of {topic}."],
    RELATIONS.PARTOF:
        ["List {N} components of {topic}.", "List {N} parts of {topic}."], 
    RELATIONS.MOTIVATEDBY:
        ["List {N} reasons behind {topic}.", "List {N} motivations behind {topic}."], 
    RELATIONS.OBSTRUCTEDBY:
        ["List {N} forces against {topic}."], 
    RELATIONS.MANNEROF:
        ["List {N} forms {topic} could take.", "List {N} ways of {topic}."], 
    RELATIONS.LOCATEDNEAR:
        ["List {N} things that often locates near {topic}."], 
    RELATIONS.ASPECTOF:
        ["List {N} aspects of {topic}."], 
    RELATIONS.USEDFOR:
        ["List {N} usages of {topic}."], 
    RELATIONS.ATLOCATION:
        ["List {N} locations {topic} could appear in."], 
    RELATIONS.HASAGENT:
        ["List {N} groups that perform {topic}."], 
    RELATIONS.HASPATIENT:
        ["List {N} groups that are influenced by {topic}."], 
    RELATIONS.HASA:
        ["List {N} things that belong to {topic}."], 
    RELATIONS.HASPROPERTY:
        ["List {N} attributes of {topic}."], 
    RELATIONS.CAUSES:
        ["List {N} consequences of {topic}."], 
    RELATIONS.RELATEDTO:
        ["List {N} concepts related to {topic}."], 
}