import React, { useState, useEffect, useLayoutEffect } from "react";
// import { FaBan } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import {
    RiDeleteBin2Line
}   from "react-icons/ri";
import { GrAddCircle } from "react-icons/gr";
// import { useTreeContext } from "../state/TreeContext";
import {fetchAPIDATA} from "../../utils";

import { AlertDelete } from "../Folder/AlertDelete";
// import { set } from "lodash";

// const ExamplePanelOff = () => {
//     return (
//         <div>
//             <FaBan style={{fontSize: "20px", opacity: "1", color: "rgb(197, 143, 59)", fontWeight: "bold", cursor: "pointer"}}/>
//         </div>
//     );
// }

const ExamplePanelPass = () => {
    return (
        <div>
            <div style={{margin: "0px", backgroundColor: "rgb(230, 238, 230)", padding: "1px"}}>
                <TiTick style={{fontSize: "25px", opacity: "1", color: "rgb(61, 125, 68)", cursor: "pointer"}}/>
            </div>
        </div>
    );
}

const ExamplePanelFail = () => {
    return (
        <div>
            <ImCross style={{fontSize: "12px", opacity: "1", color: "rgb(190, 53, 53)", cursor: "pointer"}}/>
        </div>
    );
}

const Row = ({exampleData, setSelectedRow, selectedRow, nodeId, isSuggested, commitDeleteRow, commitUpdateExampleSuggested, commitUpdateExample, rowStyle}) => {

    // const [example, setExample] = useState(null);

    // For editing the example text
    const [isEditingExampleText, setIsEditingExampleText] = useState(false);
    const [exampleText, setExampleText] = useState(exampleData.exampleText);

    // For editing the example output
    const [isEditingExampleOutput, setIsEditingExampleOutput] = useState(false);
    const [exampleOutput, setExampleOutput] = useState(exampleData.exampleTrue);
    const [examplePredicted, setExamplePredicted] = useState(exampleData.examplePredicted);

    // const [offTopic, setOffTopic] = useState(exampleData.exampleOffTopic);
    const [pass, setPass] = useState((exampleData.exampleTrue === exampleData.examplePredicted) || (exampleData.exampleTrue === ""));
    const [fail, setFail] = useState((exampleData.exampleTrue !== exampleData.examplePredicted) && (exampleData.exampleTrue !== ""));
    // const { setIsLoading } = useTreeContext();


    const [isDeleting, setIsDeleting] = useState(false);

    const [labels, setLabels] = useState([]);

    useEffect(() => {
        const fetchLabels = async () => {
            const taskLabels = await fetchAPIDATA("getLabels");
            setLabels(taskLabels);
        }
        fetchLabels();
    }, []);

    useEffect(() => {
        if ((exampleOutput === examplePredicted) || (exampleOutput === "")) {
            setPass(true);
            setFail(false);
            // setOffTopic(false);
        } else {
            setPass(false);
            setFail(true);
            // setOffTopic(false);
        }
    }, [exampleOutput, examplePredicted]);

    useEffect(() => {
        if (selectedRow !== exampleData.id) {
            setIsEditingExampleText(false);
            setIsEditingExampleOutput(false);
        } else {
            console.log("selectedRow: ", selectedRow);
        }
    }, [exampleData.id, selectedRow]);

    // const textRef = useRef();

    // useEffect(() => {
    //     function handleClickOutside(event) {
    //       if (isEditingExampleText && textRef.current && !textRef.current.contains(event.target)) {
    //         commitEditUpdate({isText: true});
    //       }
    //     }
      
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //       document.removeEventListener("mousedown", handleClickOutside);
    //     };
    //   }, [isEditingExampleText]);

    const handleRowSelect = () => {
        setSelectedRow(exampleData.id);
    }

    // const commitOffTopic = () => {
    //     const newOfftopic = !offTopic;
    //     setOffTopic(newOfftopic);
    //     // commitUpdateRowOutput(exampleData, "");
    //     commitExampleStatus(exampleData, newOfftopic);
    // };

    const commitPass = () => {
        setExampleOutput(exampleData.examplePredicted);
        commitUpdateRow(exampleData, {...exampleData, exampleTrue: exampleData.examplePredicted, isSuggested: false});
    };

    const commitFail = () => {
        setExampleOutput("UNKNOWN");
        commitUpdateRow(exampleData, {...exampleData, exampleTrue: "UNKNOWN", isSuggested: false});
    };

    const handleExampleTextClick = () => {
        setIsEditingExampleText(true);
    }

    const handleExampleOutputClick = () => {
        setIsEditingExampleOutput(true);
    }

    const handleExampleTextChange = (e) => {
        setExampleText(e.target.value);
    }

    const handleExampleTextKeyDown = (event) => {
        if ((event.key === 'Enter') || (event.key === "Escape")) {
            console.log(exampleText)
            commitUpdateRow(exampleData, {...exampleData, exampleText: exampleText});
            setIsEditingExampleText(false);
        }
    }

    const handleExampleTextBlur = () => {
        console.log(exampleText)
        commitUpdateRow(exampleData, {...exampleData, exampleText: exampleText});
        setIsEditingExampleText(false);
    }

    const handleExampleOutputChange = (e) => {
        setExampleOutput(e.target.value);
    }

    const handleExampleOutputKeyDown = (event) => {
        if (event.key === "Escape" ||  (event.key === 'Enter')) {
            console.log(exampleOutput)
            commitUpdateRow(exampleData, {...exampleData, exampleTrue: exampleOutput});
            setIsEditingExampleOutput(false);
        }
    }

    const handleExampleOutputBlur = () => {
        console.log(exampleOutput)
        commitUpdateRow(exampleData, {...exampleData, exampleTrue: exampleOutput});
        setIsEditingExampleOutput(false);
    }

    const handleDeleteRow = () => {
        // if (!isSuggested) {
        //     setIsDeleting(true);
        //     console.log("isDeleting: ", isDeleting);
        // } else {
        commitDeleteRow(exampleData.id);
        // }
    }

    const handleAddSuggested = () => {
        exampleData = {...exampleData, isSuggested: false};
        commitUpdateExampleSuggested(exampleData, false);    
    }

    // const handleExampleOffTopicClick = () => {
    //     commitExampleStatus(true);
    // }

    // const handleExamplePassClick = () => {
    //     commitExampleStatus(false, true, false);
    // }

    // const handleExampleFailClick = () => {
    //     commitExampleStatus(false, false, true);
    // }

    const commitUpdateRow = async (example, updatedExample) => {
        try {
            const newExampleData = await fetchAPIDATA("updateExample", {
                "nodeId": nodeId,
                "exampleId": updatedExample.id,
                "exampleText": updatedExample.exampleText,
                "exampleTrue": updatedExample.exampleTrue,
                "isSuggested": updatedExample.isSuggested,
                "exampleOffTopic": updatedExample.exampleOffTopic
            }, true);
            // update predicted if text has changed
            console.log("example: ", newExampleData);
            if (example.exampleText !== updatedExample.exampleText)
                setExamplePredicted(newExampleData.examplePredicted);
            commitUpdateExample(newExampleData, example.isSuggested !== updatedExample.isSuggested);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    // const commitUpdateRowText = async (example, text) => {
    //     try {
    //         const newExampleData = await fetchAPIDATA("updateExample", {
    //             "nodeId": nodeId,
    //             "exampleId": example.id,
    //             "exampleText": text,
    //             "exampleTrue": example.exampleTrue,
    //             "isSuggested": example.isSuggested,
    //             "exampleOffTopic": example.exampleOffTopic
    //         }, true);
    //         setExamplePredicted(newExampleData.examplePredicted);
    //         commitUpdateExample(newExampleData);
    //     } catch (error) {
    //         console.log("Error: ", error);
    //     }
    // };

    // const commitUpdateRowOutput = async (example, text) => {
    //     try {
    //         const newExampleData = await fetchAPIDATA("updateExample",{
    //             "nodeId": nodeId,
    //             "exampleId": example.id,
    //             "exampleText": example.exampleText,
    //             "exampleTrue": text,
    //             "isSuggested": example.isSuggested,
    //             "exampleOffTopic": example.exampleOffTopic
    //         }, true);
    //         commitUpdateExample(newExampleData);
    //     } catch (error) {
    //         console.log("Error: ", error);
    //     }
    // };

    // const commitExampleStatus = async (example, offTopicSelection) => {
    //     try {
    //         const newExampleData = await fetchAPIDATA("updateExample", {
    //             "nodeId": nodeId,
    //             "exampleId": example.id,
    //             "exampleText": example.exampleText,
    //             "exampleTrue": example.exampleTrue,
    //             "isSuggested": example.isSuggested,
    //             "exampleOffTopic": offTopicSelection
    //         }, true);
    //         commitUpdateExample(newExampleData);
    //     } catch (error) {
    //         console.log("Error: ", error);
    //     }
    // };

    const editSpecialCSSText = {
        width: "100%", 
        height: "100%", 
        // border: "none", 
        backgroundColor: "rgb(247, 247, 247)", 
        textAlign: "right",
        outline: "none",
        boxShadow: "none",
    }

    const editSpecialCSSOutput = {
        width: "100%", 
        height: "100%", 
        // border: "none", 
        borderWidth: "thin",
        backgroundColor: "rgb(247, 247, 247)", 
        textAlign: "left",
        outline: "none",
        boxShadow: "none",
        overflowWrap: "break-word",
    }


    const dragStart = (e) => {
        e.dataTransfer.setData('exampleId', exampleData.id);
        e.dataTransfer.setData('nodeId', nodeId);
        e.dataTransfer.setData('isSuggested', exampleData.isSuggested);
        e.dataTransfer.setData('exampleText', exampleData.exampleText);
        e.dataTransfer.setData('exampleTrue', exampleData.exampleTrue);
        e.dataTransfer.setData('exampleOffTopic', exampleData.exampleOffTopic);
        e.dataTransfer.setData('examplePredicted', exampleData.examplePredicted);
        e.dataTransfer.setData('exampleConfidence', exampleData.exampleConfidence);
      };

    const dragEnd = (e) => {
        e.dataTransfer.clearData();
        // commitGetExample();
    };

    return (
            <tr onClick={handleRowSelect}
                style={rowStyle}
                onDragStart={dragStart}
                onDragEnd={dragEnd}
                draggable
            >
            {
                isEditingExampleText ?
                    <td><textarea name="text" value={exampleText} 
                        className="tree__input"
                        onChange={handleExampleTextChange} 
                        onKeyDown={handleExampleTextKeyDown} 
                        onBlur={handleExampleTextBlur}
                        style={editSpecialCSSText} 
                        wrap="soft"/></td>:
                    <td onClick={handleExampleTextClick} style={{whiteSpace: "pre-wrap"}}>{exampleText}</td>
            }

            <td><FaLongArrowAltRight style={{fontSize: "30px", color: "rgb(144, 144, 144)"}}/></td>


            <td>
                {
                    <td style={{whiteSpace: "pre-wrap"}}>{examplePredicted}</td>
                }
            </td>
            
            {
                isEditingExampleOutput ?
                    <td>
                        <input list="output" name="output" value={exampleOutput} 
                        onChange={handleExampleOutputChange} 
                        onKeyDown={handleExampleOutputKeyDown} 
                        onBlur={handleExampleOutputBlur}
                        style={editSpecialCSSOutput} wrap="soft"/>
                        <datalist id="output">
                            {
                                labels.map((label, index) => {
                                    return <option value={label} key={index}></option>
                                })
                            }
                        </datalist>
                    </td> :
                    <td onClick={handleExampleOutputClick}  style={{whiteSpace: "pre-wrap"}}>{exampleOutput}</td>

            }
            
            {/* <td>
                {
                    exampleData.exampleConfidence
                }
            </td> */}
            {/* {
                isSuggested ?
                    (
                        <td onClick={commitOffTopic}>
                            {
                                offTopic ?
                                    <ExamplePanelOff /> :
                                    <FaBan style={{fontSize: "20px", opacity: "0.2", cursor: "pointer"}}/>
                            }
                        </td>
                    ) :
                    (
                        <td></td>
                    )
            } */}
            <td onClick={commitPass}>
                {
                    pass ?
                        <ExamplePanelPass /> :
                        <TiTick style={{fontSize: "25px", opacity: "0.2", cursor: "pointer"}}/>
                }
            </td>
            <td onClick={commitFail}>
                {
                    fail ?
                        <ExamplePanelFail /> :
                        <ImCross style={{fontSize: "12px", opacity: "0.2", cursor: "pointer"}}/>
                }
            </td>
            
            <td>
                {
                    isSuggested ?
                        <GrAddCircle onClick={handleAddSuggested} style={{fontSize: "20px", cursor: "pointer"}}/> :
                        <RiDeleteBin2Line onClick={handleDeleteRow} style={{fontSize: "20px", cursor: "pointer"}}/>
                }
            </td>

            {/* <td onClick={handleDeleteRow} >
                <RiDeleteBin2Line style={{fontSize: "20px", cursor: "pointer"}}/>
            </td> */}

            {/* <AlertDelete node={exampleData} onConfirm={commitDeleteRow} isDeleting={isDeleting} setIsDeleting={setIsDeleting}/> */}
            </tr>
    );
}

export { Row };