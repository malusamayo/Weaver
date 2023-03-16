import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {fetchAPIDATA} from "../../utils";
import { examplePanel } from "./ExamplePanel.css";
import { HiOutlineBan } from "react-icons/hi";
import { FaLongArrowAltRight } from "react-icons/fa";
import { GoDiffAdded } from "react-icons/go";
import { BiRefresh } from "react-icons/bi";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { Row } from "./Row";
import { v4 as uuidv4 } from "uuid";
import { useTreeContext } from "../state/TreeContext";

const ExamplePanel = ({node}) => {

    // uddate the node state when the node prop changes
    const [selectedNodeExamples, setSelectedNodeExamples] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const { setIsLoading } = useTreeContext();

    // Add blank row when the ExamplePanel is first rendered
    

    useEffect(() => {
        if (node) {
            setSelectedNodeExamples([]);
            setSelectedNode(node.node);
            commitGetExample();
        }
    }, [node]);

    useLayoutEffect(() => {
        if (selectedNode) {
            commitGetExample();
        }
    }, [selectedNode]);

    useEffect(() => {
        const examplePanelContainer = divRef.current;
        const menuTopTreeToolbar = document.getElementById("menu_top_tree_toolbar");
        const menuTopTreeToolbarBox = menuTopTreeToolbar.getBoundingClientRect();

        examplePanelContainer.style.top = menuTopTreeToolbarBox.bottom + 20 + "px";
    }, []);

    const blankRowAdd = (text) => {
        const blankExample = {
            "id": uuidv4(),
            "exampleText": text,
            "exampleTrue": "True",
            "examplePredicted": "",
            "isSuggested": false,
            "exampleOffTopic": false,
        }

        return blankExample;
    };

    const commitGetExample = async () => {
        try {
            setIsLoading(true);
            console.log("Getting examples for node");
            const newDataExamples = await fetchAPIDATA("getExampleList/nodeId=" + node.node.id);

            // If there are no examples, add a blank row
            if (newDataExamples.length === 0) {
                const blankRow = blankRowAdd("Click \"Add\" to add an example");
                setSelectedNodeExamples([blankRow]);
            } else {
                setSelectedNodeExamples(newDataExamples);
            }
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitAddBlankRow = async (blankRow) => {

        try {
            setIsLoading(true);

            const newDataExamples = await fetchAPIDATA("addExample/nodeId=" + selectedNode.id + 
                "&exampleText=" + blankRow.exampleText + 
                "&exampleTrue=" + blankRow.exampleTrue + 
                "&isSuggested=" + blankRow.isSuggested + 
                "&exampleOffTopic=" + blankRow.exampleOffTopic);
            setSelectedNodeExamples(newDataExamples);
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };   


    const handleAddBlankRow = () => {
        const blankRow = blankRowAdd("Add an example");
        commitAddBlankRow(blankRow);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {     
            
            if ((event.metaKey || event.ctrlKey) && event.key === "Backspace") {
                commitDeleteRow();
            }
        };
        
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

    useEffect(() => {
        setSelectedRow(selectedRow);
    });

    const commitDeleteRow = async() => {
        if (selectedRow) {
            try {
                setIsLoading(true);
                console.log("Deleting example")
                const newDataExamples = await fetchAPIDATA("removeExample/nodeId=" + selectedNode.id +
                    "&exampleId=" + selectedRow);
                setSelectedNodeExamples(newDataExamples);
                setIsLoading(false);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
    };

    const divRef = useRef(null);

    return (
        <div className="example-panel" ref={divRef}>
            <div className="example-panel__content">
                <h4>Example Panel</h4>
                {selectedNode &&
                    <div>
                        <p>Topic: {selectedNode.name}</p>   
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <p><u>Suggested Examples</u></p>
                            <div style={{display: "flex", alignItems: "top"}}>
                                {/* <p style={{marginRight: "5px"}}>Suggest Examples</p> */}
                                <BiRefresh style={{fontSize: "20px", opacity: "1"}}/>
                            </div>
                        </div>
                        <table className="example-panel-selected-table">
                            <thead>
                            <tr>
                                <td>Input</td>
                                <td></td>
                                <td>Output</td>
                                <td>Off-topic</td> 
                                <td>Pass</td>
                                <td>Fail</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                selectedNodeExamples.map((example, index) => {
                                    if (example.isSuggested === true) {
                                        return (
                                            <Row 
                                                exampleData={example}
                                                key={index}
                                                setSelectedRow={setSelectedRow}
                                                selectedRow={selectedRow}
                                                nodeId={selectedNode.id}
                                                setSelectedNodeExamples={setSelectedNodeExamples}
                                            />

                                        )
                                    }
                                })
                            }
                            </tbody>
                        </table>
                        <br/>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <p><u>Selected Examples</u></p>
                            <div style={{display: "flex", alignItems: "top"}} onClick={handleAddBlankRow}>
                                <p style={{marginRight: "5px"}}>Add</p>
                                <GoDiffAdded style={{fontSize: "20px", opacity: "1"}}/>
                            </div>
                        </div>
                        <table className="example-panel-selected-table">
                            <tbody>
                            {
                                selectedNodeExamples.map((example, index) => {
                                    if (example.isSuggested === false) {
                                        return (
                                            <Row 
                                                exampleData={example}
                                                key={index}
                                                setSelectedRow={setSelectedRow}
                                                selectedRow={selectedRow}
                                                nodeId={selectedNode.id}
                                                setSelectedNodeExamples={setSelectedNodeExamples}
                                            />
                                        )
                                    }
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    );
}

export { ExamplePanel };