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

const Row = ({exampleData, setSelectedRow, selectedRow, nodeId, setSelectedNodeExamples}) => {

    const [example, setExample] = useState(null);
    const [isEditingExampleText, setIsEditingExampleText] = useState(false);
    const [exampleText, setExampleText] = useState(exampleData.exampleText);
    const [offTopic, setOffTopic] = useState(false);
    const [pass, setPass] = useState(true);
    const [fail, setFail] = useState(false);
    const { setIsLoading } = useTreeContext();

    useEffect(() => {
        if (example) {
            setExample(exampleData)
            setPass(exampleData.exampleTrue === exampleData.examplePredicted ? true : false)
            setFail(exampleData.exampleTrue !== exampleData.examplePredicted ? true : false)
            console.log("example: ", example)
        }
    }, [exampleData]);

    const handleRowSelect = () => {
        setSelectedRow(exampleData.id)
    }

    const commitOffTopic = () => {
        setOffTopic(true)
        setPass(false)
        setFail(false)
    };

    const commitPass = () => {
        setOffTopic(false)
        setPass(true)
        setFail(false)
    };

    const commitFail = () => {
        setOffTopic(false)
        setPass(false)
        setFail(true)
    };

    const handleExampleTextClick = () => {
        setIsEditingExampleText(true)
    }

    const handleExampleTextChange = (e) => {
        setExampleText(e.target.value);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            // if (event.key === "Escape") or (event.key === "Enter") {
            if (event.key === "Escape" || event.key === "Enter") {
                commitUpdateRow(exampleData);
                event.stopPropagation();
                setIsEditingExampleText(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // useEffect(() => {
    //     if (selectedRow !== exampleData.id) {
    //         setIsEditingExampleText(false);
    //         if (exampleText !== "Add an example") {
    //             commitUpdateRow(exampleData);
    //         }
    //     }
    // }, [selectedRow]);

    const commitUpdateRow = async (example) => {
        try {
            setIsLoading(true);
            const newDataExamples = await fetchAPIDATA("updateExample/nodeId=" + nodeId +
                "&exampleId=" + example.id +
                "&exampleText=" + exampleText +
                "&exampleTrue=" + example.exampleTrue +
                "&isSuggested=" + example.isSuggested +
                "&exampleOffTopic=" + example.exampleOffTopic);
            console.log("newDataExamples: ", newDataExamples);
            setSelectedNodeExamples(newDataExamples);
            setIsLoading(false);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    const editSpecialCSS = {
        width: "100%", 
        height: "100%", 
        border: "none", 
        backgroundColor: "rgb(247, 247, 247)", 
        textAlign: "right",
        // outline: "none",
        // boxShadow: "none",
    }


    return (
            <tr onClick={() => handleRowSelect()} 
            
                style={selectedRow === exampleData.id ?
                    {backgroundColor: "rgb(247, 247, 247)"} :
                    {backgroundColor: "rgb(255, 255, 255)"}
            }>
            {/* <td>{exampleData.exampleText}</td> */}
            {
                isEditingExampleText ?
                    <td><input type="text" value={exampleText} onChange={(e) => handleExampleTextChange(e)} style={editSpecialCSS}/></td> :
                    <td onClick={handleExampleTextClick}>{exampleText}</td>
            }
            <td><FaLongArrowAltRight style={{fontSize: "30px", color: "rgb(144, 144, 144)"}}/></td>
            
            {/* <td onClick={handleExampleTextClick}>{exampleText}</td> */}
            <td>{exampleData.examplePredicted}</td>
            
            <td onClick={commitOffTopic}>
                {
                    offTopic ?
                        <ExamplePanelOff /> :
                        <FaBan style={{fontSize: "20px", opacity: "0.2"}}/>
                }
            </td>
            <td onClick={commitPass}>
                {
                    pass ?
                        <ExamplePanelPass /> :
                        <TiTick style={{fontSize: "25px", opacity: "0.2"}}/>
                }
            </td>
            <td onClick={commitFail}>
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