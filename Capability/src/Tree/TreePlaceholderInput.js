import React, { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { AiOutlineFile } from "react-icons/ai";
import { FolderName } from "./Folder/TreeFolder";
import { StyledFolder } from "./Folder/TreeFolder.style";

const FolderEdit = ({ name, inputRef, defaultValue, style, isHighlighted}) => {
  return (
    <StyledFolder id={v4()} name={name} style={style}>
      <FolderName
        isOpen={true}
        handleClick={() => {}}
        isHighlighted={isHighlighted}
        name={
          <input
            ref={inputRef}
            className="tree__input"
            defaultValue={defaultValue}
          />
        }
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

  console.log("PlaceholderInput", name, defaultValue, isHighlighted)
  return (
    <FolderEdit
      style={style}
      name={name}
      inputRef={inputRef}
      defaultValue={defaultValue}
      isHighlighted={isHighlighted}
    />
  );
};

export { PlaceholderInput };
