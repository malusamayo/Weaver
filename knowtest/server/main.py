from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.responses import FileResponse
from Tree import Tree, Node
import os

# checkif ./Data folder exists and create it if not
# if not os.path.exists("Data"):
#     os.mkdir("Data")

filename = "../../output/data.csv"
t = Tree(filename=filename)
app = FastAPI()

@app.get("/")
def get_tree():
    return t.generate_json(sorting=True)

@app.get("/addNode/parentID={parent_id}&nodeName={name}&nodeTag={tag}")
def add_node(parent_id: str, name: str, tag: str):
    node = Node(name=name, parent_id=parent_id, tags=[tag])
    t.add_node(node)
    t.set_highlight(node.id, True)
    t.write_csv(filename)
    return t.generate_json()

@app.get("/editFolderName/nodeId={node_id}&newName={new_name}")
def edit_folder_name(node_id: str, new_name: str):
    t.rename_node(node_id, new_name)
    t.write_csv(filename)
    return t.generate_json()

@app.get("/deleteNode/nodeId={node_id}")
def delete_node(node_id: str):
    t.remove_node_with_id(node_id)
    t.write_csv(filename)
    return t.generate_json()

@app.get("/setOpen/nodeId={node_id}&isOpen={bool}")
def set_open(node_id: str, bool: bool):
    t.set_open(node_id, bool)
    t.write_csv(filename)
    return t.generate_json()

@app.get("/setHighlighted/nodeId={node_id}&isHighlighted={bool}")
def set_highlight(node_id: str, bool: bool):
    t.set_highlight(node_id, bool)
    t.write_csv(filename)
    return t.generate_json()

@app.get("/getNodePath/nodeId={node_id}")
def get_node_path(node_id: str):
    print("Getting node path for: ", node_id)
    return t.get_node_path(node_id)

@app.get("/setNodeTag/nodeId={node_id}&tag={tag}")
def set_node_tag(node_id: str, tag: str):
    print("Setting node tag ({}) for: {}".format(tag, node_id))
    t.set_node_tag(node_id, tag)
    t.write_csv(filename)
    return t.generate_json()

@app.get("/selectTopic/topic={topic}")
def select_topic(topic: str):
    print("Selecting topic: ", topic)

    filename = "Data/{}.csv".format(topic)
    if not os.path.exists(filename):
        t = Tree(topic=topic)
        t.write_csv(filename)
    else:
        t = Tree(filename=filename)

    return t.generate_json()

@app.get("/setTagFilter/tags={tags}")
def set_tag_filter(tags: str):
    tags = tags.split(",")
    print("Setting tag filter: ", tags)
    t.set_tag_filter(tags)
    return t.generate_json()

@app.get("/resetTagFilter")
def reset_tag_filter():
    print("Resetting tag filter")
    t.set_tag_filter([])
    return t.generate_json()

@app.get("/getSuggestions/nodeId={node_id}")
def get_suggestion(node_id: str):
    print("Getting suggestion for: ", node_id)
    t.set_open(node_id, bool)
    t.refresh_suggestions(node_id)
    t.write_csv(filename)
    return t.generate_json()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:5001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)