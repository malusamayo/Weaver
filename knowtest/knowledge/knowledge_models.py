import json
from os.path import exists
from os import getenv
from revChatGPT.Official import Chatbot
import openai


class LanguageModel(object):
    def __init__(self):
        pass

    def __call__(self):
        pass


class ChatGPTModel(LanguageModel):

    def __init__(self, config_file):
        super().__init__()
        self.model = Chatbot(self.config(config_file)["api_key"])

    def config(self, config_file):
        with open(config_file, encoding="utf-8") as f:
            config = json.load(f)
        return config

    def __call__(self, prompt, rollback=True):
        response = self.model.ask(prompt)
        # print(response)
        if rollback:
            self.model.rollback(1)
        return response["choices"][0]["text"]


if __name__ == "__main__":
    model = ChatGPTModel()
    model('Hi!')