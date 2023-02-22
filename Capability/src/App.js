// // Create a simple react app that fetches a string from the server and displays it
// import React, { useState, useEffect } from "react";
// import "./styles.css";

// export default function App() {
//   const [data, setData] = useState([]);

//   const fetchData = () => {
//     return fetch("http://localhost:3001/")
//       .then((response) => response.json())
//       .then((data) => setData(data))
//   }

//   useEffect(() => {
//     fetchData();
//   }, [])

//   return (
//     <main>
//       <h1>Testing</h1>
//       <h2>{data}</h2>
//     </main>
//   )
// }


import React, { useState, useLayoutEffect, useEffect } from "react";
import "./styles.css";

import Tree from "./Tree/Tree";
export default function App() {

  const [data, setData] = useState([]);
  // console.log("data: " + data)

  const fetchData = () => {
    return fetch("http://localhost:3001/")
      .then((response) => response.json())
      .then((data) => setData(data))
  }

  useEffect(() => {
    fetchData();
  }, [])

  const handleClick = (node) => {
    console.log(node);
  };
  const handleUpdate = (state) => {
    console.log("updating state")
  };

  return (
    <main>
      <Tree data={data} onUpdate={handleUpdate} onNodeClick={handleClick} setData={setData}/>
    </main>
  );
}