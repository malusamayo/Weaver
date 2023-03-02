import React, { useReducer, useLayoutEffect, useState, useEffect, useRef } from "react";
import { Tooltip } from 'react-tooltip';
import { ThemeProvider } from "styled-components";
import { AiFillHome } from "react-icons/ai";
import { GoArrowLeft } from "react-icons/go";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { useDidMountEffect } from "../utils";
import { TreeContext, reducer } from "./state";
import {fetchAPIDATA} from "../utils";
import { StyledTree, TreeActionsWrapper } from "./Tree.style";
import { Folder } from "./Folder/TreeFolder";
import { loading } from "./Loading.css";
import { AnimatedMultiTagging } from "./Tag/tag";

// import react bootstrap components for row, column and container
import { Row, Col, Container } from 'react-bootstrap';

const Tree = ({ children, data, onNodeClick, onUpdate, setData}) => {

  const [state, dispatch] = useReducer(reducer, data);
  const [selection, setSelection] = useState("/");
  const [isLoading, setIsLoading] = useState(false);
  const [isBackButtonActive, setIsBackButtonActive] = useState(true);
  const [toggleIsHighlighted, setToggleIsHighlighted] = useState(false);

  const commitBackState = async() => {
    try {
      setIsLoading(true);

      const newData = await fetchAPIDATA("previousState");
      dispatch({ type: "SET_DATA", payload: newData });
      setData(newData);
      console.log("going back to: ", newData);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const commitToggleIsHighlighted = async(toggleIsHighlighted) => {
    try {

      setIsLoading(true);

      const newData = await fetchAPIDATA("getTopics/isHighlighted="+toggleIsHighlighted);
      dispatch({ type: "SET_DATA", payload: newData });
      setData(newData);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const commitSelection = async (id) => {
    try {
      const path = await fetchAPIDATA("getNodePath/nodeId=" + id);
      setSelection(path)
      console.log("path: ", path);
    } catch (error) {
      console.error(error);
    }
  };

  const commitBackAvailability = async () => {
    try {
      const isBackAvailable = await fetchAPIDATA("isBackAvailable");
      setIsBackButtonActive(isBackAvailable);
      console.log("isBackAvailable: ", isBackAvailable);
    } catch (error) {
      console.error(error);
    }
  };

  const commitToggleIsHighlightedSelection = async () => {
    try {
      const toggleIsHighlighted = await fetchAPIDATA("toggleIsHighlightedSelection");
      setToggleIsHighlighted(toggleIsHighlighted);
      console.log("toggleIsHighlighted: ", toggleIsHighlighted);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    commitBackAvailability();
  });

  useEffect(() => {
    commitToggleIsHighlightedSelection();
  });


  useLayoutEffect(() => {
    dispatch({ type: "SET_DATA", payload: data });
  }, [data]);

  useDidMountEffect(() => {
    onUpdate && onUpdate(state);
  }, [state]);

  // handle cmd + z ctrl + z to go back
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        commitBackState();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isImparative = data && !children;

  const tooltip_style= {
    zIndex: 9999, 
    position: "absolute", 
    backgroundColor: "rgba(54, 54, 54, 1)",
    padding : "5px",
    fontSize: "80%",
  };

  const divRef = useRef(null);

  const handleDivRefFloat = () => {
    const div = divRef.current;
    const divBox = div.getBoundingClientRect();

    const divParent = div.parentNode;
    const divParentBox = divParent.getBoundingClientRect();

    if (document.getElementById("site")) {
      let cellContainer = document.getElementsByClassName("CodeMirror")[0];
      let cellContainerBox = cellContainer.getBoundingClientRect();

      let parentTopContainer = document.getElementById("header");
      let parentTopContainerBox = parentTopContainer.getBoundingClientRect();

      let parentContainer = document.getElementById("site");
      let parentContainerBox = parentContainer.getBoundingClientRect();

      if (divParentBox.bottom <= divBox.bottom) {
        div.style.position = "fixed";
        let difference = divBox.bottom - divParentBox.bottom;
        div.style.top = div.style.top - difference + "px";
        div.style.zIndex = -1;
        div.style.visibility = "hidden";
      } else if (divParentBox.top <= parentTopContainerBox.bottom) {
        div.style.position = "fixed";
        div.style.top = parentContainerBox.top + "px";
        div.style.width = cellContainerBox.width + "px";
        div.style.zIndex = 9999;
        div.style.visibility = "visible";
      } else {
        div.style.position = "relative";
        div.style.top = "0px";
        div.style.zIndex = 9999;
        div.style.visibility = "visible";
      }
    } else if (document.getElementsByClassName("jp-NotebookPanel-notebook")[0]) {

      let cellContainer = document.getElementsByClassName("CodeMirror")[0];
      let cellContainerBox = cellContainer.getBoundingClientRect();

      let parentTopContainer = document.getElementsByClassName("jp-Toolbar")[0];
      let parentTopContainerBox = parentTopContainer.getBoundingClientRect();

      let parentContainer = document.getElementsByClassName("jp-NotebookPanel-notebook")[0];
      let parentContainerBox = parentContainer.getBoundingClientRect();

      if (divParentBox.bottom <= divBox.bottom) {
        div.style.position = "fixed";
        let difference = divBox.bottom - divParentBox.bottom;
        div.style.top = div.style.top - difference + "px";
        div.style.zIndex = -1;
        div.style.visibility = "hidden";
      } else if (divParentBox.top <= parentTopContainerBox.bottom) {
        div.style.position = "fixed";
        div.style.top = parentContainerBox.top + "px";
        div.style.width = cellContainerBox.width + "px";
        div.style.zIndex = 9999;
        div.style.visibility = "visible";
      } else {
        div.style.position = "relative";
        div.style.top = "0px";
        div.style.zIndex = 9999;
        div.style.visibility = "visible";
      }

    }
  };

  useEffect(() => {
    // Add event listener to scroll of id site and 
    // call handleDivRefFloat function on scroll but
    // limit the call to once every 100ms using setTimeout

    if (document.getElementById("site")) {
      let parentContainer = document.getElementById("site");
      parentContainer.addEventListener("scroll", () => {
        setTimeout(() => {
          handleDivRefFloat();
        }, 10);
      });
    } else if (document.getElementsByClassName("jp-NotebookPanel-notebook")[0]) {
      let parentContainer = document.getElementsByClassName("jp-NotebookPanel-notebook")[0];
      parentContainer.addEventListener("scroll", () => {
        setTimeout(() => {
          handleDivRefFloat();
        }, 10);
      });
    }

    return () => {
      if (document.getElementById("site")) {
        let parentContainer = document.getElementById("site");
        parentContainer.removeEventListener("scroll", handleDivRefFloat);
      } else if (document.getElementsByClassName("jp-Notebook")[0]) {
        let parentContainer = document.getElementsByClassName("jp-Notebook")[0];
        parentContainer.removeEventListener("scroll", handleDivRefFloat);
      }
    };
  });

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
                    commitBackAvailability();
                    onNodeClick && onNodeClick(node);
                  },
                }}
                >
              <div style={{position: "sticky", top: "0", zIndex: "9999", backgroundColor: "rgb(245, 245, 245)", padding: "10px", 
                border: "1px solid rgb(235, 235, 235)", borderRadius: "2px", margin: "0px", transition: "top 1s ease-in-out, position 1s ease-in-out"}} ref={divRef}>
              {/* <div ref={divRef}> */}
                <p>Selection: {selection}</p>
                <AnimatedMultiTagging />
                <TreeActionsWrapper>
                    {isBackButtonActive ?
                      (<GoArrowLeft size={30} onClick={commitBackState} id="go-back-state"/>) :
                      (<GoArrowLeft size={30} style={{color: "grey"}} id="go-back-state"/>)
                    }
                    <AiFillHome size={20} id="go-home"/>
                    
                    <div style={{margin: "5px 0 0 5px"}}>
                    {toggleIsHighlighted ?
                      (<BsToggleOn size={25} onClick={() => commitToggleIsHighlighted(false)} id="toggle-highlighted-off"/>) :
                      (<BsToggleOff size={25} onClick={() => commitToggleIsHighlighted(true)} id="toggle-highlighted-on"/>)
                    }
                    </div>
                    <Tooltip place="bottom" anchorSelect="#go-back-state" content="Back" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#go-home" content="Home" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#toggle-highlighted-off" content="Show all Topics" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#toggle-highlighted-on" content="Show highlighted topics only" style={tooltip_style}/>
                </TreeActionsWrapper>  
              </div>
            <Row>
              <Col xs={6}> 
                <StyledTree>
                  {isImparative ? (
                    <TreeRecusive data={state} parentNode={state} root={true}/>
                  ) : (
                    children
                  )}
                </StyledTree>
              </Col>
              <Col>
                <p>Selection: {selection}</p>
              </Col>
            </Row>
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
