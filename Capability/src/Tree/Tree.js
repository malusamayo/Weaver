import React, { useReducer, useLayoutEffect, useState } from "react";
import { v4 } from "uuid";
import { ThemeProvider } from "styled-components";

import { useDidMountEffect } from "../utils";
import { TreeContext, reducer } from "./state";
import {fetchAPIDATA} from "../utils";
import { StyledTree } from "./Tree.style";
import { Folder } from "./Folder/TreeFolder";

const Tree = ({ children, data, onNodeClick, onUpdate }) => {

  const [state, dispatch] = useReducer(reducer, data);
  const [selection, setSelection] = useState("/");

  const commitSelection = async (id) => {
    try {
      const path = await fetchAPIDATA("getNodePath/nodeId=" + id);
      setSelection(path)
      console.log("path: ", path);
    } catch (error) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    dispatch({ type: "SET_DATA", payload: data });
  }, [data]);

  useDidMountEffect(() => {
    onUpdate && onUpdate(state);
  }, [state]);

  const isImparative = data && !children;

  return (
    <ThemeProvider theme={{ indent: 20 }}>
        <TreeContext.Provider
          value={{
            isImparative,
            state,
            dispatch,
            onNodeClick: (node) => {
              commitSelection(node.node.id);
              onNodeClick && onNodeClick(node);
            },
          }}
        >
          <p>Selection: {selection}</p>
          <StyledTree>
            {isImparative ? (
              <TreeRecusive data={state} parentNode={state} root={true}/>
            ) : (
              children
            )}
          </StyledTree>
        </TreeContext.Provider>
      </ThemeProvider>
  );
};

const TreeRecusive = ({ data, parentNode, root}) => {
  data = Array.from(data);
  return data.map((item) => {
      item.parentNode = parentNode;
      if (!parentNode) item.parentNode = data
      return (
        <Folder key={item.id} id={item.id} name={item.name} node={item} root={root}>
          <TreeRecusive parentNode={item} data={item.children} root={false}/>
        </Folder>
      );
    });
};

Tree.Folder = Folder;

export default Tree;
