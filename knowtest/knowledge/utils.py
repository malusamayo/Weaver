from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.tokenize import word_tokenize
import pandas as pd

def rank_relations(topic, path, existing_children):
    pass

def rank_topics(parent_topic, topics, path, existing_children):
    pass

# models for sentence similarity
tokenizer = None 
model = None

def get_embeddings(topics):
    global tokenizer, model
    if tokenizer is None:
        tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
    if model is None:
        model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
    
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

def pairwise_cosine_similarity(x, y):
    norm = torch.norm(x, p=2, dim=1)
    x = x / norm.unsqueeze(1)
    norm = torch.norm(y, p=2, dim=1)
    y = y / norm.unsqueeze(1)
    distance = x @ y.T
    return distance

def similarity(topic, topics):
    sentence_embeddings = get_embeddings([topic] + topics)
    scores = pairwise_cosine_similarity(sentence_embeddings[0:1], sentence_embeddings[1:])
    return scores

def similarity_matrix(topics):
    sentence_embeddings = sentence_embeddings = get_embeddings(topics)
    scores = pairwise_cosine_similarity(sentence_embeddings, sentence_embeddings)
    return scores

def relevancy(topic, topics):
    pass

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
def normalize(topic):
    tokens = word_tokenize(topic)
    lemmatized_words = [lemmatizer.lemmatize(token) for token in tokens]
    return ' '.join(lemmatized_words)