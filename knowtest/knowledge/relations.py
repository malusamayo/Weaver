
class Relations(object):
    TYPEOF = 0
    PARTOF = 1
    HASPROPERTY = 2
    USEDFOR = 3
    ATLOCATION = 4
    CAUSES = 5
    MOTIVATEDBY = 6
    OBSTRUCTEDBY = 7
    MANNEROF = 8
    LOCATEDNEAR = 9
    # HASAGENT = 10
    # HASPATIENT = 11
    CAPABLEOF = 10
    HASSUBEVENT = 11
    HASPREREQUISITE = 12
    DESIRES = 13
    CREATEDBY = 14
    SYMBOLOF = 15
    CAUSESDESIRE = 16
    MADEOF = 17
    RECEIVESACTION = 18
    DESIREDBY = 19
    CREATES = 20
    CAUSEDBY = 21
    DONEBY = 22
    DESIRECAUSEDBY = 23
    DONETO = 24
    RELATEDTO = 25

    def __init__(self):
        self.relations = [
            "TYPEOF", 
            "PARTOF", 
            "HASPROPERTY", 
            "USEDFOR", 
            "ATLOCATION", 
            "CAUSES", 
            "MOTIVATEDBY", 
            "OBSTRUCTEDBY", 
            "MANNEROF", 
            "LOCATEDNEAR", 
            # "HASAGENT", 
            # "HASPATIENT", 
            "CAPABLEOF",
            "HASSUBEVENT",
            "HASPREREQUISITE",
            "DESIRES",
            "CREATEDBY",
            "SYMBOLOF",
            "CAUSESDESIRE",
            "MADEOF",
            "RECEIVESACTION",
            "DESIREDBY",
            "CREATES",
            "CAUSEDBY",
            "DONEBY",
            "DESIRECAUSEDBY",
            "DONETO",
            "RELATEDTO"
            ]
        assert len(self.relations) == self.RELATEDTO + 1
        self.translate_dict = dict(zip(self.relations , range(len(self.relations))))

    def has_relation(self, relation):
        relation = relation.upper()
        return relation in self.relations

    def translate(self, relation):
        return self.translate_dict[relation.upper()]

RELATIONS = Relations()
PROMPT_TEMPLATES = {
    RELATIONS.TYPEOF: 
        ["List {N} types of {topic}."],
    RELATIONS.PARTOF:
        ["List {N} parts or aspects of {topic}."], 
    RELATIONS.LOCATEDNEAR:
        ["List {N} things that often locates near {topic}."], 
    RELATIONS.ATLOCATION:
        ["List {N} locations {topic} could appear in."], 
    RELATIONS.USEDFOR:
        ["List {N} things {topic} could be used for."], 
    RELATIONS.HASPROPERTY:
        ["List {N} descriptions of {topic}."], 
    RELATIONS.DESIRES:
        ["List {N} things that {topic} desires."],
    RELATIONS.DESIREDBY:
        ["List {N} entities that desire {topic}."],
    RELATIONS.CREATES:
        ["List {N} things that {topic} creates."],
    RELATIONS.CREATEDBY:
        ["List {N} creators of {topic}."],
    RELATIONS.SYMBOLOF:
        ["List {N} symbols of {topic}."],
    RELATIONS.MADEOF:
        ["List {N} materials of {topic}."],
    # actions/events
    RELATIONS.MANNEROF:
        ["List {N} ways to do {topic}."], 
    # RELATIONS.HASAGENT:
    #     ["List {N} groups that perform {topic}."], 
    # RELATIONS.HASPATIENT:
    #     ["List {N} groups that are targeted by {topic}."], 
    RELATIONS.MOTIVATEDBY:
        ["List {N} motivations behind {topic}."], 
    RELATIONS.OBSTRUCTEDBY:
        ["List {N} things or entities against {topic}."], 
    RELATIONS.CAUSES:
        ["List {N} consequences of {topic}."],
    RELATIONS.CAUSEDBY:
        ["List {N} things that cause {topic}."], 
    RELATIONS.CAPABLEOF:
        ["List {N} things that {topic} is capble of."], 
    RELATIONS.DONEBY:
        ["List {N} entities that can do {topic}."],
    RELATIONS.HASSUBEVENT:
        ["List {N} subevents of {topic}."],
    RELATIONS.HASPREREQUISITE:
        ["List {N} prerequisites of {topic}."],
    RELATIONS.CAUSESDESIRE:
        ["List {N} desires caused by {topic}."],
    RELATIONS.DESIRECAUSEDBY:
        ["List {N} things that cause desire of {topic}.",],
    RELATIONS.RECEIVESACTION:
        ["List {N} actions that can be done to {topic}."],
    RELATIONS.DONETO:
        ["List {N} entities that {topic} can be done to."],
    # the most generic relation
    RELATIONS.RELATEDTO:
        ["List {N} concepts related to {topic}."], 
}

NL_DESCRIPTIONS = {
    RELATIONS.TYPEOF:
        ["has subtype"],
    RELATIONS.PARTOF:
        ["has part"],
    RELATIONS.LOCATEDNEAR:
        ["located near"],
    RELATIONS.ATLOCATION:
        ["located at"],
    RELATIONS.USEDFOR:
        ["used for"],
    RELATIONS.HASPROPERTY:
        ["has description"],
    RELATIONS.DESIRES:
        ["desires"],
    RELATIONS.DESIREDBY:
        ["desired by"],
    RELATIONS.CREATES:
        ["creates"],
    RELATIONS.CREATEDBY:
        ["created by"],
    RELATIONS.SYMBOLOF:
        ["symbol of"],
    RELATIONS.MADEOF:
        ["made of"],

    RELATIONS.MANNEROF:
        ["done via"],
    RELATIONS.MOTIVATEDBY:
        ["motivated by"],
    RELATIONS.OBSTRUCTEDBY:
        ["obstructed by"],
    RELATIONS.CAUSES:
        ["causes"],
    RELATIONS.CAUSEDBY:
        ["caused by"],
    
    RELATIONS.CAPABLEOF:
        ["capable of"],
    RELATIONS.DONEBY:
        ["done by"],
    RELATIONS.HASSUBEVENT:
        ["has subevent"],
    RELATIONS.HASPREREQUISITE:
        ["has prerequisite"],
    RELATIONS.CAUSESDESIRE:
        ["causes desire"],
    RELATIONS.DESIRECAUSEDBY:
        ["desire caused by"],
    RELATIONS.RECEIVESACTION:
        ["receives action"],
    RELATIONS.DONETO:
        ["done to"],

    RELATIONS.RELATEDTO:
        ["related to"]
}