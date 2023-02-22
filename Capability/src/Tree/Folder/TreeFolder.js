import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  AiOutlineFolder,
  AiOutlineFolderOpen,
  AiOutlinePlus,
  AiFillEdit,
  AiOutlineMinus,
  AiFillFolder,
  AiFillFolderOpen,
} from "react-icons/ai";

import { MdDeleteForever } from "react-icons/md";
import {FaFolderPlus} from "react-icons/fa";
import { BiRefresh } from "react-icons/bi";

import {
  ActionsWrapper,
  Collapse,
  StyledName,
  VerticalLine,
  StyledTag
} from "../Tree.style";
import { StyledFolder } from "./TreeFolder.style";

import { useTreeContext } from "../state/TreeContext";
import { PlaceholderInput } from "../TreePlaceholderInput";
import {fetchAPIDATA} from "../../utils";
import { Dropdown } from "../Dropdown/dropdown";

const StyledRelation = ({node, nodeTag}) => {

  const { dispatch, setIsLoading } = useTreeContext();

  const commitRemoveSimilarRelationSiblings = async (node, nodeTag) => {
    try {
      const newData = await fetchAPIDATA("removeSimilarRelationSiblings/nodeId=" + node.id + "&tag=" + nodeTag);
      dispatch({ type: "SET_DATA", payload: newData });
    } catch (error) {
      console.log(error);
    }
  }

  const commitAddSimilarRelationSiblings = async (node, nodeTag) => {
    try {
      setIsLoading(true);
      const newData = await fetchAPIDATA("addSimilarRelationSiblings/nodeId=" + node.id + "&tag=" + nodeTag);
      dispatch({ type: "SET_DATA", payload: newData });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleActionPlusClick = (event) => {
    event.stopPropagation();
    console.log("handleActionPlusClick", event)
    commitAddSimilarRelationSiblings(node, nodeTag)
  }

  const handleActionCrossClick = (event) => {
    event.stopPropagation();
    console.log("handleActionCrossClick", event)
    commitRemoveSimilarRelationSiblings(node, nodeTag)
  }

  return (
    <StyledTag>
      {nodeTag}
        <div className="actionbutton">
          <i class="fa fa-plus" aria-hidden="true" onClick={handleActionPlusClick}></i>
          &nbsp;&nbsp;
          <i class="fa fa-times" aria-hidden="true" onClick={handleActionCrossClick}></i>
        </div>
    </StyledTag>
  )
}

const FolderName = ({ isOpen, name, handleClick, isHighlighted, node, isEditing, type}) => {

  let parentName = node.parentNode.name
  let nodeTag = node.tag[0]

  if (type === "folderCreation") {
    console.log("FolderName", node, type, isEditing, node.tag.length)
    parentName = node.name
    nodeTag = "RELATEDTO"
  }
  return (
    <StyledName onClick={handleClick}>
      {
        isHighlighted ?
          isOpen ? <AiFillFolderOpen /> : <AiFillFolder /> :
          isOpen ? <AiOutlineFolderOpen /> : <AiOutlineFolder />
      }
      {!isEditing ? 
        node.tag.length > 0 ? node.tag.map((tag) => <StyledRelation node={node} nodeTag={tag}/>) : null :
        node.tag.length ? (<Dropdown node={node}/>): null
      }
      &nbsp;&nbsp;{name}
    </StyledName>
  )
};

const Folder = ({ id, name, children, node, root}) => {
  const { dispatch, onNodeClick, setIsLoading } = useTreeContext();
  const [isEditing, setEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(node.isOpen);
  const [childs, setChilds] = useState([]);

  // Setting new const here
  const [tags, setTags] = useState(node.tags);

  const setNodeOpen = async (open) => {
    try {
      if (open) {
        setIsLoading(true);
      }

      const newData = await fetchAPIDATA("setOpen/nodeId=" + node.id + "&isOpen=" + open);
      dispatch({ type: "SET_DATA", payload: newData });
      setIsOpen(open);
      
      if (open) {
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const setNodeHighlighted = async (highlighted) => {
    try {
      const newData = await fetchAPIDATA("setHighlighted/nodeId=" + node.id + "&isHighlighted=" + highlighted);
      dispatch({ type: "SET_DATA", payload: newData });
      // setHighlighted(highlighted);
    } catch (error) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    setIsOpen(node.isOpen);
  }, [node.isOpen]);

  useEffect(() => {
    setTags(node.tags);
  }, [node.tags]);

  useEffect(() => {
    setChilds([children]);
  }, [children]);

  const commitFolderCreation = async (name) => {
    try {
      if (name === "") {
        name = "New Topic";
      }
      console.log("commitFolderCreation");
      const newData = await fetchAPIDATA("addNode/parentID=" + node.id + "&nodeName=" + name + "&nodeTag=RELATEDTO");
      dispatch({ type: "SET_DATA", payload: newData });
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };
  const commitDeleteFolder = async () => {
    try {
      const newData = await fetchAPIDATA("deleteNode/nodeId=" + node.id);
      dispatch({ type: "SET_DATA", payload: newData });
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const commitFolderEdit = async (name) => {
    try {
      const newData = await fetchAPIDATA("editFolderName/nodeId=" + id + "&newName=" + name);
      dispatch({ type: "SET_DATA", payload: newData });
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const commitSuggestions = async () => {
    try {

      setIsLoading(true);
      const newData = await fetchAPIDATA("getSuggestions/nodeId=" + id);
      dispatch({ type: "SET_DATA", payload: newData });
      setEditing(false);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setChilds([children]);
  };

  const handleNodeClick = React.useCallback(
    (event) => {
      event.stopPropagation();
      onNodeClick({ node });
    },
    [node]
  );

  const handleFolderCreation = (event) => {
    event.stopPropagation();
    setIsOpen(true);
    console.log("handleFolderCreation");
    setChilds([
      ...childs,
      <PlaceholderInput
        type="folderCreation"
        onSubmit={commitFolderCreation}
        onCancel={handleCancel}
        defaultValue="New Topic"
        node={node}
        isEditing={false}
      />,
    ]);
  };

  const handleFolderRename = () => {
    setNodeOpen(true)
    setEditing(true);
  };

  return (
    <StyledFolder id={id} onClick={handleNodeClick} className="tree__folder">
        <VerticalLine root={false}>
          <ActionsWrapper>
            {/* {root ? (<div style={{marginRight: "15px"}} >></div>) : null} */}
            {/* {node.tag.length ? (<Dropdown node={node}/>): null} */}
            {isEditing ? (
              <PlaceholderInput
                style={{ paddingLeft: 0}}
                isHighlighted={node.isHighlighted}
                defaultValue={name}
                node={node}
                onCancel={handleCancel}
                onSubmit={commitFolderEdit}
                isEditing={true}
              />
            ) : (
              <FolderName
                name={name}
                isOpen={isOpen}
                isHighlighted={node.isHighlighted}
                node={node}
                handleClick={() => setNodeOpen(!isOpen)}
              />
            )}

            <div className="actions">
              {root ? null : node.isHighlighted ?
                <AiOutlineMinus onClick={() => setNodeHighlighted(false)} /> :
                <AiOutlinePlus onClick={() => setNodeHighlighted(true)} /> }
              <BiRefresh onClick={commitSuggestions} />
              <AiFillEdit onClick={handleFolderRename} />
              <FaFolderPlus onClick={handleFolderCreation} />
              {root ? null : <MdDeleteForever onClick={commitDeleteFolder} />}
            </div>
          </ActionsWrapper>
          {(node.isOpen || isOpen) && (
            <Collapse className="tree__folder--collapsible" isOpen={isOpen}>
            {childs}
          </Collapse>
          )}
        </VerticalLine>
    </StyledFolder>
  );
};

export { Folder, FolderName };
