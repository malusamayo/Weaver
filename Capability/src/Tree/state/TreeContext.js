import React from "react";

const defaultValue = {
  dispatch: null,
  state: null,
  isImparative: null,
  setIsLoading: () => {},
  onNodeClick: () => {}
};
const TreeContext = React.createContext(defaultValue);

const useTreeContext = () => React.useContext(TreeContext);

export { TreeContext, useTreeContext };
