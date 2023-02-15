import React, { useState, useLayoutEffect } from "react";
import { useTreeContext } from "../state/TreeContext";
import {fetchAPIDATA} from "../../utils";
import { dropdown } from "./dropdown.css";

// create a const array of relationships and map through it to create a dropdown item for each relationship
const relationships = [
    {id: 1, name: "RelatedTo", acronym: "RT"},
    {id: 2, name: "TypeOf", acronym: "TO"},
    {id: 3, name: "InstanceOf", acronym: "IO"},
    {id: 4, name: "PartOf", acronym: "PO"},
    {id: 5, name: "HasProperty", acronym: "HP"},
    {id: 6, name: "UsedFor", acronym: "UF"},
    {id: 7, name: "HasA", acronym: "HA"},
    {id: 8, name: "AtLocation", acronym: "AL"},
    {id: 9, name: "Causes", acronym: "Ca"},
    {id: 10, name: "MotivatedByGoal", acronym: "MBG"},
    {id: 11, name: "ObstructedBy", acronym: "OB"},
    {id: 12, name: "MannerOf", acronym: "MO"},
    {id: 13, name: "LocatedNear", acronym: "LN"},
]

const Dropdown = ({node}) => {

    // console.log("tag node: ", node)

    let sampleTagAcronym = ""
    for (let i = 0; i < relationships.length; i++) {
        if (relationships[i].name === node.tag[0]) {
            sampleTagAcronym = relationships[i].acronym
            break
        }
    }
    const [selectedTag, setSelectedTag] = useState(sampleTagAcronym)
    const [isActive, setIsActive] = useState(false)

    // Filter out the selected tag from the relationships array
    const [tagsChoice, setTagsChoice] = useState(relationships.filter((relationship) => 
                    relationship.name.charAt(0).toUpperCase() + relationship.name.slice(1) !== selectedTag))

    const { dispatch, isImparative, onNodeClick } = useTreeContext();

    const commitTagSelection = async (node, selectedTag) => {
        console.log("node: ", node, "selectedTag: ", selectedTag)
        try {
            const newData = await fetchAPIDATA("setNodeTag/nodeId=" + node.id + "&tag=" + selectedTag);
            dispatch({type: "SET_DATA", payload: newData})
        } catch (error) {
            console.error(error);
        }
    };

    // Handle the click event on the dropdown item
    const handleTagSelection = (e) => {
        let selectedTagAcronym = e.target.innerText
        let selectedTagName = ""

        for (let i = 0; i < relationships.length; i++) {
            if (relationships[i].acronym === selectedTagAcronym) {
                selectedTagName = relationships[i].name
                break
            }
        }

        console.log("selectedTagAcronym: ", selectedTagAcronym, "selectedTagName: ", selectedTagName)
        setSelectedTag(selectedTagAcronym)
        setTagsChoice(relationships.filter((relationship) => 
                    relationship.acronym !== selectedTagAcronym))
        commitTagSelection(node, selectedTagName)
        setIsActive(false)
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
        <div className="dropdown">
            <div className="dropbtn" onClick={handleDropdownClick}>({selectedTag})</div>
            {isActive &&
            (<div className="dropdown-content">
                {
                    tagsChoice.map((relationship) => {
                        return (
                            <div onClick={handleTagSelection} className="dropdown-item" value={relationship.name}>{relationship.acronym}</div>
                        )
                    })
                }
            </div>)}
        </div>
    )
}

export { Dropdown };