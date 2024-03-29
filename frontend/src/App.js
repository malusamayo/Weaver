import React, { useState, useEffect } from "react";
import "./styles.css";

import Tree from "./Tree/Tree";
export default function App() {

  const [data, setData] = useState([]);

  // initial fetch data from base
  useEffect(() => {
    const fetchData = () => {
      return fetch(process.env.REACT_APP_BACKEND_SERVER_URL)
        .then((response) => response.json())
        .then((data) => setData(data))
        .then(() => console.log("fetch data from base", data))
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const handleClick = (node) => {
  //   console.log(node);
  // };
  // const handleUpdate = (state) => {
  //   console.log("updating state")
  // };

  return (
    <main>
      <Tree data={data}/>
    </main>
  );
}