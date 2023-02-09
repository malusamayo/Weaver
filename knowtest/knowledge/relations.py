
class Relations(object):
    TYPESOF = 0
    PARTOF = 1
    HASPROPERTY = 2
    USEDFOR = 3
    ATLOCATION = 4
    CAUSES = 5
    MOTIVATEDBY = 6
    OBSTRUCTEDBY = 7
    MANNEROF = 8
    LOCATEDNEAR = 9
    HASAGENT = 10
    HASPATIENT = 11
    RELATEDTO = 12

    def __init__(self):
        self.relations = [
            "TYPESOF", 
            "PARTOF", 
            "HASPROPERTY", 
            "USEDFOR", 
            "ATLOCATION", 
            "CAUSES", 
            "MOTIVATEDBY", 
            "OBSTRUCTEDBY", 
            "MANNEROF", 
            "LOCATEDNEAR", 
            "HASAGENT", 
            "HASPATIENT", 
            "RELATEDTO"
            ]
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
        ["List {N} parts of {topic}.", "List {N} aspects of {topic}."], 
    RELATIONS.LOCATEDNEAR:
        ["List {N} things that often locates near {topic}."], 
    RELATIONS.ATLOCATION:
        ["List {N} locations {topic} could appear in."], 
    RELATIONS.USEDFOR:
        ["List {N} uses of {topic}.", "List {N} purposes of {topic}."], 
    RELATIONS.HASPROPERTY:
        ["List {N} descriptions of {topic}."], 
    # actions/events
    RELATIONS.MANNEROF:
        ["List {N} ways to do {topic}."], 
    RELATIONS.HASAGENT:
        ["List {N} groups that perform {topic}."], 
    RELATIONS.HASPATIENT:
        ["List {N} groups that are targeted by {topic}."], 
    RELATIONS.MOTIVATEDBY:
        ["List {N} reasons behind {topic}.", "List {N} motivations behind {topic}."], 
    RELATIONS.OBSTRUCTEDBY:
        ["List {N} actions against {topic}.", "List {N} groups against {topic}."], 
    RELATIONS.CAUSES:
        ["List {N} consequences of {topic}."], 
    # the most generic relation
    RELATIONS.RELATEDTO:
        ["List {N} concepts related to {topic}."], 
}