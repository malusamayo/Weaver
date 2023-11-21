import React, { useState, useLayoutEffect } from "react";
import { useTreeContext } from "../state/TreeContext";
import {fetchAPIDATA} from "../../utils";
import "./dropdown.css";

// create a const array of relationships and map through it to create a dropdown item for each relationship
const relationships = [
    {id: 1, value: "RELATEDTO", label:"RELATEDTO", acronym: "RT"},
    {id: 2, value: "TYPESOF", label:"TYPESOF", acronym: "TO"},
    {id: 3, value: "PARTOF", label:"PARTOF", acronym: "PO"},
    {id: 4, value: "HASPROPERTY", label:"HASPROPERTY", acronym: "HP"},
    {id: 5, value: "USEDFOR", label:"USEDFOR", acronym: "UF"},
    {id: 6, value: "ATLOCATION", label:"ATLOCATION", acronym: "AL"},
    {id: 7, value: "CAUSES", label:"CAUSES", acronym: "Ca"},
    {id: 8, value: "MOTIVATEDBY", label:"MOTIVATEDBY", acronym: "MBG"},
    {id: 9, value: "OBSTRUCTEDBY", label:"OBSTRUCTEDBY", acronym: "OB"},
    {id: 10, value: "MANNEROF", label:"MANNEROF", acronym: "MO"},
    {id: 11, value: "LOCATEDNEAR", label:"LOCATEDNEAR", acronym: "LN"},
    {id: 12, value: "HASPATIENT", label:"HASPATIENT", acronym: "HP"},
    {id: 13, value: "HASAGENT", label:"HASAGENT", acronym: "HA"},
]

const Dropdown = ({node}) => {


    const [selectedTag, setSelectedTag] = useState(node.nl_tag[0])
    const [isActive, setIsActive] = useState(true)

    // Filter out the selected tag from the relationships array
    const tagsChoice = relationships

    const { dispatch } = useTreeContext();

    const commitTagSelection = async (node, selectedTag) => {
        console.log("node: ", node, "selectedTag: ", selectedTag)
        selectedTag = selectedTag.toUpperCase()
        try {
            const newData = await fetchAPIDATA("setNodeTag", {
                "nodeId": node.id,
                "tag": selectedTag
            }, true);
            dispatch({type: "SET_DATA", payload: newData})
        } catch (error) {
            console.error(error);
        }
    };

    // Handle the click event on the dropdown item
    const handleTagSelection = (e) => {
        let selectedTagName = e.target.innerText

        setSelectedTag(selectedTagName)
        commitTagSelection(node, selectedTagName)
    }

    const handleDropdownClick = () => {
        setIsActive(!isActive)
    }

    // Add mouse down event listener to the document to close the dropdown when the user clicks outside of it
    useLayoutEffect(() => {
        const handleMouseDown = (e) => {
            if (e.target.className !== "dropdown-item" && e.target.className !== "dropbtn") { 
                setIsActive(false)
            }
        }
        document.addEventListener("mousedown", handleMouseDown)
        return () => {
            document.removeEventListener("mousedown", handleMouseDown)
        }
    }, [])
    

    return (
        <div className="ddown">
            <div className="dropbtn" onClick={handleDropdownClick}>({selectedTag})</div>
            {isActive &&
            (<div className="dropdown-content">
                {
                    tagsChoice.map((relationship) => {
                        return (
                            <div onClick={handleTagSelection} className="dropdown-item" value={relationship.value} key={relationship.id}>
                                {relationship.value}
                            </div>
                        )
                    })
                }
            </div>)}
        </div>
    )
}

export { Dropdown, relationships };