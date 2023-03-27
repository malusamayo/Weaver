import React, { useState, useEffect } from "react";
// import { FaBan } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import {
    RiDeleteBin2Line
}   from "react-icons/ri";
import {
    BiAddToQueue
}   from "react-icons/bi";

// import { useTreeContext } from "../state/TreeContext";
import {fetchAPIDATA} from "../../utils";
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
            <ImCross style={{fontSize: "12px", opacity: "1", color: "rgb(190, 53, 53", cursor: "pointer"}}/>
        </div>
    );
}

const Row = ({exampleData, setSelectedRow, selectedRow, nodeId, isSuggested, commitDeleteRow, commitUpdateExampleSuggested, commitUpdateExample}) => {

    // const [example, setExample] = useState(null);

    // For editing the example text
    const [isEditingExampleText, setIsEditingExampleText] = useState(false);
    const [exampleText, setExampleText] = useState(exampleData.exampleText);

    // For editing the example output
    const [isEditingExampleOutput, setIsEditingExampleOutput] = useState(false);
    const [exampleOutput, setExampleOutput] = useState(exampleData.exampleTrue);
    const [examplePredicted, setExamplePredicted] = useState(exampleData.examplePredicted);

    // const [offTopic, setOffTopic] = useState(exampleData.exampleOffTopic);
    const [pass, setPass] = useState(exampleData.exampleTrue === exampleData.examplePredicted);
    const [fail, setFail] = useState(exampleData.exampleTrue !== exampleData.examplePredicted);
    // const { setIsLoading } = useTreeContext();

    useEffect(() => {
        if (exampleOutput === examplePredicted) {
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
        commitUpdateRowOutput(exampleData, exampleData.examplePredicted);
    };

    const commitFail = () => {
        setExampleOutput("");
        commitUpdateRowOutput(exampleData, "");
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
        if (event.key === "Escape" || ((event.shiftKey) && event.key === 'Enter')) {
            console.log(exampleText)
            commitUpdateRowText(exampleData, exampleText);
            setIsEditingExampleText(false);
        }
    }

    const handleExampleOutputChange = (e) => {
        setExampleOutput(e.target.value);
    }

    const handleExampleOutputKeyDown = (event) => {
        if (event.key === "Escape" ||  ((event.shiftKey) && event.key === 'Enter')) {
            console.log(exampleOutput)
            commitUpdateRowOutput(exampleData, exampleOutput);
            setIsEditingExampleOutput(false);
        }
    }

    const handleDeleteRow = () => {
        commitDeleteRow(exampleData.id);
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

    const commitUpdateRowText = async (example, text) => {
        try {
            const newExampleData = await fetchAPIDATA("updateExample", {
                "nodeId": nodeId,
                "exampleId": example.id,
                "exampleText": text,
                "exampleTrue": example.exampleTrue,
                "isSuggested": example.isSuggested,
                "exampleOffTopic": example.exampleOffTopic
            }, true);
            setExamplePredicted(newExampleData.examplePredicted);
            commitUpdateExample(newExampleData);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitUpdateRowOutput = async (example, text) => {
        try {
            const newExampleData = await fetchAPIDATA("updateExample",{
                "nodeId": nodeId,
                "exampleId": example.id,
                "exampleText": example.exampleText,
                "exampleTrue": text,
                "isSuggested": example.isSuggested,
                "exampleOffTopic": example.exampleOffTopic
            }, true);
            commitUpdateExample(newExampleData);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

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
        border: "none", 
        backgroundColor: "rgb(247, 247, 247)", 
        textAlign: "right",
        outline: "none",
        boxShadow: "none",
    }

    const editSpecialCSSOutput = {
        width: "100%", 
        height: "100%", 
        border: "none", 
        backgroundColor: "rgb(247, 247, 247)", 
        textAlign: "left",
        outline: "none",
        boxShadow: "none",
        overflowWrap: "break-word",
    }


    return (
            <tr onClick={handleRowSelect}
            
                style={
                    selectedRow === exampleData.id ?
                        {backgroundColor: "rgb(247, 247, 247)"} :
                        {backgroundColor: "rgb(255, 255, 255)"}
            }>
            {
                isEditingExampleText ?
                    <td><textarea name="text" value={exampleText} 
                        onChange={handleExampleTextChange} 
                        onKeyDown={handleExampleTextKeyDown} 
                        style={editSpecialCSSText} wrap="soft"/></td>:
                    <td onClick={handleExampleTextClick}>{exampleText}</td>
            }

            <td><FaLongArrowAltRight style={{fontSize: "30px", color: "rgb(144, 144, 144)"}}/></td>
            
            {
                isEditingExampleOutput ?
                    <td><input name="text" value={exampleOutput} 
                        onChange={handleExampleOutputChange} 
                        onKeyDown={handleExampleOutputKeyDown} 
                        style={editSpecialCSSOutput} wrap="soft"/></td> :
                    <td onClick={handleExampleOutputClick}>{exampleOutput}</td>

            }
            
            <td>
                {
                    examplePredicted
                }
            </td>
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
                        <BiAddToQueue onClick={handleAddSuggested} style={{fontSize: "20px", cursor: "pointer"}}/> :
                        <BiAddToQueue style={{fontSize: "20px", opacity: "0"}}/>
                }
            </td>

            <td onClick={handleDeleteRow} >
                <RiDeleteBin2Line style={{fontSize: "20px", cursor: "pointer"}}/>
            </td>

            </tr>
    );
}

export { Row };