import React, { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { AiOutlineFile } from "react-icons/ai";
import { FolderName } from "./Folder/TreeFolder";
import { StyledFolder } from "./Folder/TreeFolder.style";

const FolderEdit = ({ name, inputRef, defaultValue, style, isHighlighted, node, isEditing, handleNodeClick, type}) => {
  // console.log("FolderEdit", defaultValue, node, type)
  return (
    <StyledFolder id={v4()} name={name} style={style}>
      <FolderName
        isOpen={node.isOpen}
        handleClick={() => {}}
        isHighlighted={isHighlighted}
        name={
          <input
            ref={inputRef}
            className="tree__input"
            defaultValue={defaultValue}
          />
        }
        node={node}
        isEditing={isEditing}
        type={type}
        handleNodeClick={handleNodeClick}
      />
    </StyledFolder>
  );
};

const PlaceholderInput = ({
  name,
  onSubmit,
  onCancel,
  defaultValue,
  isHighlighted,
  style,
  node,
  isEditing,
  type,
  handleNodeClick
}) => {
  const [ext, setExt] = useState("");
  const inputRef = useRef();

  const updateExt = (e) => {
    let splitted = e.target.value.split(".");
    let ext = splitted && splitted[splitted.length - 1];
    setExt(ext);
  };

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    inputRef.current.addEventListener("keyup", (e) => {
      if (e.key === "Enter") onSubmit(e.target.value);
      if (e.key === "Escape") {
        onCancel && onCancel();
      }
    });
  }, [inputRef]);

  // console.log("PlaceholderInput", defaultValue, node, type)
  return (
    <FolderEdit
      style={style}
      name={name}
      inputRef={inputRef}
      defaultValue={defaultValue}
      isHighlighted={isHighlighted}
      node={node}
      onSubmit={onSubmit}
      isEditing={isEditing}
      type={type}
      handleNodeClick={handleNodeClick}
    />
  );
};

export { PlaceholderInput };
