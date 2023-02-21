import React, { useReducer, useLayoutEffect, useState } from "react";
import { v4 } from "uuid";
import { ThemeProvider } from "styled-components";
import { BiRefresh } from "react-icons/bi";

import { useDidMountEffect } from "../utils";
import { TreeContext, reducer } from "./state";
import {fetchAPIDATA} from "../utils";
import { StyledTree } from "./Tree.style";
import { Folder } from "./Folder/TreeFolder";
import { loading } from "./Tree.css";
import { AnimatedMultiTagging } from "./Tag/tag"

const Tree = ({ children, data, onNodeClick, onUpdate }) => {

  const [state, dispatch] = useReducer(reducer, data);
  const [selection, setSelection] = useState("/");
  const [isLoading, setIsLoading] = useState(false);

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
    <div>
      {
        isLoading && (
          <div className="loading">
            <img src="https://cdn-icons-png.flaticon.com/512/6356/6356659.png" alt="loading..."/>
          </div>
        )
      }
      <ThemeProvider theme={{ indent: 20 }}>
          <TreeContext.Provider
            value={{
              isImparative,
              state,
              dispatch,
              setIsLoading: setIsLoading,
              onNodeClick: (node) => {
                commitSelection(node.node.id);
                onNodeClick && onNodeClick(node);
              },
            }}
            >
          <p>Selection: {selection}</p>
          <AnimatedMultiTagging/>
          <StyledTree>
            {isImparative ? (
              <TreeRecusive data={state} parentNode={state} root={true}/>
            ) : (
              children
            )}
          </StyledTree>
        </TreeContext.Provider>
      </ThemeProvider>
    </div>
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
