import pandas as pd
import numpy as np
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.tokenize import word_tokenize
from .relations import to_nl_description
from .model import MyGPT2LMHeadModel

# import nltk
# nltk.download('punkt')
# nltk.download('wordnet')
# nltk.download('omw-1.4')

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
        self.embdCache = None

    def compute_embeddings(self, topics):
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

    def get_embeddings(self, topics):
        sentence_embeddings = [None] * len(topics)
        if self.embdCache is None:
            return self.compute_embeddings(topics)
        
        sentence_embeddings = self.embdCache.read_embeddings(topics)
        unk_topics = [topic for topic, embd in zip(topics, sentence_embeddings) if embd is None]
        if len(unk_topics) > 0:
            unk_embeddings = self.compute_embeddings(unk_topics)
            # convert to a list of numpy arrays
            unk_embeddings = [embd for embd in unk_embeddings]
            self.embdCache.cache_embeddings(unk_topics, unk_embeddings)
            sentence_embeddings = self.embdCache.read_embeddings(topics)
        sentence_embeddings = torch.cat([embd.unsqueeze(0) for embd in sentence_embeddings], dim=0)
        return sentence_embeddings

    def similarity(self, topic, topics):
        sentence_embeddings = self.get_embeddings([topic] + topics)
        scores = pairwise_cosine_similarity(sentence_embeddings[0:1], sentence_embeddings[1:])
        return scores

    def similarity_matrix(self, topics):
        sentence_embeddings = self.get_embeddings(topics)
        scores = pairwise_cosine_similarity(sentence_embeddings, sentence_embeddings)
        return scores

    def score(self, items, parent_topic):
        def to_sentence(item):
            (topic, relation) = item['to'], item['relation']
            sentence = to_nl_description(topic, relation, parent_topic)
            return sentence

        sentences = [to_sentence(item) for item in items]
        scores = self.similarity_matrix(sentences)
        return scores

    def setEmbCache(self, embdCache):
        self.embdCache = embdCache

PScorer = PerplexityScorer()
SScorer = SimilarityScorer()

def compute_weights(node, nodes, w_E, w_V, alpha=1):
    return w_E[node][nodes].mean() * alpha + w_V[node] 

def add_nodes(cur_nodes, nodes, w_E, w_V, K, alpha=1):
    w_ls = []
    for node in nodes:
        w = compute_weights(node, cur_nodes, w_E, w_V, alpha=alpha)
        w_ls.append(w)
    
    # if sampling:
    #     prob = F.softmax(-torch.tensor(w_ls), dim=0)

    #     prob_topk, idx_topk = torch.topk(prob, K)
    #     prob_topk = prob_topk.numpy()
    #     prob_topk /= prob_topk.sum()
        
    #     idx_m = np.random.choice(idx_topk, p=prob_topk)
    # else:
    idx_m = np.array(w_ls).argmin() # select node with minimum weight: minimize both perplexity and similarity
    
    return cur_nodes + [nodes[idx_m]], nodes[:idx_m] + nodes[idx_m+1:] 

def greedy_collect(nodes, known_nodes, w_E, w_V, K, alpha=1):
    cur_nodes = known_nodes
    remaining_nodes = nodes
    while len(cur_nodes) < K:
        cur_nodes, remaining_nodes = add_nodes(cur_nodes, remaining_nodes, w_E, w_V, K=K, alpha=alpha)
    cur_nodes = [node for node in cur_nodes if node not in known_nodes]
    return cur_nodes

def remove_nodes(known_nodes, nodes, w_E, w_V, K, alpha=1):
    w_ls = []
    for node in nodes:
        remaining_nodes = [n for n in nodes if n != node]
        w = compute_weights(node, known_nodes + remaining_nodes, w_E, w_V, alpha=alpha)
        w_ls.append(w)
    
    # if sampling:
    #     prob = F.softmax(torch.tensor(w_ls), dim=0)

    #     prob_topk, idx_topk = torch.topk(prob, K)
    #     prob_topk = prob_topk.numpy()
    #     prob_topk /= prob_topk.sum()
        
    #     idx_m = np.random.choice(idx_topk, p=prob_topk)
    # else:
    idx_m = np.array(w_ls).argmax() 
    
    return nodes[:idx_m] + nodes[idx_m+1:] 

