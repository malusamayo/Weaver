import json
from os.path import exists
from os import getenv
import os
# from revChatGPT.Official import Chatbot
import openai
import tiktoken

from tenacity import (
    retry,
    stop_after_attempt,
    wait_random_exponential,
)  # for exponential backoff

class LanguageModel(object):
    def __init__(self):
        pass

    def __call__(self):
        pass

# class ChatGPTModel(LanguageModel):

#     def __init__(self, config_file):
#         super().__init__()
#         self.model = Chatbot(self.config(config_file)["api_key"])

#     def config(self, config_file):
#         with open(config_file, encoding="utf-8") as f:
#             config = json.load(f)
#         return config

#     def __call__(self, prompt, rollback=True):
#         response = self.model.ask(prompt)
#         # print(response)
#         if rollback:
#             self.model.rollback(1)
#         return response["choices"][0]["text"]


ENCODER = tiktoken.get_encoding("gpt2")
def get_max_tokens(prompt: str) -> int:
    """
    Get the max tokens for a prompt
    """
    return 4000 - len(ENCODER.encode(prompt))

class GPT3Model(LanguageModel):

    def __init__(self, api_key: str = None) -> None:
        super().__init__()
        openai.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        assert openai.api_key is not None, "Please provide an OpenAI API key"

    def _get_completion(
        self,
        prompt: str,
        temperature: float = 0.5,
        stream: bool = False,
    ):
        """
        Get the completion function
        """
        return openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=temperature,
            max_tokens=256,
            stop=["\n\n\n"],
            stream=stream,
        )

    @retry(wait=wait_random_exponential(min=2, max=60), stop=stop_after_attempt(6))
    def __call__(self, prompt):
        response = self._get_completion(prompt)
        return response["choices"][0]["text"]

class ChatGPTModel(LanguageModel):
    def __init__(self, sys_msg: str, api_key: str = None) -> None:
        super().__init__()
        openai.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        assert openai.api_key is not None, "Please provide an OpenAI API key"
        self.sys_msg = {"role": "system", "content": sys_msg}

    @retry(wait=wait_random_exponential(min=2, max=60), stop=stop_after_attempt(6))
    def __call__(self, messages):
        messages = [self.sys_msg] + messages
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        message = response["choices"][0]["message"]
        return message

if __name__ == "__main__":
    model = GPT3Model()
    print(model('Hi!'))