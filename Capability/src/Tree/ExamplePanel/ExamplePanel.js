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
            "examplePredicted": "True",
            "isSuggested": false,
            "exampleOffTopic": false,
        }

        return blankExample;
    };

    const sortSelectedNodeExamples = (selectedNodeExamples) => {
        // Sort the example by isSuggested put all suggested examples at the top
        const sortedSelectedNodeExamples = selectedNodeExamples.sort((a, b) => {
            if (a.isSuggested === b.isSuggested) {
                return 0;
            } else if (a.isSuggested === true) {
                return -1;
            } else {
                return 1;
            }
        }
        );
        return sortedSelectedNodeExamples;
    }
    const commitGetExample = async () => {
        try {
            setIsLoading(true);
            // console.log("Getting examples for node");
            const newDataExamples = await fetchAPIDATA("getExampleList", {
                "nodeId": node.node.id
            });

            // If there are no examples, add a blank row

            // Count the number of examples that are not suggested
            let countNotSuggested = 0;
            for (let i = 0; i < newDataExamples.length; i++) {
                if (newDataExamples[i].isSuggested === false) {
                    countNotSuggested++;
                }
            }

            if (countNotSuggested === 0) {
                const blankRow = blankRowAdd("Click \"Add\" to add an example");
                // setSelectedNodeExamples([blankRow]);
                setSelectedNodeExamples([...newDataExamples, blankRow]);
            } else {
                setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            }
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitAddBlankRow = async (blankRow) => {

        try {
            setIsLoading(true);

            const newDataExamples = await fetchAPIDATA("addExample", {
                "nodeId": selectedNode.id,
                "exampleText": blankRow.exampleText,
                "exampleTrue": blankRow.exampleTrue,
                "isSuggested": blankRow.isSuggested,
                "exampleOffTopic": blankRow.exampleOffTopic
            }, true);
            setSelectedNodeExamples([]);
            setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };   


    const handleAddBlankRow = () => {
        const blankRow = blankRowAdd("Add an example");
        commitAddBlankRow(blankRow);
    };

    const handleMoreSuggestions = () => {
        commitMoreSuggestions();
    }

    const commitMoreSuggestions = async () => {
        try {
            setIsLoading(true);
            const newDataExamples = await fetchAPIDATA("getMoreExamples", {
                "nodeId": selectedNode.id
            });
            setSelectedNodeExamples([]);
            setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
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
        const handleArrowDown = (event) => {     
            // if down arrow is pressed
            if (event.key === "ArrowDown") {
                // console.log("Arrow down pressed");
                if (selectedNodeExamples.length > 0) {
                    let nextRowPosition = 0;
                    for (let i = 0; i < selectedNodeExamples.length; i++) {
                        if (selectedNodeExamples[i].id === selectedRow) {
                            nextRowPosition = i;
                        }
                    }
                    nextRowPosition = (nextRowPosition + 1) % selectedNodeExamples.length;

                    if (selectedRow === null) {
                        nextRowPosition = 0;
                    }
                    setSelectedRow(selectedNodeExamples[nextRowPosition].id);
                }
            }
        };
        document.addEventListener("keydown", handleArrowDown);
        return () => document.removeEventListener("keydown", handleArrowDown);
    });

    useEffect(() => {
        const handleArrowUp = (event) => {
            // if up arrow is pressed
            if (event.key === "ArrowUp") {
                // console.log("Arrow up pressed");
                if (selectedNodeExamples.length > 0) {
                    let nextRowPosition = 0;
                    for (let i = 0; i < selectedNodeExamples.length; i++) {
                        if (selectedNodeExamples[i].id === selectedRow) {
                            nextRowPosition = i;
                        }
                    }
                    nextRowPosition = (nextRowPosition - 1 + selectedNodeExamples.length) % selectedNodeExamples.length;
                    if (selectedRow === null) {
                        nextRowPosition = selectedNodeExamples.length - 1;
                    }
                    setSelectedRow(selectedNodeExamples[nextRowPosition].id);
                }
            }
        };
        document.addEventListener("keydown", handleArrowUp);
        return () => document.removeEventListener("keydown", handleArrowUp);
    });

    useEffect(() => {
        const handlePlusClick = (event) => {
            if (event.key === "+") {
                handleAddBlankRow();
            }
        };
        document.addEventListener("keydown", handlePlusClick);
        return () => document.removeEventListener("keydown", handlePlusClick);
    });

    useEffect(() => {
        const handleCMDPlusPress = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "=") {
                event.preventDefault();
                let nextRowPosition = null;
                for (let i = 0; i < selectedNodeExamples.length; i++) {
                    if (selectedNodeExamples[i].id === selectedRow) {
                        nextRowPosition = i;
                    }
                }
                // console.log("handleCMDPlusPress + pressed: "+ selectedRow);
                // console.log("handleCMDPlusPress + pressed: "+ nextRowPosition);
                // console.log("handleCMDPlusPress + pressed: "+ selectedNodeExamples[nextRowPosition].isSuggested);

                if (selectedRow !== null && 
                        nextRowPosition !== null &&
                        selectedNodeExamples[nextRowPosition].isSuggested === true) {
                    // console.log("commiting update for plus");
                    commitUpdateExampleSuggested(nextRowPosition, false);
                }
            }
        };
        document.addEventListener("keydown", handleCMDPlusPress);
        return () => document.removeEventListener("keydown", handleCMDPlusPress);
    });

    useEffect(() => {
        const handleCMDMinusPress = (event) => {

            if ((event.metaKey || event.ctrlKey) && event.key === "-") {
                event.preventDefault();
                let nextRowPosition = null;
                for (let i = 0; i < selectedNodeExamples.length; i++) {
                    if (selectedNodeExamples[i].id === selectedRow) {
                        nextRowPosition = i;
                    }
                }

                if (selectedRow !== null 
                    && nextRowPosition !== null
                    && selectedNodeExamples[nextRowPosition].isSuggested === false) {
                    // console.log("handleCMDMinusPress - pressed");
                    commitUpdateExampleSuggested(nextRowPosition, true);
                }
            }
        };
        document.addEventListener("keydown", handleCMDMinusPress);
        return () => document.removeEventListener("keydown", handleCMDMinusPress);
    });


    const commitUpdateExampleSuggested = async (examplePosition, isSuggested) => {
        try {
            setIsLoading(true);
            console.log("Node: ", selectedNode.id);
            console.log("Example: ", selectedNodeExamples[examplePosition]);
            console.log("Setting isSuggested to: ", isSuggested);
            const newDataExamples = await fetchAPIDATA("updateExample", {
                "nodeId": selectedNode.id,
                "exampleId": selectedNodeExamples[examplePosition].id,
                "exampleText": selectedNodeExamples[examplePosition].exampleText,
                "exampleTrue": selectedNodeExamples[examplePosition].exampleTrue,
                "isSuggested": isSuggested,
                "exampleOffTopic": selectedNodeExamples[examplePosition].exampleOffTopic
            }, true);
            setSelectedNodeExamples([]);
            console.log("New data examples: ", newDataExamples);
            setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitDeleteRow = async() => {
        if (selectedRow !== null) {
            try {
                setIsLoading(true);

                // First set the selected row to new available row
                let nextRowPosition = 0;
                for (let i = 0; i < selectedNodeExamples.length; i++) {
                    if (selectedNodeExamples[i].id === selectedRow) {
                        nextRowPosition = i;
                    }
                }

                const newDataExamples = await fetchAPIDATA("removeExample", {
                    "nodeId": selectedNode.id,
                    "exampleId": selectedRow
                }, true);
                setSelectedNodeExamples([]);
                setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
                setIsLoading(false);

                let countNotSuggested = 0;
                for (let i = 0; i < newDataExamples.length; i++) {
                    if (newDataExamples[i].isSuggested === false) {
                        countNotSuggested++;
                    }
                }

                if (countNotSuggested === 0) {
                    const blankRow = blankRowAdd("Click \"Add\" to add an example");
                    setSelectedNodeExamples([...newDataExamples, blankRow]);
                }

                nextRowPosition = nextRowPosition % newDataExamples.length;
                console.log("nextRowPosition: ", nextRowPosition);
                try {
                    setSelectedRow(newDataExamples[nextRowPosition].id);
                    console.log("Selected new row: ", selectedRow);
                } catch (error) {
                    console.log("Error: ", error);
                }

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
                        <p>Path: {selectedNode.naturalLanguagePath}</p>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <p><u>Suggested Examples</u></p>
                            <div style={{display: "flex", alignItems: "top"}} onClick={handleMoreSuggestions}>
                                <p style={{marginRight: "5px"}}>More</p>
                                <GoDiffAdded style={{fontSize: "20px", opacity: "1", cursor: "pointer"}}/>
                            </div>
                        </div>
                        <table className="example-panel-selected-table">
                            <thead>
                            <tr>
                                <td>Input</td>
                                <td></td>
                                <td>Output</td>
                                <td>Predicted</td>
                                <td>Off-topic</td> 
                                <td>Pass</td>
                                <td>Fail</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                selectedNodeExamples.map((example, index) => {
                                    // console.log("example: ", example);
                                    if (example.isSuggested === true) {
                                        return (
                                            <Row 
                                                exampleData={example}
                                                key={index}
                                                setSelectedRow={setSelectedRow}
                                                selectedRow={selectedRow}
                                                nodeId={selectedNode.id}
                                                setSelectedNodeExamples={setSelectedNodeExamples}
                                                isSuggested={true}
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
                                <GoDiffAdded style={{fontSize: "20px", opacity: "1", cursor: "pointer"}}/>
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
                                                isSuggested={false}
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