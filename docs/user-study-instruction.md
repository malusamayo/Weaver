## Instructions

In the study, your goal is to **find important bugs in ML models**.

To find bugs, we recommend exploring the model in terms of **topics**, that is, different kinds of topics that the model should cover or support. For example, a sentiment analysis model on restaurant reviews might do well on reviews on *take-out food* but struggle with reviews on *background music*. You should explore a diverse range of topics and test the model comprehensively.

To declare there is a bug, we expect 2 conditions:
- You find at least **3** failing inputs on a topic.
- The inputs are **important** enough to the task that the model should be fixed. 

### Tutorial Session

During this interactive tutorial session, you will get familiar with what you will do in the user study, as well as explore different functionalities of the tool.

The tutorial session has the same struture as the actual user study sessions. The session consists of two parts:
- Task 1: Identify **significant bugs** in the model, covering a broad range of topics.
- Task 2: Identify **important topics** for future testing (imagine you will spend another day testing the model).


**Example Model**: Given a restaurant review, the model will classify the review's sentiment as 'positive', 'negative', or 'neutral'.

- Input: "I had a great experience at the restaurant! The food was delicious. Highly recommend!"
    - Output: 'positive'
- Input: "The service was slow and the waitstaff was unhelpful."
    - Output: 'negative'
- Input: "The food at the restaurant was average. The service was friendly and the atmosphere was pleasant."
    - Output: 'neutral'

### User Study Overview

The user study session is of the same structure as the tutorial session you have completed. You will test two different models for two 30-minute sessions. Each session consists of two parts:
- Task 1 (25 mins): Identify **significant bugs** in the model, covering a broad range of topics.
- Task 2 (5 mins): Identify **important topics** for future testing (imagine you will spend another day testing the model).

For both tasks, you should try to **find as many bugs as possible** and **cover a broad range of topics**. For each bug, you are expected to find **3** failing examples under the most relevant topic.
We will ask you to stop when the time is up for each task. 

For one of the models, we will grant you access to the topic knowledge graph provided by our tool. For the other model, you will need to create examples and brainstorm topics on your own.

Continue by clicking on the group you are assigned to:
[Group 1](#group-1),
[Group 2](#group-2),
[Group 3](#group-3),
[Group 4](#group-4).

---

#### Group 1

**Model 1**:
You do NOT have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on feminism as 'favor', 'against', or 'none'.

- Input: "Women are often underrepresented in leadership positions."
    - Output: 'favor'
- Input: "Women's earning potentials are simply less than men's."
    - Output: 'against'
- Input: "Feminism has been a source of debate and discussion in many circles."
    - Output: 'none'

**Model 2**:
You have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on combating climate change as 'favor', 'against', or 'none'.

- Input: "Air pollution is causing respiratory illnesses."
    - Output: 'favor'
- Input: "Littering has no impact on the environment."
    - Output: 'against'
- Input: "Climate change is a pressing issue but it is hard to solve by research"
    - Output: 'none'


#### Group 2

**Model 1**:
You have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on feminism as 'favor', 'against', or 'none'.

- Input: "Women are often underrepresented in leadership positions."
    - Output: 'favor'
- Input: "Women's earning potentials are simply less than men's."
    - Output: 'against'
- Input: "Feminism has been a source of debate and discussion in many circles."
    - Output: 'none'

**Model 2**:
You do NOT have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on combating climate change as 'favor', 'against', or 'none'.

- Input: "Air pollution is causing respiratory illnesses."
    - Output: 'favor'
- Input: "Littering has no impact on the environment."
    - Output: 'against'
- Input: "Climate change is a pressing issue but it is hard to solve by research"
    - Output: 'none'

#### Group 3

**Model 1**:
You do NOT have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on combating climate change as 'favor', 'against', or 'none'.

- Input: "Air pollution is causing respiratory illnesses."
    - Output: 'favor'
- Input: "Littering has no impact on the environment."
    - Output: 'against'
- Input: "Climate change is a pressing issue but it is hard to solve by research"
    - Output: 'none'

**Model 2**:
You have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on feminism as 'favor', 'against', or 'none'.

- Input: "Women are often underrepresented in leadership positions."
    - Output: 'favor'
- Input: "Women's earning potentials are simply less than men's."
    - Output: 'against'
- Input: "Feminism has been a source of debate and discussion in many circles."
    - Output: 'none'


#### Group 4

**Model 1**:
You have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on combating climate change as 'favor', 'against', or 'none'.

- Input: "Air pollution is causing respiratory illnesses."
    - Output: 'favor'
- Input: "Littering has no impact on the environment."
    - Output: 'against'
- Input: "Climate change is a pressing issue but it is hard to solve by research"
    - Output: 'none'

**Model 2**:
You do NOT have access to topic knowledge graph when testing this model.

Given a sentence, the model will classify the sentence's stance on feminism as 'favor', 'against', or 'none'.

- Input: "Women are often underrepresented in leadership positions."
    - Output: 'favor'
- Input: "Women's earning potentials are simply less than men's."
    - Output: 'against'
- Input: "Feminism has been a source of debate and discussion in many circles."
    - Output: 'none'
