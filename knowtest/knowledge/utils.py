import pandas as pd
import numpy as np
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.tokenize import word_tokenize
from .relations import RELATIONS, NL_DESCRIPTIONS
from .model import MyGPT2LMHeadModel

class PerplexityScorer:

    def __init__(self):
        model_string = 'gpt2'
        self.tokenizer = GPT2Tokenizer.from_pretrained(model_string)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        self.pad_token_id = self.tokenizer(self.tokenizer.pad_token)['input_ids'][0]
        self.model = MyGPT2LMHeadModel.from_pretrained(model_string)
        self.model.pad_token_id = self.pad_token_id
        self.model.eval()
    
    def score(self, sentences):
        encoded_sentences = self.tokenizer(sentences, padding=True, truncation=True, return_tensors='pt')
        input_ids = encoded_sentences['input_ids']
        
        with torch.no_grad():
            outputs = self.model(input_ids, labels=input_ids)
        loss, logits = outputs[:2]

        loss = loss.view(logits.size(0), -1)
        mask = loss!=0
        sentence_prob = (loss*mask).sum(dim=1)/mask.sum(dim=1)
        return sentence_prob

    
    # def score_unadjusted(self, sentences):
    #     encoded_sentences = self.tokenizer(sentences, padding=True, truncation=True, return_tensors='pt')
    #     input_ids = encoded_sentences['input_ids']
    #     with torch.no_grad():
    #         outputs = self.model(input_ids, labels=input_ids)
    #     loss, logits = outputs[:2]
    #     sentence_prob = loss.view(logits.size(0), -1).mean(dim=1)
    #     return sentence_prob

    # def score(self, sentences):
    #     encoded_sentences = self.tokenizer(sentences, padding=True, truncation=True, return_tensors='pt')
    #     input_ids = encoded_sentences['input_ids']
    #     pad_cnt = torch.count_nonzero(torch.where(input_ids == self.encoded_pad_token, input_ids, 0), dim=1)
        
    #     with torch.no_grad():
    #         outputs = self.model(input_ids, labels=input_ids)
    #     loss, logits = outputs[:2]
    #     loss = loss.view(logits.size(0), -1)
        
    #     sentence_prob = []
    #     for i, _ in enumerate(loss):
    #         if pad_cnt[i] > 0:
    #             prob = loss[i][:-pad_cnt[i]].mean()
    #         else:
    #             prob = loss[i].mean()
    #         sentence_prob.append(prob.item())
    #     return sentence_prob

    def score_topics(self, topics, parent_topic):
        sentences = []
        for topic in topics:
            sentence = f"{topic} often occurs in the context of {parent_topic}."
            sentences.append(sentence)
        scores = self.score(sentences)
        return scores


def pairwise_cosine_similarity(x, y):
    norm = torch.norm(x, p=2, dim=1)
    x = x / norm.unsqueeze(1)
    norm = torch.norm(y, p=2, dim=1)
    y = y / norm.unsqueeze(1)
    distance = x @ y.T
    return distance


class SimilarityScorer:

    def __init__(self):
        # models for sentence similarity
        model_string = 'sentence-transformers/all-MiniLM-L6-v2'
        self.tokenizer = AutoTokenizer.from_pretrained(model_string)
        self.model = AutoModel.from_pretrained(model_string)

    def get_embeddings(self, topics):
        tokenizer = self.tokenizer
        model = self.model
        
        encoded_input = tokenizer(topics, padding=True, truncation=True, return_tensors='pt')

        # Compute token embeddings
        with torch.no_grad():
            model_output = model(**encoded_input)

        #Mean Pooling - Take attention mask into account for correct averaging
        def mean_pooling(model_output, attention_mask):
            token_embeddings = model_output[0] #First element of model_output contains all token embeddings
            input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
            return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

        # Perform pooling
        sentence_embeddings = mean_pooling(model_output, encoded_input['attention_mask'])

        # Normalize embeddings
        sentence_embeddings = F.normalize(sentence_embeddings, p=2, dim=1)
        return sentence_embeddings


    def similarity(self, topic, topics):
        sentence_embeddings = self.get_embeddings([topic] + topics)
        scores = pairwise_cosine_similarity(sentence_embeddings[0:1], sentence_embeddings[1:])
        return scores

    def similarity_matrix(self, topics):
        sentence_embeddings = sentence_embeddings = self.get_embeddings(topics)
        scores = pairwise_cosine_similarity(sentence_embeddings, sentence_embeddings)
        return scores

    def score(self, items, parent_topic):
        def to_sentence(item):
            (topic, relation) = item
            if RELATIONS.has_relation(relation):
                relation = RELATIONS.translate(relation)
                (descrp, pos) = NL_DESCRIPTIONS[relation]
                if pos == 0:
                    sentence = f"{topic} {descrp} {parent_topic}."
                else:
                    sentence = f"{parent_topic} {descrp} {topic}."
            else:
                assert True, "Relation not found"
            return sentence

        sentences = [to_sentence(item) for item in items]
        scores = self.similarity_matrix(sentences)
        return scores

