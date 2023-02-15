import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  AiOutlineFolderAdd,
  AiOutlineFolder,
  AiOutlineFolderOpen,
  AiOutlineDelete,
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
} from "../Tree.style";
import { StyledFolder } from "./TreeFolder.style";

import { useTreeContext } from "../state/TreeContext";
import { PlaceholderInput } from "../TreePlaceholderInput";
import {fetchAPIDATA} from "../../utils";
import { Dropdown } from "../Dropdown/dropdown";

const FolderName = ({ isOpen, name, handleClick, isHighlighted}) => (
  <StyledName onClick={handleClick}>
    {
      isHighlighted ?
        isOpen ? <AiFillFolderOpen /> : <AiFillFolder /> :
        isOpen ? <AiOutlineFolderOpen /> : <AiOutlineFolder />
    }
    &nbsp;&nbsp;{name}
  </StyledName>
);

const Folder = ({ id, name, children, node, root}) => {
  const { dispatch, isImparative, onNodeClick } = useTreeContext();
  const [isEditing, setEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(node.isOpen);
  const [childs, setChilds] = useState([]);

  // Setting new const here
  const [tags, setTags] = useState(node.tags);

  const setNodeOpen = async (open) => {
    try {
      const newData = await fetchAPIDATA("setOpen/nodeId=" + node.id + "&isOpen=" + open);
      dispatch({ type: "SET_DATA", payload: newData });
      setIsOpen(open);
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

  useEffect(() => {
    setChilds([children]);
  }, [children]);

  const commitFolderCreation = async (name) => {
    try {
      if (name === "") {
        name = "New Folder";
      }
      console.log("commitFolderCreation");
      const newData = await fetchAPIDATA("addNode/parentID=" + node.id + "&nodeName=" + name + "&nodeTag=RelatedTo");
      dispatch({ type: "SET_DATA", payload: newData });
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };
  const commitDeleteFolder = async () => {
    try {
      const newData = await fetchAPIDATA("delete/nodeId=" + node.id);
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
        type="folder"
        onSubmit={commitFolderCreation}
        onCancel={handleCancel}
        defaultValue="New Folder"
      />,
    ]);
  };

  const handleFolderRename = () => {
    setNodeOpen(true)
    setEditing(true);
  };

  return (
    <StyledFolder id={id} onClick={handleNodeClick} className="tree__folder">
        <VerticalLine root={root}>
          <ActionsWrapper>
            {/* {root ? (<div style={{marginRight: "15px"}} >></div>) : null} */}
            {node.tag.length ? (<Dropdown node={node}/>): null}
            {isEditing ? (
              <PlaceholderInput
                style={{ paddingLeft: 0}}
                isHighlighted={node.isHighlighted}
                defaultValue={name}
                onCancel={handleCancel}
                onSubmit={commitFolderEdit}
              />
            ) : (
              <FolderName
                name={name}
                isOpen={isOpen}
                isHighlighted={node.isHighlighted}
                handleClick={() => setNodeOpen(!isOpen)}
              />
            )}

            <div className="actions">
              {node.isHighlighted ?
                <AiOutlineMinus onClick={() => setNodeHighlighted(false)} /> :
                <AiOutlinePlus onClick={() => setNodeHighlighted(true)} /> }
              <BiRefresh onClick={() => setNodeOpen(!isOpen)} />
              <AiFillEdit onClick={handleFolderRename} />
              <FaFolderPlus onClick={handleFolderCreation} />
              {root ? null : <MdDeleteForever onClick={commitDeleteFolder} />}
            </div>
          </ActionsWrapper>
          {isOpen && (
            <Collapse className="tree__folder--collapsible" isOpen={isOpen}>
            {childs}
          </Collapse>
          )}
        </VerticalLine>
    </StyledFolder>
  );
};

export { Folder, FolderName };
