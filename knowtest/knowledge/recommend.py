from .knmodel import ChatGPTModel
from .utils import postprocess_to_list

sys_msg = '''
You are a topic selection algorithm. User will provide the topics separated by ' # '.
You should select most related yet diverse topics from these topics, using the exact words.
Do make sure the selected topics are diverse enough.
Your response should also be separated by ' # '.
'''

select_msg = '''
You should select the most related yet diverse topics from these topics, using the exact words.
Do make sure the selected topics are diverse enough.
Your response should also be separated by ' # '.
'''

def deduplicate_items(items):
    seen = set()
    new_items = []
    for item in items:
        if item['to'] not in seen:
            seen.add(item['to'])
            new_items.append(item)
    return new_items

class Recommender(object):
    
    def __init__(self):
        self.model = ChatGPTModel(sys_msg)
        self.conversation = {}
        self.sep = '#'

    def recommend_topics(self, items, parent_topic, known_items=[], K=10):
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
        Returns:
        -------
        selected_items: list of dict {to, relation}
            The selected topics.
        '''
        if parent_topic not in self.conversation:
            items = deduplicate_items(items) # [TODO] could use multi-tagging to avoid this
            topics = [item['to'] for item in items]
            topic_msg = ' # '.join(topics)
            pool_msg = {"role": "user", "content": "Here is the pool of all topics: " + topic_msg}
            self.conversation[parent_topic] = [pool_msg]
        
        # [TODO] check if all items are in the pool

        new_msg = {"role": "user", "content": f"Select {K} topics." + select_msg}
        self.conversation[parent_topic].append(new_msg)
        response = self.model(self.conversation[parent_topic])
        self.conversation[parent_topic].append(response)
        selected_items = postprocess_to_list(response['content'], self.sep)
        return selected_items

if __name__ == '__main__':
    recommender = Recommender()
    items = [
                {'to': 'stereotyping', 'relation': 'USEDFOR'},
                {'to': 'discrimination', 'relation': 'MANNEROF'},
                {'to': 'hate', 'relation': 'DESIRECAUSEDBY'},
                {'to': 'marginalization', 'relation': 'HASSUBEVENT'},
                {'to': 'stereotyping', 'relation': 'RELATEDTO'},
                {'to': 'white privilege', 'relation': 'RELATEDTO'},
                {'to': 'discrimination', 'relation': 'PARTOF'},
                {'to': 'fear', 'relation': 'CAPABLEOF'},
                {'to': 'exploitation', 'relation': 'DESIRES'},
                {'to': 'racial profiling', 'relation': 'RELATEDTO'}
            ]
    selected_items = recommender.recommend_topics(items, 'hate speech', K=5)
    print(selected_items)