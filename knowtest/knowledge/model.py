import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline

class Model(object):
    def __init__(self):
        pass

    def __call__(self, example):
        pass

class ClassificationModel(Model):
    
    def __init__(self, model, tokenizer) -> None:
        self.pipeline = pipeline("text-classification", model=model, tokenizer=tokenizer)

    def __call__(self, example):
        return self.pipeline(example)

if __name__ == "__main__":
    tokenizer = AutoTokenizer.from_pretrained("unitary/toxic-bert")
    model = AutoModelForSequenceClassification.from_pretrained("unitary/toxic-bert")
    model = ClassificationModel(model=model, tokenizer=tokenizer)
    print(model("I love you"))