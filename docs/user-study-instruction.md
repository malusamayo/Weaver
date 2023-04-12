## Instructions

In the study, you will test two different ML models using our tool, with two different setups.

Your goal is to find important bugs for topics that you think the model should handle.

You are expected to find 3 failing examples for a tested topic before claiming there is a 'bug'. 
ML models often fail at similar examples under the same topic -- try to exploit this when you create examples!

### Tutorial Session

Before you start the actual user tasks, you will first try our tool on an example task. 
You will learn how to use the tool ([docs here](tool-walkthrough.md)) and what you should do in the user tasks.

**Example Task**: Given a restaurant review, the model will classify the review's sentiment as 'positive', 'negative', or 'neutral'.

- Input: "I had a great experience at the restaurant! The food was delicious. Highly recommend!"
    - Output: 'positive'
- Input: "The service was slow and the waitstaff was unhelpful."
    - Output: 'negative'
- Input: "The food at the restaurant was average. The service was friendly and the atmosphere was pleasant."
    - Output: 'neutral'

### User Study Overview

#### Tasks

**Task 1**:
Given a sentence about feminism, the model will classify the sentence's stance as 'favor', 'against', or 'none'.

- Input: "Feminism is about creating a world where everyone is respected and valued."
    - Output: 'favor'
- Input: "Feminism is a distraction from real issues. #NoFeminism"
    - Output: 'against'
- Input: "Feminism has been a source of debate and discussion in many circles."
    - Output: 'none'

**Task 2**:
Given a fact-checking question about nutrition, the model will provide a concise answer.

- Input: "Are low-fat foods healthier than high-fat foods?"
    - Output: "No, low-fat foods are not necessarily healthier than high-fat foods."
- Input: "Is there strong evidence that drinking wine moderately is good for your health?"
    - Output: "No, the scientific evidence that moderate wine consumption is good for health is not strong"
- Input: "What happens if you eat after 8pm?"
    - Output: "Eating after 8pm does not have any impact on weight gain"

#### Models
A language model instructed to perform the target tasks. 

#### Setups

**Setup 1 (Knowledge graph mode)**:
The topic tree will be built from a knowledge graph. It will guide you find important topics.

**Setup 2 (Manual mode)**:
You create examples and discover topics (possibly from examples) on your own. You may still be able to query related topics.



