## Instructions

In the study, you will test two different ML models using our tool, with two different setups.

Your goal is to
1. Find important topics that you think the model should handle, and then
2. Try to craft failing examples for the model under testing.

You are expected to find 3 failing examples for a tested topic before claiming there is a 'bug'.  

Our tool consists of two main components to assist your task. 
1. The topic tree panel (left) guides you to find important topics
2. The example panel (right) helps you craft examples

You will find more details on our tool [here](tool-walkthrough.md).

### Tutorial Session

Before you start the actual user tasks, you will first try our tool on an example task. 
You will learn how to use the tool and what you should do in the user tasks.

**Example Task**: Given a sentence about climate change, the model will classify the sentence's stance as 'favor', 'against', or 'none'.

### User Study Overview

#### Tasks

**Task 1**:
Given a sentence about feminism, the model will classify the sentence's stance as 'favor', 'against', or 'none'.

**Task 2**:
[TBD]

#### Models

**Model 1**:
A fine-tuned model on the task-related dataset from Huggingface.

**Model 2**:
A language model instructed to perform the target task, with few-shot prompting. 

#### Setups

**Setup 1**:
Knowledge graph mode: The topic tree will be built from a knowledge graph. It will guide you find important topics.

**Setup 1**:
Manual mode: You mostly need to create your own topics manually, but you are still able to ask for related topics.



