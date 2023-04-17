import numpy as np
import json
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from transformers import pipeline
from typing import Optional, Tuple, Union
import torch
from torch.nn import BCEWithLogitsLoss, CrossEntropyLoss, MSELoss
from transformers.modeling_outputs import (
    BaseModelOutputWithPastAndCrossAttentions,
    CausalLMOutputWithCrossAttentions,
    SequenceClassifierOutputWithPast,
    TokenClassifierOutput,
)
from .knmodel import ChatGPTModel

class MyGPT2LMHeadModel(GPT2LMHeadModel):

    def forward(
        self,
        input_ids: Optional[torch.LongTensor] = None,
        past_key_values: Optional[Tuple[Tuple[torch.Tensor]]] = None,
        attention_mask: Optional[torch.FloatTensor] = None,
        token_type_ids: Optional[torch.LongTensor] = None,
        position_ids: Optional[torch.LongTensor] = None,
        head_mask: Optional[torch.FloatTensor] = None,
        inputs_embeds: Optional[torch.FloatTensor] = None,
        encoder_hidden_states: Optional[torch.Tensor] = None,
        encoder_attention_mask: Optional[torch.FloatTensor] = None,
        labels: Optional[torch.LongTensor] = None,
        use_cache: Optional[bool] = None,
        output_attentions: Optional[bool] = None,
        output_hidden_states: Optional[bool] = None,
        return_dict: Optional[bool] = None,
    ) -> Union[Tuple, CausalLMOutputWithCrossAttentions]:
        r"""
        labels (`torch.LongTensor` of shape `(batch_size, sequence_length)`, *optional*):
            Labels for language modeling. Note that the labels **are shifted** inside the model, i.e. you can set
            `labels = input_ids` Indices are selected in `[-100, 0, ..., config.vocab_size]` All labels set to `-100`
            are ignored (masked), the loss is only computed for labels in `[0, ..., config.vocab_size]`
        """
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict

        transformer_outputs = self.transformer(
            input_ids,
            past_key_values=past_key_values,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
            position_ids=position_ids,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            encoder_hidden_states=encoder_hidden_states,
            encoder_attention_mask=encoder_attention_mask,
            use_cache=use_cache,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
        )
        hidden_states = transformer_outputs[0]

        # Set device for model parallelism
        if self.model_parallel:
            torch.cuda.set_device(self.transformer.first_device)
            hidden_states = hidden_states.to(self.lm_head.weight.device)

        lm_logits = self.lm_head(hidden_states)

        loss = None
        if labels is not None:
            # Shift so that tokens < n predict n
            shift_logits = lm_logits[..., :-1, :].contiguous()
            shift_labels = labels[..., 1:].contiguous()
            # Flatten the tokens
            loss_fct = CrossEntropyLoss(reduction='none', ignore_index=self.pad_token_id)
            loss = loss_fct(shift_logits.view(-1, shift_logits.size(-1)), shift_labels.view(-1))

        if not return_dict:
            output = (lm_logits,) + transformer_outputs[1:]
            return ((loss,) + output) if loss is not None else output

        return CausalLMOutputWithCrossAttentions(
            loss=loss,
            logits=lm_logits,
            past_key_values=transformer_outputs.past_key_values,
            hidden_states=transformer_outputs.hidden_states,
            attentions=transformer_outputs.attentions,
            cross_attentions=transformer_outputs.cross_attentions,
        )


class Model(object):
    def __init__(self):
        pass

    def __call__(self, example):
        pass

    @staticmethod
    def create(path="") -> None:
        if path.endswith("classification.json"):
            with open(path, 'r') as f:
                specs = json.load(f)
            return GPTClassificationModel(specs['task'], specs['labels'])
        elif path.endswith(".json"):
            with open(path, 'r') as f:
                specs = json.load(f)
            return GPTGenerationModel(specs['role'], specs["answer_style"])
        else:
            return HuggingfaceClassificationModel(path)

class ClassificationModel(Model):
    def __init__(self):
        pass

    def __call__(self, example):
        pass

class HuggingfaceClassificationModel(ClassificationModel):
    
    def __init__(self, path="") -> None:
        self.translate_dict = {
            'LABEL_0': 'NEGATIVE',
            'LABEL_1': 'POSITIVE'
        }
        if path != "":
            self.tokenizer = AutoTokenizer.from_pretrained(path)
            self.model = AutoModelForSequenceClassification.from_pretrained(path)
            self.pipeline = pipeline("text-classification", model=self.model, tokenizer=self.tokenizer)
        else:
            self.pipeline = pipeline("text-classification")

    def __call__(self, example):
        preds = self.pipeline(example)
        for pred in preds:
            pred['label'] = self.translate_label(pred['label'])
        return preds

    def translate_label(self, label):
        if label in self.translate_dict:
            return self.translate_dict[label]
        return label

    def predict(self, example):
        '''
        example: str
            The input example
        ----------
        return: str
            The predicted label
        '''
        return self(example)[0]['label'], self(example)[0]['score']

    def predict_batch(self, examples):
        '''
        example: List[str]
            The input examples
        ----------
        return: str
            The predicted labels
        '''
        preds = self(examples)
        return [(pred['label'], pred['score']) for pred in preds]
    
class GPTClassificationModel(ClassificationModel):

    def __init__(self, task="a sentence's sentiment", labels=['positive', 'negative']) -> None:
        label_msg = '", "'.join(labels[:-1])
        label_msg = '"' + label_msg + '" or "' + labels[-1] + '"'
        self.task = task
        self.labels = labels
        self.sys_msg = '' 
        # f'''You are a classification model. You are classifying {task}.
        # The labels are {label_msg}. You should only keep the label as your answer.'''
        self.prompt_msg = f'''Carefully classify {task}. The labels are {label_msg}. Only reply with the label.\n'''
        self.model = ChatGPTModel(self.sys_msg, temparature=0)

    def __call__(self, example):
        prompts = [{"role": "user", "content": self.prompt_msg + f"Sentence: {example}"}]
        response = self.model(prompts)
        response_lower = response['content'].lower()
        label_in_response = [label for label in self.labels if label in response_lower]
        if len(label_in_response) == 1:
            return label_in_response[0]
        elif len(label_in_response) > 1:
            return 'FAILURE_MULTIPLE_LABELS'
        else:
            return 'FAILURE_NO_LABEL'
    
    def predict(self, example):
        '''
        example: str
            The input example
        ----------
        return: str
            The predicted label
        '''
        return self(example), 1 # Alternatively, sample multiple times and compute frequency
    
class GPTGenerationModel(Model):
    
    def __init__(self, role="expert", answer_style="") -> None:
        self.answer_style = answer_style
        self.sys_msg = f'''You are an {role}.'''
        self.model = ChatGPTModel(self.sys_msg, temparature=0.7)

    def __call__(self, example):
        prompts = [{"role": "user", "content": f"Question: {example} {self.answer_style}"}]
        response = self.model(prompts)
        return response['content']
    
    def predict(self, example):
        return self(example), 1
        

if __name__ == "__main__":
    model = GPTClassificationModel(task = "a sentence's stance on feminism", labels = ["favor", "against", "none"])
    print(model.predict("Gender-based violence is an issue that must be addressed."))
    model = GPTGenerationModel(role = "nutrition expert")
    print(model.predict("How does banana help your health?"))
    # print(model.predict_batch(["I love you", "I hate you"]))