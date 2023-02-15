from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
import uvicorn
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse, HTMLResponse
from CapabilityTesting.Tree import Tree, Node
import requests
import os


from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='build')
app.debug = True

if not os.path.exists("Data"):
    os.mkdir("Data")

filename = ""
t = Tree()

@app.route('/app', defaults={'path': ''}) 
@app.route('/app/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route("/")
def get_tree():
    return t.generate_json(sorting=True)

@app.route("/addNode/parentID=<parent_id>&nodeName=<name>&nodeTag=<tag>")
def add_node(parent_id: str, name: str, tag: str):
    node = Node(name=name, parent_id=parent_id, tags=[tag])
    t.add_node(node)
    t.set_highlight(node.id, True)
    t.write_csv(filename)
    return t.generate_json()

@app.route("/editFolderName/nodeId=<node_id>&newName=<new_name>")
def edit_folder_name(node_id: str, new_name: str):
    t.rename_node(node_id, new_name)
    t.write_csv(filename)
    return t.generate_json()

@app.route("/delete/nodeId=<node_id>")
def delete_node(node_id: str):
    t.remove_node_with_id(node_id)
    t.write_csv(filename)
    return t.generate_json()

@app.route("/setOpen/nodeId=<node_id>&isOpen=<bool>")
def set_open(node_id: str, bool: bool):
    t.set_open(node_id, bool)
    t.write_csv(filename)
    return t.generate_json()

@app.route("/setHighlighted/nodeId=<node_id>&isHighlighted=<bool>")
def set_highlight(node_id: str, bool: bool):
    t.set_highlight(node_id, bool)
    t.write_csv(filename)
    return t.generate_json()

@app.route("/getNodePath/nodeId=<node_id>")
def get_node_path(node_id: str):
    print("Getting node path for: ", node_id)
    return t.get_node_path(node_id)

@app.route("/setNodeTag/nodeId=<node_id>&tag=<tag>")
def set_node_tag(node_id: str, tag: str):
    print("Setting node tag ({}) for: {}".format(tag, node_id))
    t.set_node_tag(node_id, tag)
    t.write_csv(filename)
    return t.generate_json()

@app.route("/selectTopic/topic=<topic>")
def select_topic(topic: str):
    print("Selecting topic: ", topic)

    filename = "Data/{}.csv".format(topic)
    if not os.path.exists(filename):
        t = Tree(topic=topic)
        t.write_csv(filename)
    else:
        t = Tree(filename=filename)
    print(t.generate_json())
    return t.generate_json()

@app.route("/shutdown")
def shutdown():
    os._exit(0)


# origins = [
#     "http://localhost:3000",
#     "http://127.0.0.1:5001"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# make a function to launch the server and another to stop it
def launch(port: int = 3003):
    app.run(use_reloader=False, port=port, threaded=True)

def stop():
    requests.get("http://localhost:3003/shutdown")

if __name__ == '__main__':
    app.run(use_reloader=True, port=5001, threaded=True)
