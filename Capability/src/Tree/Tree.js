import React, { useReducer, useLayoutEffect, useState, useEffect, useRef, useCallback } from "react";
import { Tooltip } from 'react-tooltip';
import { ThemeProvider } from "styled-components";
import { AiFillHome } from "react-icons/ai";
import { GoArrowLeft } from "react-icons/go";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { IoMdHelpCircle } from "react-icons/io";
// import { useDidMountEffect } from "../utils";
import { TreeContext, reducer } from "./state";
import {fetchAPIDATA} from "../utils";
import { StyledTree, TreeActionsWrapper } from "./Tree.style";
import { Folder } from "./Folder/TreeFolder";
import "./Loading.css";
// import { AnimatedMultiTagging } from "./Tag/tag";
import { ExamplePanel } from "./ExamplePanel/ExamplePanel";
import 'bootstrap/dist/css/bootstrap.min.css';

// import react bootstrap components for row, column and container
import { Row, Col } from 'react-bootstrap';

const Tree = ({data}) => {

  const [state, dispatch] = useReducer(reducer, data);
  // const [selection, setSelection] = useState("/");
  const [isLoading, setIsLoading] = useState(false);
  const [isBackButtonActive, setIsBackButtonActive] = useState(true);
  const [toggleIsHighlighted, setToggleIsHighlighted] = useState(false);
  const [toggleExamplePanel, setToggleExamplePanel] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    commitBackAvailability();
  }, [state]);

  // render exactly once on mount
  useEffect(() => {
    const commitToggleIsHighlightedSelection = async () => {
      try {
        const initToggleIsHighlighted = await fetchAPIDATA("toggleIsHighlightedSelection");
        setToggleIsHighlighted(initToggleIsHighlighted);
      } catch (error) {
        console.error(error);
      }
    };
    commitToggleIsHighlightedSelection();
  }, []);

  // render exactly once on mount
  useLayoutEffect(() => {
    console.log("state: ", data);
    dispatch({ type: "SET_DATA", payload: data });
  }, [data]);

  // useDidMountEffect(() => {
  //   console.log("state: ", state);
  //   onUpdate && onUpdate(state);
  // }, [state]);

  
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
  }, []);

  const commitBackState = useCallback( async() => {
    try {
      setIsLoading(true);

      const newData = await fetchAPIDATA("previousState");
      dispatch({ type: "SET_DATA", payload: newData });
      // setData(newData);
      // console.log("going back to: ", newData);
      const currentSelectedNode = selectedNode;
      setSelectedNode(x => null);
      setSelectedNode(x => currentSelectedNode);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // // handle cmd + z ctrl + z to go back
  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if ((event.ctrlKey || event.metaKey) && event.key === "z") {
  //       commitBackState();
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  const commitToggleIsHighlighted = async() => {
    try {

      setIsLoading(true);

      const newToggleIsHighlighted = !toggleIsHighlighted;
      setToggleIsHighlighted(newToggleIsHighlighted);

      const newData = await fetchAPIDATA("getTopics", {
        'isHighlighted' : newToggleIsHighlighted
      });
      dispatch({ type: "SET_DATA", payload: newData });

      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const setNodeHighlighted = async (nodeId, highlighted) => {
    try {
      const newData = await fetchAPIDATA("setHighlighted", {
        "nodeId": nodeId,
        "isHighlighted": highlighted
      }, true);
      console.log("setNodeHighlighted", newData)
      dispatch({ type: "SET_DATA", payload: newData });
      // setHighlighted(highlighted);
    } catch (error) {
      console.error(error);
    }
  };

  // const commitSelection = async (path) => {
  //   try {
  //     setSelection(path)
  //     // console.log("path: ", path);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const commitBackAvailability = async () => {
    try {
      const isBackAvailable = await fetchAPIDATA("isBackAvailable");
      setIsBackButtonActive(isBackAvailable);
      // console.log("isBackAvailable: ", isBackAvailable);
    } catch (error) {
      console.error(error);
    }
  };

  const commitToggleExamplePanel = async (value) => {
    setToggleExamplePanel(toggleExamplePanel => !toggleExamplePanel);
  };

  const handleHelperClick = async () => {
    setSelectedNode(null);
  }


  // const isImparative = data && !children;

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
                  // isImparative,
                  state,
                  dispatch,
                  setIsLoading: setIsLoading,
                  onNodeClick: (node) => {
                    // commitSelection(node.node.naturalLanguagePath);
                    commitBackAvailability();
                    // onNodeClick && onNodeClick(node);
                    setSelectedNode(node);
                  },
                  setNodeHighlighted: setNodeHighlighted,
                  selectedNode: selectedNode,
                }}
                >
              <div style={{position: "sticky", top: "0", zIndex: "9998", backgroundColor: "rgb(245, 245, 245)", padding: "10px", 
                border: "1px solid rgb(204, 204, 204)", borderRadius: "2px", margin: "10px", transition: "top 1s ease-in-out, position 1s ease-in-out"}} ref={divRef} 
                id="menu_top_tree_toolbar">
              {/* <div ref={divRef}> */}
                {/* <p>Selection: {selection}</p>
                <AnimatedMultiTagging /> */}
                <TreeActionsWrapper>
                  <div>
                    {isBackButtonActive ?
                      (<GoArrowLeft size={30} onClick={commitBackState} style={{cursor: "pointer"}} id="go-back-state"/>) :
                      (<GoArrowLeft size={30} style={{color: "grey", cursor: "pointer"}} id="go-back-state"/>)
                    }
                    {/* <AiFillHome size={20} style={{cursor: "pointer"}} id="go-home"/> */}
                    <IoMdHelpCircle size={25} onClick={handleHelperClick} style={{cursor: "pointer"}} id="go-help"/>
                  </div>
                  <div>
                    Checked Topics Only
                    {/* <div style={{margin: "5px 0 0 50px"}}> */}
                      {toggleIsHighlighted ?
                        (<BsToggleOn size={25} onClick={commitToggleIsHighlighted} id="toggle-highlighted-off"  style={{margin: "0px 15px 0 5px"}}/>) :
                        (<BsToggleOff size={25} onClick={commitToggleIsHighlighted} id="toggle-highlighted-on"  style={{margin: "0px 15px 0 5px"}}/>)
                      }
                    {/* </div> */}
                    Show Example Panel
                    {/* <div style={{margin: "5px 0 0 50px", justifyContent: "auto"}}> */}
                      {toggleExamplePanel ?
                        (<BsToggleOn size={25} onClick={commitToggleExamplePanel} id="toggle-example-panel-off"  style={{margin: "0px 0 0 5px"}}/>) :
                        (<BsToggleOff size={25} onClick={commitToggleExamplePanel} id="toggle-example-panel-on" style={{margin: "0px 0 0 5px"}}/>)
                      }
                    {/* </div> */}
                  </div>
                    <Tooltip place="bottom" anchorSelect="#go-back-state" content="Back" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#go-home" content="Home" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#go-help" content="Show helper page" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#toggle-highlighted-off" content="Show all topics" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#toggle-highlighted-on" content="Show only highlighted topics" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#toggle-example-panel-off" content="Hide example panel" style={tooltip_style}/>
                    <Tooltip place="bottom" anchorSelect="#toggle-example-panel-on" content="Show example panel" style={tooltip_style}/>
                </TreeActionsWrapper>  
              </div>
            <Row>
              {/* <Scroll Down> */}
              <Col xs="auto" style={{maxWidth: "40%"}}> 
               {/* style={{overflowY:"scroll", maxHeight:"calc(100vh - 100px)"}}> */}
                <StyledTree>
                  <TreeRecusive data={state} parentNode={state} root={true} toggleIsHighlighted={toggleIsHighlighted}/>
                  {/* {isImparative ? (
                    <TreeRecusive data={state} parentNode={state} root={true}/>
                  ) : (
                    children
                  )} */}
                </StyledTree>
              </Col>
              {/* </Scroll> */}
              {/* <Scroll Down> */}
              <Col style={{overflowY:"scroll", maxHeight:"calc(100vh - 100px)"}}>
                  {toggleExamplePanel && <ExamplePanel node={selectedNode}/>}
              </Col>
              {/* </Scroll> */}
            </Row>
            </TreeContext.Provider>
          </ThemeProvider>
    </div>
  );
};

const TreeRecusive = ({ data, parentNode, root, toggleIsHighlighted}) => {
  data = Array.from(data);
  return data.map((item) => {
      try {
      item.parentNode = parentNode;
      if (!parentNode) item.parentNode = data
      } catch (e) {
        console.log(e)
      }
      return (
        <Folder key={item.id} id={item.id} name={item.name} node={item} root={root} toggleIsHighlighted={toggleIsHighlighted}>
          <TreeRecusive parentNode={item} data={item.children} root={false} toggleIsHighlighted={toggleIsHighlighted}/>
        </Folder>
      );
    });
};

Tree.Folder = Folder;

export default Tree;
