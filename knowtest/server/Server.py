from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Body
import asyncio
import uvicorn
import threading
from fastapi.responses import FileResponse
import os
import sys
from datetime import datetime
from .Tree import Tree, Node
import logging
from functools import wraps
from pydantic import BaseModel
from typing import Optional
from ..knowledge.model import Model
import argparse

def log_timestamped_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Log timestamp and function name
        arg_str = ' |#| '.join([repr(arg) for arg in args] + [f'{key}={repr(value)}' for key, value in kwargs.items()])
        logging.info(f'{datetime.now()} |#| {func.__name__} |#| {arg_str}')
        # Call the function
        return func(*args, **kwargs)
    return wrapper

class ExampleRow(BaseModel):
    nodeId: str
    exampleId: Optional[str]
    exampleText: str
    exampleTrue: str
    isSuggested: bool
    exampleOffTopic: bool


class CapabilityApp:
    def __init__(self, topic: str, file_directory: str="./output/", model_dir:str="", uid:str="", serverHost: str="0.0.0.0", serverPort: int=3001, is_baseline_mode: bool=False, overwrite: bool=False, generator_specs=None):
        self.file_directory = file_directory
        self.topic = topic
        self.is_baseline_mode = is_baseline_mode
        self.uid = uid

        # Create the output directory if it doesn't exist
        if not os.path.exists(self.file_directory):
            os.makedirs(self.file_directory)
        if not os.path.exists(os.path.join(self.file_directory, "usr")):
            os.makedirs(os.path.join(self.file_directory, "usr"))
        if not os.path.exists(os.path.join(self.file_directory, "kg")):
            os.makedirs(os.path.join(self.file_directory, "kg"))

        self.model = Model.create(path=model_dir)
        self.generator_specs=generator_specs
        self.change_topic(topic, overwrite=overwrite)

        self.serverHost = serverHost
        self.serverPort = serverPort
        self.serverRunning = False

        self.app = FastAPI()

        @self.app.get("/")
        @log_timestamped_calls
        def get_tree():
            # t.reset_state()
            return self.t.generate_json()
        
        @self.app.get("/getLabels")
        def get_labels():
            # t.reset_state()
            if hasattr(self.model, "labels"):
                return self.model.labels
            return []

        @self.app.post("/addNode")
        @log_timestamped_calls
        def add_node(parentID: str, nodeName: str, nodeTag: str):
            node = Node(name=nodeName, parent_id=parentID, tags=[nodeTag])
            self.t.add_node(node, user_added=True)
            self.t.set_highlight(node.id, True)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/editFolderName")
        @log_timestamped_calls
        def edit_folder_name(nodeId: str, newName: str):
            self.t.rename_node(nodeId, newName)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/deleteNode")
        @log_timestamped_calls
        def delete_node(nodeId: str):
            self.t.remove_node_with_id(nodeId)
            self.t.write_json()
            return self.t.generate_json()
        
        @self.app.post("/moveNode")
        @log_timestamped_calls
        def move_node(nodeId: str, newParentId: str):
            self.t.move_node(nodeId, newParentId)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/setOpen")
        @log_timestamped_calls
        def set_open(nodeId: str, isOpen: bool):
            self.t.set_open(nodeId, isOpen)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/setHighlighted")
        @log_timestamped_calls
        def set_highlight(nodeId: str, isHighlighted: bool):
            updatedNode = self.t.set_highlight(nodeId, isHighlighted)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.get("/getNodePath")
        @log_timestamped_calls
        def get_node_path(nodeId: str):
            print("Getting node path for: ", nodeId)
            return self.t.get_node_path(nodeId)

        @self.app.post("/setNodeTag")
        @log_timestamped_calls
        def set_node_tag(nodeId: str, tag: str):
            print("Setting node tag ({}) for: {}".format(tag, nodeId))
            self.t.set_node_tag(nodeId, tag)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/setTagFilter")
        @log_timestamped_calls
        def set_tag_filter(tags: str):
            tags = tags.split(",")
            print("Setting tag filter: ", tags)
            self.t.set_tag_filter(tags)
            return self.t.generate_json()

        @self.app.post("/resetTagFilter")
        @log_timestamped_calls
        def reset_tag_filter():
            print("Resetting tag filter")
            self.t.set_tag_filter([])
            return self.t.generate_json()

        @self.app.get("/getSuggestions")
        @log_timestamped_calls
        def get_suggestion(nodeId: str):
            print("Getting suggestion for: ", nodeId)
            self.t.set_open(nodeId, True)
            self.t.refresh_suggestions(nodeId)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/removeSimilarRelationSiblings")
        @log_timestamped_calls
        def remove_similar_relation_siblings(nodeId: str, tag: str):
            # print("Removing similar relation children for {} with tag {}".format(t.nodes[t.nodes[nodeId].parent_id], relation))
            self.t.remove_same_relation_sibling(nodeId, tag)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.post("/addSimilarRelationSiblings")
        @log_timestamped_calls
        def add_similar_relation_siblings(nodeId: str, tag: str):
            print("Adding siblings with relation: ", tag)
            self.t.add_relation_based_suggestions_sibling(nodeId, tag)
            self.t.write_json()
            return self.t.generate_json()

        @self.app.get("/previousState")
        @log_timestamped_calls
        def previous_state():
            print("Going to previous state")
            self.t.load_last_state()
            return self.t.generate_json()

        @self.app.get("/isBackAvailable")
        def is_back_available():
            return self.t.is_back_available()

        @self.app.get("/resetState")
        @log_timestamped_calls
        def reset_state():
            print("Resetting state")
            self.t.reset_state()

        @self.app.get("/getTopics")
        @log_timestamped_calls
        def get_topics(isHighlighted: bool):
            self.t.set_only_highlighted(isHighlighted)
            return self.t.generate_json()

        @self.app.get("/toggleIsHighlightedSelection")
        def toggle_is_highlighted_selection():
            return self.t.only_highlighted
        
        @self.app.get("/isBaselineMode")
        def toggle_is_highlighted_selection():
            return self.t.is_baseline_mode
        
        @self.app.post("/addExample")
        @log_timestamped_calls
        def add_example(exampleRow: ExampleRow):
            nodeId, example_text, example_true, is_suggested, example_off_topic = exampleRow.nodeId, exampleRow.exampleText, exampleRow.exampleTrue, exampleRow.isSuggested, exampleRow.exampleOffTopic
            example_predicted, example_conf = "-", 0
            newRow = self.t.add_example(nodeId, example_text, example_true, example_predicted, example_conf, is_suggested, example_off_topic)
            self.t.write_json()
            return self.t.get_example_list(nodeId)
        
        @self.app.post("/moveExample")
        @log_timestamped_calls
        def drag_example(nodeId: str, exampleId: str, newNodeId: str):
            self.t.switch_example_node(nodeId, exampleId, newNodeId)
            self.t.write_json()
            return self.t.get_example_list(nodeId)
        
        @self.app.post("/removeExample")
        @log_timestamped_calls
        def remove_example(nodeId: str, exampleId: str):
            self.t.remove_example(nodeId, exampleId)
            self.t.write_json()
            return self.t.get_example_list(nodeId)
        
        @self.app.get("/getExampleList")
        @log_timestamped_calls
        def get_example_list(nodeId: str):
            return self.t.get_example_list(nodeId)

        @self.app.post("/updateExample")
        @log_timestamped_calls
        def update_example(exampleRow: ExampleRow):
            nodeId, example_id, example_text, example_true, is_suggested, example_off_topic = exampleRow.nodeId, exampleRow.exampleId, exampleRow.exampleText, exampleRow.exampleTrue, exampleRow.isSuggested, exampleRow.exampleOffTopic
            
            old_example = self.t.get_example(nodeId, example_id)
            example_predicted, example_conf = old_example.examplePredicted, old_example.exampleConfidence
            if example_text != old_example.exampleText:
                logging.info(f'{datetime.now()} |#| update_example |#| EXAMPLE TEXT CHANGED')
                example_predicted, example_conf = self.model.predict(example_text) # always predict when updating

            # logging stuffs
            if is_suggested != old_example.isSuggested:
                logging.info(f'{datetime.now()} |#| update_example |#| EXAMPLE MOVED FROM SUGGESTED')
            if example_true != old_example.exampleTrue:
                logging.info(f'{datetime.now()} |#| update_example |#| EXAMPLE GROUND TRUTH CHANGED')
            
            updatedRow = self.t.update_example(nodeId, example_id, example_text, example_true, example_predicted, example_conf, is_suggested, example_off_topic)
            self.t.write_json()
            print("Setting example: ", example_text, " to ", is_suggested)
            return updatedRow.__JSON__()

        @self.app.get("/getMoreExamples")
        @log_timestamped_calls
        def get_more_examples(nodeId: str):
            suggested_examples = self.t.suggest_examples(nodeId)
            self.t.clear_suggested_examples(nodeId)
            for exampleText in suggested_examples:
                example_predicted, example_conf = self.model.predict(exampleText)
                self.t.add_example(nodeId, exampleText, "", example_predicted, example_conf, isSuggested=True, exampleOffTopic=False)
            self.t.write_json()
            return self.t.get_example_list(nodeId)
        
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def change_topic(self, topic: str, overwrite: bool = False):
        self.t = Tree(topic=topic, file_directory=self.file_directory, uid=self.uid, is_baseline_mode=self.is_baseline_mode, overwrite=overwrite, generator_specs=self.generator_specs)
        self.t.write_json()

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
    # parase arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('--topic', type=str, default='hate speech', help='topic of the dataset')
    parser.add_argument('--file_directory', type=str, default='output/', help='directory of the dataset')
    parser.add_argument('--model_dir', type=str, default='', help='directory of the model')
    parser.add_argument('--serverHost', type=str, default='172.24.20.95', help='host of the server')
    parser.add_argument('--serverPort', type=int, default=3001, help='port of the server')
    parser.add_argument('--uid', type=str, default='', help='uid of the user')
    parser.add_argument('--baseline', action='store_true', help='whether to use baseline mode')
    parser.add_argument('--overwrite', action='store_true', help='whether to overwrite the existing history')
    parser.add_argument('--no_server', action='store_true', help='whether to start the server')
    args = parser.parse_args()

    server = CapabilityApp(
            topic=args.topic, 
            file_directory=args.file_directory,
            model_dir=args.model_dir,
            serverHost=args.serverHost,
            serverPort=args.serverPort,
            uid=args.uid,
            is_baseline_mode=args.baseline,
            overwrite=args.overwrite
        )
    if not args.no_server:
        server.initializeServer()