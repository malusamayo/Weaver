import React, { useState, useEffect, useRef } from "react";
import {fetchAPIDATA} from "../../utils";
import { examplePanel } from "./ExamplePanel.css";

const ExamplePanel = ({node}) => {

    // uddate the node state when the node prop changes
    const [selectedNode, setSelectedNode] = useState(null)

    useEffect(() => {
        console.log("node: ", node)

        // Check if node was deleted while clicking on it
        

        if (node) {
            setSelectedNode(node.node)
        }
    }, [node])

    // Set example-panel-container top to the bottom of menu_top_tree_toolbar
    useEffect(() => {
        const examplePanelContainer = divRef.current;
        const menuTopTreeToolbar = document.getElementById("menu_top_tree_toolbar");
        const menuTopTreeToolbarBox = menuTopTreeToolbar.getBoundingClientRect();

        examplePanelContainer.style.top = menuTopTreeToolbarBox.bottom + 20 + "px";
    }, [])
        

    const divRef = useRef(null);

    return (
        <div className="example-panel" ref={divRef}>
            <div className="example-panel__content">
                <h1>Example Panel</h1>
                {selectedNode &&
                    <div>
                        <p>Node ID: {selectedNode.id}</p>
                        <p>Node Name: {selectedNode.name}</p>
                        <p>Node Tag: {selectedNode.tag}</p>
                    </div>
                }
            </div>
        </div>
    )
}

export { ExamplePanel };