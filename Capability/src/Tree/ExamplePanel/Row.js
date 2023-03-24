import React, { useState, useEffect, useRef } from "react";
import { FaBan } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { useTreeContext } from "../state/TreeContext";
import {fetchAPIDATA} from "../../utils";

const ExamplePanelOff = () => {
    return (
        <div>
            <FaBan style={{fontSize: "20px", opacity: "1", color: "rgb(197, 143, 59)", fontWeight: "bold"}}/>
        </div>
    );
}

const ExamplePanelPass = () => {
    return (
        <div>
            <div style={{margin: "0px", backgroundColor: "rgb(230, 238, 230)", padding: "1px"}}>
                <TiTick style={{fontSize: "25px", opacity: "1", color: "rgb(61, 125, 68)"}}/>
            </div>
        </div>
    );
}

const ExamplePanelFail = () => {
    return (
        <div>
            <ImCross style={{fontSize: "12px", opacity: "1", color: "rgb(190, 53, 53"}}/>
        </div>
    );
}

const Row = ({exampleData, setSelectedRow, selectedRow, nodeId, setSelectedNodeExamples, isSuggested}) => {

    const [example, setExample] = useState(null);

    // For editing the example text
    const [isEditingExampleText, setIsEditingExampleText] = useState(false);
    const [exampleText, setExampleText] = useState(exampleData.exampleText);

    // For editing the example output
    const [isEditingExampleOutput, setIsEditingExampleOutput] = useState(false);
    const [exampleOutput, setExampleOutput] = useState(exampleData.exampleTrue);

    const [offTopic, setOffTopic] = useState(false);
    const [pass, setPass] = useState(true);
    const [fail, setFail] = useState(false);
    // const { setIsLoading } = useTreeContext();

    useEffect(() => {
        if (example) {
            setExample(exampleData);
            setExampleOutput(exampleData.exampleTrue);
            if (exampleData.exampleOffTopic === true) {
                setOffTopic(true);
                setPass(false);
                setFail(false);
            } else if (exampleOutput === exampleData.examplePredicted) {
                setOffTopic(false);
                setPass(true);
                setFail(false);
            } else {
                setOffTopic(false);
                setPass(false);
                setFail(true);
            }
            console.log("example: ", example);
        }
    });

    

    useEffect(() => {
        if (exampleData.exampleOffTopic === true) {
            setOffTopic(true);
            setPass(false);
            setFail(false);
        } else if (exampleOutput === exampleData.examplePredicted) {
            setOffTopic(false);
            setPass(true);
            setFail(false);
        } else {
            setOffTopic(false);
            setPass(false);
            setFail(true);
        }
    }, [exampleOutput]);

    useEffect(() => {
        if (offTopic === true) {
            setPass(false);
            setFail(false);
        } else if (exampleOutput === exampleData.examplePredicted) {
            setOffTopic(false);
            setPass(true);
            setFail(false);
        } else {
            setOffTopic(false);
            setPass(false);
            setFail(true);
        }
    }, [offTopic]);

    const handleRowSelect = () => {
        setSelectedRow(exampleData.id);
    }

    const commitOffTopic = () => {
        setOffTopic(!offTopic);
        console.log("commitOffTopic: ", !offTopic);
        commitExampleStatus(!offTopic);
        // setPass(false);
        // setFail(false);
    };

    // const commitPass = () => {
    //     setOffTopic(false);
    //     setPass(true);
    //     setFail(false);
    // };

    // const commitFail = () => {
    //     setOffTopic(false);
    //     setPass(false);
    //     setFail(true);
    // };

    const handleExampleTextClick = () => {
        setIsEditingExampleText(true);
    }

    const handleExampleOutputClick = () => {
        setIsEditingExampleOutput(true);
    }

    const handleExampleTextChange = (e) => {
        setExampleText(e.target.value);
        commitUpdateRowText(exampleData, e.target.value);
        if (e.key === "Enter") {
            setIsEditingExampleText(false);
        }
    }

    const handleExampleOutputChange = (e) => {
        setExampleOutput(e.target.value);
        commitUpdateRowOutput(exampleData, e.target.value);
        if (e.key === "Enter") {
            setIsEditingExampleOutput(false);
        }
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


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" || event.key === "Enter") {
                event.stopPropagation();
                setIsEditingExampleText(false);
                setIsEditingExampleOutput(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (selectedRow !== exampleData.id) {
            setIsEditingExampleText(false);
            setIsEditingExampleOutput(false);
        }
    }, [selectedRow]);

    const commitUpdateRowText = async (example, text) => {
        try {
            const newDataExamples = await fetchAPIDATA("updateExample", {
                "nodeId": nodeId,
                "exampleId": example.id,
                "exampleText": text,
                "exampleTrue": example.exampleTrue,
                "isSuggested": example.isSuggested,
                "exampleOffTopic": example.exampleOffTopic
            }, true);
            setSelectedNodeExamples(newDataExamples);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitUpdateRowOutput = async (example, text) => {
        try {

            const newDataExamples = await fetchAPIDATA("updateExample",{
                "nodeId": nodeId,
                "exampleId": example.id,
                "exampleText": example.exampleText,
                "exampleTrue": text,
                "isSuggested": example.isSuggested,
                "exampleOffTopic": example.exampleOffTopic
            }, true);
            setSelectedNodeExamples(newDataExamples);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const commitExampleStatus = async (offTopicSelection) => {
        try {
            const newDataExamples = await fetchAPIDATA("updateExample", {
                "nodeId": nodeId,
                "exampleId": exampleData.id,
                "exampleText": exampleData.exampleText,
                "exampleTrue": exampleData.exampleTrue,
                "isSuggested": exampleData.isSuggested,
                "exampleOffTopic": offTopicSelection
            }, true);
            setSelectedNodeExamples(newDataExamples);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

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
            <tr onClick={() => handleRowSelect()} 
            
                style={selectedRow === exampleData.id ?
                    {backgroundColor: "rgb(247, 247, 247)"} :
                    {backgroundColor: "rgb(255, 255, 255)"}
            }>
            {
                isEditingExampleText ?
                    <td><textarea name="text" value={exampleText} onChange={(e) => handleExampleTextChange(e)} style={editSpecialCSSText} wrap="soft"/></td> :
                    <td onClick={handleExampleTextClick}>{exampleText}</td>
            }

            <td><FaLongArrowAltRight style={{fontSize: "30px", color: "rgb(144, 144, 144)"}}/></td>
            
            {
                isEditingExampleOutput ?
                    <td><input name="text" value={exampleOutput} onChange={(e) => handleExampleOutputChange(e)} style={editSpecialCSSOutput} wrap="soft"/></td> :
                    <td onClick={handleExampleOutputClick}>{exampleOutput}</td>

            }
            
            <td>
                {
                    exampleData.examplePredicted
                }
            </td>
            {
                isSuggested ?
                    (
                        <td onClick={commitOffTopic}>
                            {
                                offTopic ?
                                    <ExamplePanelOff /> :
                                    <FaBan style={{fontSize: "20px", opacity: "0.2"}}/>
                            }
                        </td>
                    ) :
                    (
                        <td></td>
                    )
            }
            <td>
                {
                    pass ?
                        <ExamplePanelPass /> :
                        <TiTick style={{fontSize: "25px", opacity: "0.2"}}/>
                }
            </td>
            <td>
                {
                    fail ?
                        <ExamplePanelFail /> :
                        <ImCross style={{fontSize: "12px", opacity: "0.2"}}/>
                }
            </td>
            </tr>
    );
}

export { Row };