from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Body
import asyncio
import uvicorn
import threading
from fastapi.responses import FileResponse
import os
import sys
from .Tree import Tree, Node
import logging
from pydantic import BaseModel
from typing import Optional


class ExampleRow(BaseModel):
    nodeId: str
    exampleId: Optional[str]
    exampleText: str
    exampleTrue: str
    isSuggested: bool
    exampleOffTopic: bool


class CapabilityApp:
    def __init__(self, topic: str, filename: str="../output/", serverHost: str="0.0.0.0", serverPort: int=3001):
        self.filename = filename
        self.topic = topic
        self.topic = "_".join(topic.split(" "))
        self.filepath = self.filename + self.topic + ".json"
        self.change_topic(topic)

        self.serverHost = serverHost
        self.serverPort = serverPort
        self.serverRunning = False

        self.app = FastAPI()

        @self.app.get("/")
        def get_tree():
            # t.reset_state()
            return self.t.generate_json()

        @self.app.post("/addNode")
        def add_node(parentID: str, nodeName: str, nodeTag: str):
            node = Node(name=nodeName, parent_id=parentID, tags=[nodeTag])
            self.t.add_node(node)
            self.t.set_highlight(node.id, True)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/editFolderName")
        def edit_folder_name(nodeId: str, newName: str):
            self.t.rename_node(nodeId, newName)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/deleteNode")
        def delete_node(nodeId: str):
            self.t.remove_node_with_id(nodeId)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/setOpen")
        def set_open(nodeId: str, isOpen: bool):
            self.t.set_open(nodeId, isOpen)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/setHighlighted")
        def set_highlight(nodeId: str, isHighlighted: bool):
            self.t.set_highlight(nodeId, isHighlighted)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.get("/getNodePath")
        def get_node_path(nodeId: str):
            print("Getting node path for: ", nodeId)
            return self.t.get_node_path(nodeId)

        @self.app.post("/setNodeTag")
        def set_node_tag(nodeId: str, tag: str):
            print("Setting node tag ({}) for: {}".format(tag, nodeId))
            self.t.set_node_tag(nodeId, tag)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/setTagFilter")
        def set_tag_filter(tags: str):
            tags = tags.split(",")
            print("Setting tag filter: ", tags)
            self.t.set_tag_filter(tags)
            return self.t.generate_json()

        @self.app.post("/resetTagFilter")
        def reset_tag_filter():
            print("Resetting tag filter")
            self.t.set_tag_filter([])
            return self.t.generate_json()

        @self.app.get("/getSuggestions")
        def get_suggestion(nodeId: str):
            print("Getting suggestion for: ", nodeId)
            self.t.set_open(nodeId, True)
            self.t.refresh_suggestions(nodeId)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/removeSimilarRelationSiblings")
        def remove_similar_relation_siblings(nodeId: str, tag: str):
            # print("Removing similar relation children for {} with tag {}".format(t.nodes[t.nodes[nodeId].parent_id], relation))
            self.t.remove_same_relation_sibling(nodeId, tag)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.post("/addSimilarRelationSiblings")
        def add_similar_relation_siblings(nodeId: str, tag: str):
            print("Adding siblings with relation: ", tag)
            self.t.add_relation_based_suggestions_sibling(nodeId, tag)
            self.t.write_json(self.filepath)
            return self.t.generate_json()

        @self.app.get("/previousState")
        def previous_state():
            print("Going to previous state")
            self.t.load_last_state(self.filepath)
            return self.t.generate_json()

        @self.app.get("/isBackAvailable")
        def is_back_available():
            return self.t.is_back_available()

        @self.app.get("/resetState")
        def reset_state():
            print("Resetting state")
            self.t.reset_state()

        @self.app.get("/getTopics")
        def get_topics(isHighlighted: bool):
            self.t.set_only_highlighted(isHighlighted)
            return self.t.generate_json()

        @self.app.get("/toggleIsHighlightedSelection")
        def toggle_is_highlighted_selection():
            return self.t.only_highlighted
        
        @self.app.post("/addExample")
        def add_example(exampleRow: ExampleRow):
            nodeId, example_text, example_true, is_suggested, example_off_topic = exampleRow.nodeId, exampleRow.exampleText, exampleRow.exampleTrue, exampleRow.isSuggested, exampleRow.exampleOffTopic
            # TODO: Predict
            example_predicted = "True"
            self.t.add_example(nodeId, example_text, example_true, example_predicted, is_suggested, example_off_topic)
            self.t.write_json(self.filepath)
            return self.t.get_example_list(nodeId)
        
        @self.app.post("/removeExample")
        def remove_example(nodeId: str, exampleId: str):
            self.t.remove_example(nodeId, exampleId)
            self.t.write_json(self.filepath)
            return self.t.get_example_list(nodeId)
        
        @self.app.get("/getExampleList")
        def get_example_list(nodeId: str):
            return self.t.get_example_list(nodeId)

        @self.app.post("/updateExample")
        def update_example(exampleRow: ExampleRow):
            nodeId, example_id, example_text, example_true, is_suggested, example_off_topic = exampleRow.nodeId, exampleRow.exampleId, exampleRow.exampleText, exampleRow.exampleTrue, exampleRow.isSuggested, exampleRow.exampleOffTopic
            # TODO: Predict
            example_predicted = "Predicted"
            updatedRow = self.t.update_example(nodeId, example_id, example_text, example_true, example_predicted, is_suggested, example_off_topic)
            self.t.write_json(self.filepath)
            print("Setting example: ", example_text, " to ", is_suggested)
            return updatedRow.__JSON__()

        @self.app.get("/getMoreExamples")
        def get_more_examples(nodeId: str):
            self.t.add_more_suggested_examples(nodeId)
            self.t.write_json(self.filepath)
            return self.t.get_example_list(nodeId)
        
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def change_topic(self, topic: str):
        self.topic = "_".join(topic.split(" "))
        self.filepath = self.filename + self.topic + ".json"

        if not os.path.exists(self.filepath):
            self.t = Tree(topic=topic)
            self.t.write_json(self.filepath)
        else:
            self.t = Tree(topic=topic, filename=self.filepath)

    def initializeServer(self):

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        def run(loop):
            asyncio.set_event_loop(loop)
            self.running = True
            while self.running:
                uvicorn.run(self.app, host=self.serverHost, port=self.serverPort, log_level="error")
        
        print("Starting server on port: ", self.serverPort)
        thread = threading.Thread(target=run, args=(loop,))
        thread.start()
    
    def stopServer(self):
        print("Stopping server")
        self.running = False

        
if __name__ == "__main__":
    server = CapabilityApp(topic="hate speech", filename='output/', serverHost='172.24.20.95')
    server.initializeServer()
    # uvicorn.run(server.app, host="0.0.0.0", port=3001, log_level="info")