def sort_nodes(nodes, w_E, w_V, alpha=1):
    w_ls = [w_V[node] for node in nodes]
    sorted_pairs = sorted(zip(nodes, w_ls), key=lambda x: x[1])
    sorted_nodes = [node for node, _ in sorted_pairs] 
    return sorted_nodes

def greedy_peeling(nodes, known_nodes, w_E, w_V, K, alpha=1):
    K -= len(known_nodes) # adjust K for peeling
    cur_nodes = nodes
    while len(cur_nodes) > K:
        cur_nodes = remove_nodes(known_nodes, cur_nodes, w_E, w_V, K=K, alpha=alpha)
    cur_nodes = sort_nodes(cur_nodes, w_E, w_V, alpha=alpha)
    return cur_nodes

def deduplicate_items(items):
    seen = set()
    new_items = []
    for item in items:
        if item['to'] not in seen:
            seen.add(item['to'])
            new_items.append(item)
    return new_items

def recommend_topics(items, parent_topic, known_items=[], K=10, alpha=1, randomization=False, embdCache=None):
    ''' Select K topics from the pool of topics.
    Parameters:
    ----------
    items: list of dict {to, relation, score}    
        The pool of topics to be selected from.
    parent_topic: str
        The parent topic.
    known_items: list of dict {to, relation}
        The topics that are already known (selected).
    K: int
        The number of topics to be selected.
    alpha: float
        The weight of the perplexity score, used to control the trade-off between relevance and diversity.
    randomization: bool
        Whether to randomize scores.
    Returns:
    -------
    selected_items: list of dict {to, relation}
        The selected topics.
    '''
    items = deduplicate_items(items) # [TODO] could use multi-tagging to avoid this
    topics = [item['to'] for item in items]
    scores = [item['score'] for item in items] # stored perplexity scores

    nodes = list(range(len(topics)))
    known_topics = [item['to'] for item in known_items]
    known_nodes = [node for node in nodes if topics[node] in known_topics]
    filtered_nodes = [node for node in nodes if node not in known_nodes]
    K += len(known_nodes)

    w_V = np.array(scores)
    w_V = (w_V - w_V.min()) / (w_V.max() - w_V.min()) # scale to [0,1]

    SScorer.setEmbCache(embdCache)
    w_E = SScorer.score(items, parent_topic) # [0, 1]

    # use random Gaussian noise to bring in some randomness (exploration)
    if randomization:
        w_V += np.random.normal(0, 0.1, size=w_V.shape) # [TODO] adjust the scale

    # selected_ids = greedy_peeling(filtered_nodes, known_nodes, w_E, w_V, K, alpha=alpha)
    selected_ids = greedy_collect(filtered_nodes, known_nodes, w_E, w_V, K, alpha=1)

    selected_items = [items[i] for i in selected_ids]
    return selected_items

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
def normalize(topic):
    tokens = word_tokenize(topic)
    lemmatized_words = [lemmatizer.lemmatize(token) for token in tokens]
    return ' '.join(lemmatized_words)

def postprocess_to_list(text, sep):
    text = text.strip().strip(sep).rstrip(sep).lower()
    words = text.split(sep)
    words = [normalize(word) for word in words]
    return words

def is_subtopic(topic, candidate):
    # Returns true if candidate is a subtopic of topic
    # Both arguments are strings, which look like UNIX paths
    # Return is boolean
    #return True if re.search(r"^%s(/|$)" % re.escape(topic), candidate) else False
    if len(topic)==len(candidate):
        return topic == candidate
    else:
        return candidate.startswith(topic) and candidate[len(topic)]=='/'