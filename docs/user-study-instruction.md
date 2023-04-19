## Instructions

In the study, your goal is to **find important bugs in ML models**.

Not every failing prediction is a bug. To consider something a bug, we expect 2 conditions:
- We can find multiple related inputs for which the model fails
- The inputs are important enough to the task that the model should be fixed. 

To facilitate finding bugs, we recommend exploring the model in terms of **topics**, that is, different kinds of concepts that the model should cover or support. To declare something a bug, you will need **3** failing inputs that are related to a topic.

### Tutorial Session

During this interactive tutorial session, we will provide you guidance on how to effectively utilize our tool to test the example model. 

The tutorial session has a similar struture to the actual user study sessions. The session consists of two parts:
- In the first part, your objective is to identify significant bugs in the model, covering a broad range of topics.
- In the second part, you will be asked to identify interesting topics for future testing.

You will get familiar with what you will do in the user study, as well as explore different functionalities of the tool.

**Example Model**: Given a restaurant review, the model will classify the review's sentiment as 'positive', 'negative', or 'neutral'.

- Input: "I had a great experience at the restaurant! The food was delicious. Highly recommend!"
    - Output: 'positive'
- Input: "The service was slow and the waitstaff was unhelpful."
    - Output: 'negative'
- Input: "The food at the restaurant was average. The service was friendly and the atmosphere was pleasant."
    - Output: 'neutral'

### User Study Overview

During the user study session, you will be tasked with testing two distinct models. For each model, you will have a designated timeframe of 30 minutes. You will spend first 25 minutes to identify bugs and the final 5 minutes to identify topics for future testing. We will ask you to stop when the time is up for each subsession. All your findings will be automatically saved. 

For one of the models, we will grant you access to the topic knowledge graph provided by our tool. For the other model, you will need to create examples and brainstorm topics on your own.

For both tasks, you should try to **find as many bugs as possible** and **cover a broad range of topics**. For each bug, you are expected to find **three** failing examples and group them under the most relevant topic.

#### Models

**Model 1**:
Given a sentence, the model will classify the sentence's stance on feminism as 'favor', 'against', or 'none'.

- Input: "Women are often underrepresented in leadership positions."
    - Output: 'favor'
- Input: "Women's earning potentials are simply less than men's."
    - Output: 'against'
- Input: "Feminism has been a source of debate and discussion in many circles."
    - Output: 'none'

**Model 2**:
Given a sentence, the model will classify the sentence's stance on combating climate change as 'favor', 'against', or 'none'.

- Input: "Air pollution is causing respiratory illnesses."
    - Output: 'favor'
- Input: "Littering has no impact on the environment."
    - Output: 'against'
- Input: "Climate change is hard to solve by research"
    - Output: 'none'
