import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Tooltip } from 'react-tooltip';
import {fetchAPIDATA} from "../../utils";
import "./ExamplePanel.css";
import { GoDiffAdded } from "react-icons/go";
import { BsArrow90DegDown, BsArrow90DegRight } from "react-icons/bs";
import { FaRedo } from "react-icons/fa";
import { GrAddCircle } from "react-icons/gr";
import { Row } from "./Row";
import { v4 as uuidv4 } from "uuid";
import { useTreeContext } from "../state/TreeContext";
import { HelperPage } from "./HelperPage";

const ExamplePanel = ({node}) => {

    // uddate the node state when the node prop changes
    const [selectedNodeExamples, setSelectedNodeExamples] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const { setIsLoading, setNodeHighlighted } = useTreeContext();

    // Add blank row when the ExamplePanel is first rendered

    const commitGetExample = async () => {
        try {
            setIsLoading(true);
            // console.log("Getting examples for node");
            const newDataExamples = await fetchAPIDATA("getExampleList", {
                "nodeId": node.node.id
            });

            // Count the number of examples that are not suggested
            // let countNotSuggested = 0;
            // for (let i = 0; i < newDataExamples.length; i++) {
            //     if (newDataExamples[i].isSuggested === false) {
            //         countNotSuggested++;
            //     }
            // }

            // if (countNotSuggested === 0) {
            //     const blankRow = blankRowAdd("Click here to add an example");
            //     commitAddBlankRow(blankRow);
            // } else {
            setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            // }

            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    useEffect(() => {    
        if (node) {
            // setSelectedNodeExamples([]);
            setSelectedNode(node.node);
            commitGetExample();
        } else {
            setSelectedNode(null);
            setSelectedNodeExamples([]);
        }
    }, [node]);

    useEffect(() => {
        const examplePanelContainer = divRef.current;
        const menuTopTreeToolbar = document.getElementById("menu_top_tree_toolbar");
        const menuTopTreeToolbarBox = menuTopTreeToolbar.getBoundingClientRect();

        examplePanelContainer.style.top = menuTopTreeToolbarBox.bottom + 20 + "px";
    }, []);

    useEffect(() => {
        console.log(selectedNodeExamples);
    }, [selectedNodeExamples]);  

    const blankRowAdd = (text) => {
        const blankExample = {
            "id": uuidv4(),
            "exampleText": text,
            "exampleTrue": "",
            "isSuggested": false,
            "exampleOffTopic": false,
        }

        return blankExample;
    };

    const sortSelectedNodeExamples = (selectedNodeExamples) => {
        // Sort the example by isSuggested put all suggested examples at the top
        const sortedSelectedNodeExamples = selectedNodeExamples.sort((a, b) => {
            if (a.isSuggested === b.isSuggested) {
                if (a.isSuggested === true)
                    return a.exampleConfidence - b.exampleConfidence;
                else
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

    const commitAddBlankRow = async (blankRow) => {

        try {
            setIsLoading(true);

            const newDataExamples = await fetchAPIDATA("addExample", {
                "nodeId": node.node.id,
                "exampleText": blankRow.exampleText,
                "exampleTrue": blankRow.exampleTrue,
                "isSuggested": blankRow.isSuggested,
                "exampleOffTopic": blankRow.exampleOffTopic
            }, true);
            // setSelectedNodeExamples([]);
            setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };   


    const handleAddBlankRow = () => {
        const blankRow = blankRowAdd("New example");
        commitAddBlankRow(blankRow);
    };

    const handleMoreSuggestions = () => {
        commitMoreSuggestions();
    }

    const commitMoreSuggestions = async () => {
        try {
            setIsLoading(true);
            const filteredNodeExamples = selectedNodeExamples.filter((example) => {
                return !example.isSuggested;
            });
            setSelectedNodeExamples(filteredNodeExamples);
            const newDataExamples = await fetchAPIDATA("getMoreExamples", {
                "nodeId": selectedNode.id
            });
            setSelectedNodeExamples(sortSelectedNodeExamples(newDataExamples));
            if (!node.node.isHighlighed)
                setNodeHighlighted(node.node.id, true);
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };
        

    // useEffect(() => {
    //     const handleKeyDown = (event) => {     
            
    //         if ((event.metaKey || event.ctrlKey) && event.key === "Backspace") {
    //             commitDeleteRow();
    //         }
    //     };
        
    //     document.addEventListener("keydown", handleKeyDown);
    //     return () => document.removeEventListener("keydown", handleKeyDown);
    // });

    // useEffect(() => {
    //     const handleArrowDown = (event) => {     
    //         // if down arrow is pressed
    //         if (event.key === "ArrowDown") {
    //             // console.log("Arrow down pressed");
    //             if (selectedNodeExamples.length > 0) {
    //                 let nextRowPosition = 0;
    //                 for (let i = 0; i < selectedNodeExamples.length; i++) {
    //                     if (selectedNodeExamples[i].id === selectedRow) {
    //                         nextRowPosition = i;
    //                     }
    //                 }
    //                 nextRowPosition = (nextRowPosition + 1) % selectedNodeExamples.length;

    //                 if (selectedRow === null) {
    //                     nextRowPosition = 0;
    //                 }
    //                 setSelectedRow(selectedNodeExamples[nextRowPosition].id);
    //             }
    //         }
    //     };
    //     document.addEventListener("keydown", handleArrowDown);
    //     return () => document.removeEventListener("keydown", handleArrowDown);
    // });

    // useEffect(() => {
    //     const handleArrowUp = (event) => {
    //         // if up arrow is pressed
    //         if (event.key === "ArrowUp") {
    //             // console.log("Arrow up pressed");
    //             if (selectedNodeExamples.length > 0) {
    //                 let nextRowPosition = 0;
    //                 for (let i = 0; i < selectedNodeExamples.length; i++) {
    //                     if (selectedNodeExamples[i].id === selectedRow) {
    //                         nextRowPosition = i;
    //                     }
    //                 }
    //                 nextRowPosition = (nextRowPosition - 1 + selectedNodeExamples.length) % selectedNodeExamples.length;
    //                 if (selectedRow === null) {
    //                     nextRowPosition = selectedNodeExamples.length - 1;
    //                 }
    //                 setSelectedRow(selectedNodeExamples[nextRowPosition].id);
    //             }
    //         }
    //     };
    //     document.addEventListener("keydown", handleArrowUp);
    //     return () => document.removeEventListener("keydown", handleArrowUp);
    // });

    // useEffect(() => {
    //     const handlePlusClick = (event) => {
    //         if (event.key === "+") {
    //             handleAddBlankRow();
    //         }
    //     };
    //     document.addEventListener("keydown", handlePlusClick);
    //     return () => document.removeEventListener("keydown", handlePlusClick);
    // });

    // useEffect(() => {
    //     const handleCMDPlusPress = (event) => {
    //         if ((event.metaKey || event.ctrlKey) && event.key === "=") {
    //             event.preventDefault();
    //             let nextRowPosition = null;
    //             for (let i = 0; i < selectedNodeExamples.length; i++) {
    //                 if (selectedNodeExamples[i].id === selectedRow) {
    //                     nextRowPosition = i;
    //                 }
    //             }
    //             // console.log("handleCMDPlusPress + pressed: "+ selectedRow);
    //             // console.log("handleCMDPlusPress + pressed: "+ nextRowPosition);
    //             // console.log("handleCMDPlusPress + pressed: "+ selectedNodeExamples[nextRowPosition].isSuggested);

    //             if (selectedRow !== null && 
    //                     nextRowPosition !== null &&
    //                     selectedNodeExamples[nextRowPosition].isSuggested === true) {
    //                 // console.log("commiting update for plus");
    //                 commitUpdateExampleSuggested(nextRowPosition, false);
    //             }
    //         }
    //     };
    //     document.addEventListener("keydown", handleCMDPlusPress);
    //     return () => document.removeEventListener("keydown", handleCMDPlusPress);
    // });

    // useEffect(() => {
    //     const handleCMDMinusPress = (event) => {

    //         if ((event.metaKey || event.ctrlKey) && event.key === "-") {
    //             event.preventDefault();
    //             let nextRowPosition = null;
    //             for (let i = 0; i < selectedNodeExamples.length; i++) {
    //                 if (selectedNodeExamples[i].id === selectedRow) {
    //                     nextRowPosition = i;
    //                 }
    //             }

    //             if (selectedRow !== null 
    //                 && nextRowPosition !== null
    //                 && selectedNodeExamples[nextRowPosition].isSuggested === false) {
    //                 // console.log("handleCMDMinusPress - pressed");
    //                 commitUpdateExampleSuggested(nextRowPosition, true);
    //             }
    //         }
    //     };
    //     document.addEventListener("keydown", handleCMDMinusPress);
    //     return () => document.removeEventListener("keydown", handleCMDMinusPress);
    // });

    const commitUpdateExample = (updatedExample, suggestionAdded) => {
        try {

            let newDataExamples;

            if (!node.node.isHighlighted)
                setNodeHighlighted(node.node.id, true);

            // console.log("New data examples: ", newDataExamples);

            if (suggestionAdded === true) {
                const filteredNodeExamples = selectedNodeExamples.filter((example) => {
                    return example.id !== updatedExample.id;
                });
                newDataExamples = [...filteredNodeExamples, updatedExample];
            } else {
                newDataExamples = selectedNodeExamples.map((example) => {
                    return example.id !== updatedExample.id ? example : updatedExample;
                });
            }

            const sortedSelectedNodeExamples = sortSelectedNodeExamples(newDataExamples);

            setSelectedNodeExamples(sortedSelectedNodeExamples);
            // setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitUpdateExampleSuggested = async (updatedExample, isSuggested) => {
        try {
            setIsLoading(true);
            console.log("Node: ", selectedNode.id);
            console.log("Example: ", updatedExample);
            console.log("Setting isSuggested to: ", isSuggested);
            await fetchAPIDATA("updateExample", {
                "nodeId": selectedNode.id, 
                "exampleId": updatedExample.id,
                "exampleText": updatedExample.exampleText,
                "exampleTrue": updatedExample.exampleTrue,
                "isSuggested": isSuggested,
                "exampleOffTopic": updatedExample.exampleOffTopic
            }, true);

            const filteredNodeExamples = selectedNodeExamples.filter((example) => {
                return example.id !== updatedExample.id;
            });

            const newDataExamples = sortSelectedNodeExamples([...filteredNodeExamples, updatedExample]);

            // setSelectedNodeExamples([]);
            console.log("New data examples: ", newDataExamples);
            setSelectedNodeExamples(newDataExamples);
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitDeleteRow = async(row) => {
        if (row !== null) {
            try {
                setIsLoading(true);

                await fetchAPIDATA("removeExample", {
                    "nodeId": selectedNode.id,
                    "exampleId": row
                }, true);

                console.log("removeExample: ", row);

                const filteredNodeExamples = selectedNodeExamples.filter((example) => {
                    return example.id !== row;
                });

                const newDataExamples = sortSelectedNodeExamples(filteredNodeExamples);

                console.log(newDataExamples)
                
                setSelectedNodeExamples(newDataExamples);
                setIsLoading(false);

                // let countNotSuggested = 0;
                // for (let i = 0; i < newDataExamples.length; i++) {
                //     if (newDataExamples[i].isSuggested === false) {
                //         countNotSuggested++;
                //     }
                // }

                // if (countNotSuggested === 0) {
                //     const blankRow = blankRowAdd("Click here to add an example");
                //     // setSelectedNodeExamples([...newDataExamples, blankRow]);
                //     commitAddBlankRow(blankRow);
                // }

                // First set the selected row to new available row
                let nextRowPosition = 0;
                for (let i = 0; i < selectedNodeExamples.length; i++) {
                    if (selectedNodeExamples[i].id === row) {
                        nextRowPosition = i;
                    }
                }

                nextRowPosition = Math.min(nextRowPosition, newDataExamples.length - 1);
                console.log("nextRowPosition: ", nextRowPosition);
                try {
                    setSelectedRow(newDataExamples[nextRowPosition].id);
                    console.log("Selected new row: ", row);
                } catch (error) {
                    console.log("Error: ", error);
                }
            } catch (error) {
                console.log("Error: ", error);
            }
        }
    };

    // const handleRowKeyDown = (event) => {
    //     console.log(event)
    //     if ((event.metaKey || event.ctrlKey) && event.key === "Backspace") {
    //         commitDeleteRow(selectedRow);
    //     }

    // }

    const SuggestedTable = ({selectedNodeExamples}) => {
        return selectedNodeExamples.map((example, index) => {
                // console.log("example: ", example);
                if (example.isSuggested === true) {
                    return (
                        <Row 
                            exampleData={example}
                            key={index}
                            setSelectedRow={setSelectedRow}
                            selectedRow={selectedRow}
                            nodeId={selectedNode.id}
                            commitUpdateExample={commitUpdateExample}
                            isSuggested={true}
                            commitDeleteRow={commitDeleteRow}
                            commitUpdateExampleSuggested={commitUpdateExampleSuggested}
                            commitGetExample={commitGetExample}
                            rowStyle={
                                selectedRow === example.id ?
                                    {backgroundColor: "rgb(247, 247, 247)"} : {backgroundColor: "rgb(243, 248, 255)"}
                            }
                        />
                    )
                } else {
                    return null;
                }
        })
    };

    const SelectedTable = ({selectedNodeExamples}) => {
        // console.log("SelectedTable: ", selectedNodeExamples);
        return selectedNodeExamples.map((example, index) => {
            if (example.isSuggested === false) {
                return (
                    <Row 
                        exampleData={example}
                        key={index}
                        setSelectedRow={setSelectedRow}
                        selectedRow={selectedRow}
                        nodeId={selectedNode.id}
                        commitUpdateExample={commitUpdateExample}
                        isSuggested={false}
                        commitDeleteRow={commitDeleteRow}
                        commitUpdateExampleSuggested={commitUpdateExampleSuggested}
                        commitGetExample={commitGetExample}
                        rowStyle={
                            selectedRow === example.id ?
                                {backgroundColor: "rgb(247, 247, 247)"} : {backgroundColor: "rgb(255, 255, 255)"}
                        }
                    />
                )
            } else {
                return null;
            }
        })
    };

    const dragOver = (e) => {
        e.preventDefault();
    };
     
    const dragEnter = (e) => {
        e.preventDefault();
    };

    const drop = (e) => {
        e.preventDefault();
        console.log("drop", e);
        const example = {
            "id": e.dataTransfer.getData("exampleId"),
            "exampleText": e.dataTransfer.getData("exampleText"),
            "exampleTrue": e.dataTransfer.getData("exampleTrue"),
            "isSuggested": false,
            "exampleOffTopic": e.dataTransfer.getData("exampleOffTopic"),
            "examplePredicted": e.dataTransfer.getData("examplePredicted"),
            "exampleConfidence": e.dataTransfer.getData("exampleConfidence"),            
        }
        commitUpdateExampleSuggested(example, false);
    }


    const divRef = useRef(null);

    const tooltip_style= {
        zIndex: 9999, 
        position: "absolute", 
        backgroundColor: "rgba(54, 54, 54, 1)",
        padding : "5px",
        fontSize: "80%",
      };

    return (
        <div className="example-panel" ref={divRef}>
            <div className="example-panel__content">
                {selectedNode ?
                    <div>
                        <h4>Example Panel</h4>
                        <p>Topic: {selectedNode.name}</p> 
                        {
                            selectedNode.naturalLanguagePath !== null ?
                            <p>Path: {selectedNode.naturalLanguagePath}</p> :
                            null
                        }
                        {
                            selectedNodeExamples.length === 0 ? 
                            <div style={{display: "flex", justifyContent: "right", alignItems: "center"}}>
                                <BsArrow90DegDown style={{fontSize: "20px", opacity: "1"}} id="prompt"/>
                                <p style={{marginLeft: "5px", fontStyle:"italic", fontSize:"15px"}}>Click to add/suggest examples</p>
                                <BsArrow90DegRight style={{fontSize: "20px", opacity: "1", marginLeft: "6px", transform: 'rotate(90deg)'}} id="prompt"/>
                            </div> :
                            null
                        }
                        <div style={{display: "flex", justifyContent: "right", alignItems: "center"}}>
                            {/* <p><u>Suggested Examples</u></p> */}
                            <div style={{display: "flex", alignItems: "top", cursor: "pointer"}} onClick={handleMoreSuggestions}>
                                <FaRedo style={{fontSize: "16px", opacity: "1", marginTop: "4px"}} id="suggest-examples"/>
                                <p style={{marginLeft: "5px", marginRight: "20px"}}>Suggestions</p>
                                <Tooltip place="bottom" anchorSelect="#suggest-examples" content="Suggest More Examples" style={tooltip_style}/>
                            </div>
                            <div style={{display: "flex", alignItems: "top", cursor: "pointer"}} onClick={handleAddBlankRow}>
                                <GrAddCircle style={{fontSize: "20px", opacity: "1", marginTop: "2px"}} id="add-example"/>
                                <p style={{marginLeft: "5px"}}>Add Examples</p>
                                <Tooltip place="bottom" anchorSelect="#add-example" content="Add Example" style={tooltip_style}/>
                            </div>
                        </div>
                        {/* <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <p><u>Selected Examples</u></p>
                            <div style={{display: "flex", alignItems: "top"}} onClick={handleAddBlankRow}>
                                <p style={{marginRight: "5px"}}>Add</p>
                                <GoDiffAdded style={{fontSize: "20px", opacity: "1", cursor: "pointer"}} id="add-example"/>
                                <Tooltip place="bottom" anchorSelect="#add-example" content="Add Example" style={tooltip_style}/>
                            </div>
                        </div> */}


                        <table className="example-panel-selected-table">
                            <tbody>
                            {
                                <SuggestedTable selectedNodeExamples={selectedNodeExamples}/>
                            }
                            </tbody>
                        </table>
                        <br/>

                        <table className="example-panel-selected-table">
                            <thead>
                            <tr>
                                <td>Input</td>
                                <td></td>
                                <td>Output</td>
                                <td>Predicted</td>
                                {/* <td>Conf</td> */}
                                {/* <td>Off-topic</td>  */}
                                <td>Pass</td>
                                <td>Fail</td>
                                <td></td>
                            </tr>
                            </thead>
                        </table>

                        <table className="example-panel-selected-table"
                                onDrop={drop}
                                onDragEnter={dragEnter}
                                onDragOver={dragOver}
                        >
                            <tbody>
                            {
                                <SelectedTable selectedNodeExamples={selectedNodeExamples}/>
                            }
                            </tbody>
                        </table>
                    </div> :
                    <HelperPage />
                }
            </div>
        </div>
    );
}

export { ExamplePanel };