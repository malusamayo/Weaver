import React, {useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Tooltip } from 'react-tooltip';
import {
  // AiOutlinePlus,
  AiFillEdit,
  // AiOutlineMinus,
  // AiFillFolder,
  // AiFillFolderOpen,
} from "react-icons/ai";
import {
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";
import {
  VscTriangleRight,
  VscTriangleDown
} from "react-icons/vsc";

import { MdDeleteForever } from "react-icons/md";
import { FaFolderPlus } from "react-icons/fa";
// import { BiRefresh } from "react-icons/bi";
import { BsSearch, BsFillPlusCircleFill } from "react-icons/bs";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
// import { ImPlus, ImCross } from "react-icons/im";

import {
  ActionsWrapper,
  Collapse,
  StyledName,
  VerticalLine,
  StyledTag,
  // StyledAddTopic,
} from "../Tree.style";
import { StyledFolder, NumberCircle } from "./TreeFolder.style";

import { useTreeContext } from "../state/TreeContext";
import { PlaceholderInput } from "../TreePlaceholderInput";
import {fetchAPIDATA} from "../../utils";
import "../Dropdown/dropdown.css";
import { AlertDelete } from "./AlertDelete";
// import { size } from "lodash";


const tooltip_style= {
  zIndex: 9999, 
  position: "absolute", 
  backgroundColor: "rgba(54, 54, 54, 1)",
  padding : "5px",
  fontSize: "80%",
};

const selected_node_style = {
  cursor: "pointer", 
  background:" #ffef86", 
  borderRadius: "6px", 
  paddingLeft: "5px", 
  paddingRight: "5px"
}

const StyledRelation = ({node, nodeTag}) => {

  // const { dispatch, setIsLoading } = useTreeContext();

  // const commitRemoveSimilarRelationSiblings = async (node, nodeTag) => {
  //   try {
  //     const newData = await fetchAPIDATA("removeSimilarRelationSiblings", {
  //       "nodeId": node.id,
  //       "tag": nodeTag
  //     }, true);
  //     dispatch({ type: "SET_DATA", payload: newData });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // const commitAddSimilarRelationSiblings = async (node, nodeTag) => {
  //   try {
  //     setIsLoading(true);
  //     const newData = await fetchAPIDATA("addSimilarRelationSiblings", {
  //       "nodeId": node.id,
  //       "tag": nodeTag
  //     }, true);
  //     dispatch({ type: "SET_DATA", payload: newData });
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // const handleActionPlusClick = (event) => {
  //   event.stopPropagation();
  //   // console.log("handleActionPlusClick", event)
  //   commitAddSimilarRelationSiblings(node, nodeTag)
  // }

  // const handleActionCrossClick = (event) => {
  //   event.stopPropagation();
  //   // console.log("handleActionCrossClick", event)
  //   commitRemoveSimilarRelationSiblings(node, nodeTag)
  // }

  return (
    <StyledTag>
      <div style={{alignItems:"top"}}>
        {nodeTag}
      </div>
      {/* <div className="actionbutton">
        <ImPlus onClick={handleActionPlusClick} />
        &nbsp;&nbsp;
        <ImCross onClick={handleActionCrossClick} />
      </div> */}
    </StyledTag>
  )
}

const FolderName = ({ isOpen, name, handleClick, handleDoubleClick, isHighlighted, node, isEditing, handleNodeClick, type}) => {

  const { selectedNode, setNodeHighlighted} = useTreeContext();
  const [tag, setTags] = useState(node.nl_tag);

  useEffect(() => {
    setTags(node.nl_tag);
  }, [node.nl_tag]);


  // if (type === "specialAddSuggestion") {
  //   return (
  //     <StyledName onClick={handleClick}>
  //       <BiRefresh /> &nbsp;&nbsp; {name} 
  //     </StyledName>
  //   )
  // }

  // let parentName = node.parentNode.name
  // let nodeTag = node.nl_tag[0]

  // if (type === "folderCreation") {
  //   // console.log("FolderName", node, type, isEditing, node.nl_tag.length)
  //   parentName = node.name
  //   nodeTag = "RELATEDTO"
  // }

  // const tooltip_style= {
  //   zIndex: 9999, 
  //   position: "absolute", 
  //   backgroundColor: "rgba(54, 54, 54, 1)",
  //   padding : "5px",
  //   fontSize: "80%",
  // };
  
  // make const anchor_id = "node-info-" + node.id and all spaces in node.id to be replaced by "-"
  const anchor_id = "node-info-" + node.id;

  const handleNodeHighlight = (event) => {
    event.stopPropagation();
    setNodeHighlighted(node.id, !isHighlighted);
    // handleNodeClick(event);
  }
    
  return (
    <StyledName>
      <div style={{cursor: "pointer"}}>
      {
        // isHighlighted ?
          // isOpen ? <AiFillFolderOpen onClick={handleNodeHighlight}/> : <AiFillFolder onClick={handleNodeHighlight}/> :
          isOpen ? <VscTriangleDown onClick={handleClick}/> : <VscTriangleRight onClick={handleClick}/>
      }
      </div>
      <div style={{cursor: "pointer"}} onClick={handleNodeClick}>
      {
        isHighlighted ? 
          <RiCheckboxCircleFill onClick={handleNodeHighlight} id="unhighlight-topic"/> :
          <RiCheckboxBlankCircleLine onClick={handleNodeHighlight} id="highlight-topic"/>
      }
      </div >
      <div onClick={handleNodeClick}>
      {
        tag.map((tag, index) => <StyledRelation node={node} nodeTag={tag} key={index}/>)
      // !isEditing ? 
      //   node.nl_tag.length > 0 ? node.nl_tag.map((tag, index) => <StyledRelation node={node} nodeTag={tag} key={index}/>) : null :
      //   node.nl_tag.length ? (<Dropdown node={node}/>): null
      }
      </div>
      &nbsp;&nbsp;
      {
        selectedNode && (selectedNode.node.id === node.id) ? 
        <div id={anchor_id} onDoubleClick={handleDoubleClick} onClick={handleNodeClick} style={selected_node_style}>
          {name}
        </div> :
        <div id={anchor_id} onDoubleClick={handleDoubleClick} onClick={handleNodeClick} style={{cursor: "pointer"}}>
          {name}
        </div>
      }
      
      <Tooltip place="bottom" anchorSelect="#highlight-topic" content="Highlight the Topic" style={tooltip_style}/>
      <Tooltip place="bottom" anchorSelect="#unhighlight-topic" content="Unhighlight the Topic" style={tooltip_style}/>
    </StyledName>
  )
};

// const SpecialAddTopicFolder = ({commitSuggestions}) => {
//   return (
//     <p onClick={commitSuggestions}>... Add Topics</p>
//   );
// }
// function areEqual(prevProps, nextProps) {
//   // Only update if the 'name' or 'age' prop has changed
//   return prevProps.name === nextProps.name;
// }

const Folder = React.memo(({ id, name, children, node, root, toggleIsHighlighted}) => {
  const { dispatch, onNodeClick, setIsLoading, setNodeHighlighted } = useTreeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(node.isOpen);
  const [childs, setChilds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // const [numPass, setNumPass] = useState(0);
  // const [numFail, setNumFail] = useState(0);

  useLayoutEffect(() => {
    setIsOpen(node.isOpen);
  }, [node.isOpen]);

  useEffect(() => {
    setChilds(children);
  }, [children]);

  // useEffect(() => {
  //   let userExample = node.examples.filter((example) => !example.isSuggested)
  //   let nPass = userExample.filter((example) => (example.exampleTrue === example.examplePredicted) || (example.exampleTrue === "")).length;
  //   let nFail = userExample.filter((example) => (example.exampleTrue !== example.examplePredicted) && (example.exampleTrue !== "")).length;
  //   setNumPass(nPass);
  //   setNumFail(nFail);
  // }, [node.examples]);

  // // handle hover over className="AddFolder"
  // useEffect(() => {
  //   const handleMouseOverForAddFolder = (event) => {
  //     if (event.target.className === "AddFolder") {
  //       // Show a box with the text "Add Topic" in it
  //       console.log("Mouse Over Add Folder");
  //     }
  //   };
  //   document.addEventListener("mouseover", handleMouseOverForAddFolder);
  //   return () => {
  //     document.removeEventListener("mouseover", handleMouseOverForAddFolder);
  //   };
  // }, []);

  const setNodeOpen = async (open) => {
    try {
      // if (open) {
      setIsLoading(true);
      // }

      // console.log("setNodeOpen", node.id, open)
      const newData = await fetchAPIDATA("setOpen", {
        "nodeId": node.id,
        "isOpen": open
      }, true);
      dispatch({ type: "SET_DATA", payload: newData });
      setIsOpen(open);
      
      // if (open) {
      setIsLoading(false);
      // }

    } catch (error) {
      console.error(error);
    }
  };

  const commitFolderCreation = async (name) => {
    try {
      if (name === "") {
        name = "New Topic";
      }
      // console.log("commitFolderCreation");
      const newData = await fetchAPIDATA("addNode", {
        "parentID": node.id,
        "nodeName": name,
        "nodeTag": "RELATEDTO"
      }, true);
      dispatch({ type: "SET_DATA", payload: newData });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const commitDeleteFolder = async () => {
    try {
      const newData = await fetchAPIDATA("deleteNode", {
        "nodeId": node.id
      }, true);
      dispatch({ type: "SET_DATA", payload: newData });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = () => {
    // console.log("Handle Delete Confirm");
    setIsDeleting(true);
  };

  const handleDeleteFolder = () => {
    // console.log("Handle Delete Folder")
    if (!node.isHighlighted) {
      commitDeleteFolder();
    } else {
      handleDeleteConfirm();
    }
  };

  const commitFolderEdit = async (edit_name) => {
    try {
      if (name !== edit_name) {
        const newData = await fetchAPIDATA("editFolderName", {
          "nodeId": node.id,
          "newName": edit_name
        }, true);
        dispatch({ type: "SET_DATA", payload: newData });
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const commitSuggestions = async () => {
    try {

      setIsLoading(true);
      const newData = await fetchAPIDATA("getSuggestions", {
        "nodeId": id
      });
      dispatch({ type: "SET_DATA", payload: newData });
      setIsEditing(false);
      console.log("commitSuggestions", newData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setChilds([children]);
  };

  const handleNodeClick = useCallback(
    (event) => {
      event.stopPropagation();
      onNodeClick({ node });
    },
    [node, onNodeClick]
  );

  const handleFolderCreation = (event) => {
    event.stopPropagation();
    setIsOpen(true);
    // console.log("handleFolderCreation");
    setChilds([
      <PlaceholderInput
        type="folderCreation"
        onSubmit={commitFolderCreation}
        onCancel={handleCancel}
        defaultValue="New Topic"
        node={{...node, nl_tag: ["related to"]}}
        isEditing={false}
        key={node.id}
      />,
      childs,
    ]);
  };

  const handleFolderRename = () => {
    // setNodeOpen(true)
    setIsEditing(true);
  };

  const commitDragRow = async (nodeId, exampleId) => {
    try {
        await fetchAPIDATA("moveExample", {
            "nodeId": nodeId,
            "exampleId": exampleId,
            "newNodeId": node.id
        }, true);
        if (!node.isHighlighed)
            setNodeHighlighted(node.id, true);
        onNodeClick({ node });
    } catch (error) {
        console.log("Error: ", error);
    }
  };

  const commitMoveTopic = async (nodeId, newParentId) => {
    try {
        await fetchAPIDATA("moveNode", {
            "nodeId": nodeId,
            "newParentId": newParentId
        }, true);
        setIsLoading(true);

        const newData = await fetchAPIDATA("");
        dispatch({ type: "SET_DATA", payload: newData });
  
        setIsLoading(false);
      } catch (error) {
        console.log("Error: ", error);
    }
  };

  const dragOver = (e) => {
    e.preventDefault();
  };
 
  const dragEnter = (e) => {
    e.preventDefault();
  };

  const drop = (e) => {
    e.preventDefault();
    let nodeId = e.dataTransfer.getData("nodeId");
    let exampleId = e.dataTransfer.getData("exampleId");
    if (exampleId !== "") {
        commitDragRow(nodeId, exampleId);
    } else {
        commitMoveTopic(nodeId, node.id);
    }
  };

  const dragStart = (e) => {
    e.dataTransfer.setData('nodeId', node.id);
  };

  const dragEnd = (e) => {
      e.dataTransfer.clearData();
  };

  return (
    <StyledFolder id={id} className="tree__folder">
        <AlertDelete node={node} onConfirm={commitDeleteFolder} isDeleting={isDeleting} setIsDeleting={setIsDeleting}/>
        <VerticalLine root={false}>
          <ActionsWrapper>
            {/* {root ? (<div style={{marginRight: "15px"}} >></div>) : null} */}
            {/* {node.tag.length ? (<Dropdown node={node}/>): null} */}
            {/* <div ref={editTextBox}> */}
            <div 
                onDragStart={dragStart}
                onDragEnd={dragEnd}
                onDrop={drop}
                onDragEnter={dragEnter}
                onDragOver={dragOver}
                draggable
            >
                  {isEditing ? (
                    <PlaceholderInput
                      style={{ paddingLeft: 0}}
                      isHighlighted={node.isHighlighted}
                      defaultValue={name}
                      node={node}
                      onCancel={handleCancel}
                      onSubmit={commitFolderEdit}
                      isEditing={true}
                      handleNodeClick={handleNodeClick}
                    />
                  ) : (
                    <FolderName
                      name={name}
                      isOpen={isOpen}
                      isHighlighted={node.isHighlighted}
                      node={node}
                      handleClick={() => setNodeOpen(!isOpen)}
                      handleDoubleClick={handleFolderRename}
                      handleNodeClick={handleNodeClick}
                    />
                  )}
            </div>
            {/* </div> */}

            {/* <div>
              {/* <TiTick style={{fontSize: "25px", opacity: "1", color: "rgb(61, 125, 68)", cursor: "pointer"}}/> */}
              {/* &nbsp; */}
              {/* <span style={{color: "rgb(61, 125, 68)"}}>{numPass}</span>  */}
              {/* <ImCross style={{fontSize: "12px", opacity: "1", color: "rgb(190, 53, 53", cursor: "pointer"}}/> */}
              {/* &nbsp;
              <span style={{color: "rgb(190, 53, 53)"}}>{numFail}</span> 
              <NumberCircle> {numFail} </NumberCircle>
            </div> */}

            <div className="actions">
              <BsSearch  onClick={handleNodeClick} id="example-panel-explore"/>
              {/* <BiRefresh onClick={commitSuggestions} id="refresh-suggestion"/> */}
              <AiFillEdit onClick={handleFolderRename} id="edit-topic"/>
              <FaFolderPlus onClick={handleFolderCreation} id="add-topic"/>
              {root ? null : <MdDeleteForever onClick={handleDeleteFolder} id="delete-topic"/>}
              <Tooltip place="bottom" anchorSelect="#example-panel-explore" content="Explore Examples" style={tooltip_style}/>
              <Tooltip place="bottom" anchorSelect="#refresh-suggestion" content="Refresh Suggestions" style={tooltip_style}/>
              <Tooltip place="bottom" anchorSelect="#edit-topic" content="Edit Topic" style={tooltip_style}/>
              <Tooltip place="bottom" anchorSelect="#add-topic" content="Add Subtopic Manually" style={tooltip_style}/>
              <Tooltip place="bottom" anchorSelect="#delete-topic" content="Delete Topic" style={tooltip_style}/>
            </div>
          </ActionsWrapper>
          {(node.isOpen || isOpen) && (
            <Collapse className="tree__folder--collapsible" isOpen={isOpen}>
            {childs}
            {
              toggleIsHighlighted? null:
              <StyledName onClick={commitSuggestions} 
                style={{
                  paddingLeft: "22px",
                  fontSize: "90%",
                  color: "grey",
                  cursor: "pointer", 
                  alignItems: "center"
                }}>
                <BsFillPlusCircleFill style={{fontSize: "80%", opacity:"0.8"}}/> &nbsp;&nbsp; 
                <div style={{
                  display: "inline-block",
                  // padding: "2px"
                }}>Show more subtopics for "{name}"</div>
              </StyledName>
            }
          </Collapse>
          )}
        </VerticalLine>
    </StyledFolder>
  );
});

export { Folder, FolderName };
