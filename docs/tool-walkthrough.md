## Main-View: Topic Tree

The main view of this tool is a **topic tree** that helps users to explore related topics/conceprs for a given ML task. 

Suppose our task is to detect a sentence's stance on feminism and the seed topic is **feminism**. The topic tree will show related topics (e.g., sex objectification, gender pay gap) along with their relation to the parent topic.

<p align="center">
  <img src="images/tree-view.png" />
</p>

### Topics and relations
Each node in the tree is a topic along with its relation to the parent topic.
For example, 'feminism' has a subtype 'ecofeminism'.
Four different actions will also show up when you float over a topic.

<p align="center">
  <img src="images/topic.png" />
</p>


### Creating examples
When you find an interesting topic, you could click on 
![image](icons/search.svg)
or simply the topic name to start creating examples. 
See [next section](#crafting-examples) for details on using the Example Panel.

### Exploring More Topics
After you run out of interesting topics to explore, you could always expand a topic by clicking on 
![image](icons/triangle.svg). Relevant sub-topics will show up.

If you want to see more sub-topics for a given topic, just click on the line ![image](icons/more-topic.svg) $\textcolor{grey}{\textsf{Show more subtopics for "topic"}}$.

### Adding/Deleting Topics Manually
Alternatively, you could also add manual topics you find interesting by clicking on ![image](icons/add-topic.svg).
Delete irrelvant topics by clicking on ![image](icons/delete-topic.svg).

### Highlighting Topics
The topics will be automatically highlighted 
(checked ![image](icons/checked-box.svg)) 
when you start adding examples. You can manually unhighlight topics you no longer find interesting or find hard to exploit 
(![image](icons/unchecked-box.svg)).


## Crafting Examples

The example panel shows all examples you create for a given topic. 
In the user study, we expect you to find at least **three** failing examples before moving on to other topics.

<p align="center">
  <img src="images/example-panel.png" width="75%"/>
</p>

You could start crafting examples by either asking for model suggestions 
(![image](icons/refresh.svg) Suggestions) 
or writing your own examples 
(![image](icons/add-example.svg) Add Examples).

Click the textbox to edit the inputs. Submit the edits by 'shift + Enter'. Model predictions and confidence will be updated upon submission.

### Adding suggested examples
The suggested examples will be in a blue background color. If you find a suggested example interesting, add it to the user examples by clicking on 
![image](icons/add-example.svg) or [marking examples as pass/fail](#marking-examples-as-passfail).
Make sure you add all interesting suggestions before refreshing.

### Marking examples as pass/fail
All examples will be marked as pass by default. You should inspect examples carefully and determine whether the predictions match the ground truth. If yes, click on 
![image](icons/pass.svg) to confirm.
Otherwise, click on
![image](icons/fail.svg) to mark it as fail.

The output (ground truth) will be automatically updated when you mark examples (same as predictions when pass; "UNKNOWN" otherwise). Optionally, you could edit the outputs to reflect what you desire.

### Organizing examples
Sometimes examples will fit better in another topic when you further explore the topic tree. In that case, just drag the example to that topic for better organization.

## Undoing Actions
If you accidentally perform any incorrect actions, you could always undo it by clicking on
![image](icons/back.svg) at the upper-left corner. Alternatively, you could also use keyboard shortcuts Ctrl/Cmd +Z.

## Summarizing findings
Use the toggle (Checked Topics Only: ![image](icons/toggle.svg)) to show only the highlighted topics. You could use it to view all topics you have explored and summarize your findings.