PScorer = PerplexityScorer()
SScorer = SimilarityScorer()

def compute_weights(node, nodes, w_E, w_V, alpha=1):
    scale = max(1, len(nodes)) * alpha
    return w_E[node][nodes].sum() + w_V[node] * scale

def add_nodes(cur_nodes, nodes, w_E, w_V, alpha=1):
    w_ls = []
    for node in nodes:
        w = compute_weights(node, cur_nodes, w_E, w_V, alpha=alpha)
        w_ls.append(w)
    idx_m = np.array(w_ls).argmin() # select node with minimum weight: minimize both perplexity and similarity
    return cur_nodes + [nodes[idx_m]], nodes[:idx_m] + nodes[idx_m+1:] 

def add_nodes_sampling(cur_nodes, nodes, w_E, w_V, K, alpha=1):
    w_ls = []
    for node in nodes:
        w = compute_weights(node, cur_nodes, w_E, w_V, alpha=alpha)
        w_ls.append(w)
    
    prob = F.softmax(-torch.tensor(w_ls), dim=0)

    prob_topk, idx_topk = torch.topk(prob, K)
    prob_topk = prob_topk.numpy()
    prob_topk /= prob_topk.sum()
    
    idx_m = np.random.choice(idx_topk, p=prob_topk)
    return cur_nodes + [nodes[idx_m]], nodes[:idx_m] + nodes[idx_m+1:] 

def greedy_collect(nodes, w_E, w_V, K, alpha=1):
    cur_nodes = []
    remaining_nodes = nodes
    while len(cur_nodes) < K:
        cur_nodes, remaining_nodes = add_nodes(cur_nodes, remaining_nodes, w_E, w_V, alpha=alpha)
    return cur_nodes

def greedy_collect_sampling(nodes, w_E, w_V, K, alpha=1):
    cur_nodes = []
    remaining_nodes = nodes
    while len(cur_nodes) < K:
        cur_nodes, remaining_nodes = add_nodes_sampling(cur_nodes, remaining_nodes, w_E, w_V, K, alpha=alpha)
    return cur_nodes

def recommend_topics(items, parent_topic, K=10, alpha=1, sampling=False):
    topics = [item[0] for item in items]

    nodes = list(range(len(topics)))

    w_V = PScorer.score_topics(topics, parent_topic) # higher perplexity -> lower relevance
    w_V = np.array(w_V)
    w_V = (w_V - w_V.min()) / (w_V.max() - w_V.min()) # scale to [0,1]

    w_E = SScorer.score(items, parent_topic) # [0, 1]

    if sampling:
        selected_ids = greedy_collect_sampling(nodes, w_E, w_V, K, alpha=alpha)
    else:
        selected_ids = greedy_collect(nodes, w_E, w_V, K, alpha=alpha)
    return [items[i] for i in selected_ids]

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
def normalize(topic):
    tokens = word_tokenize(topic)
    lemmatized_words = [lemmatizer.lemmatize(token) for token in tokens]
    return ' '.join(lemmatized_words)