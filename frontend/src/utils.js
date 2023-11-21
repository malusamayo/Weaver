
export const fetchAPIDATA = async (method, data={}, isPost=false) => {
  try {
    const queryString = new URLSearchParams(data).toString();
    console.log(method, queryString);

    let fetchData = isPost ? {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    } : null;
    
    let newData = null;
    if (method === 'updateExample') {
      newData = await fetch(process.env.REACT_APP_BACKEND_SERVER_URL + method, fetchData);
    } else if (queryString.length > 0) {
      newData = await fetch(process.env.REACT_APP_BACKEND_SERVER_URL + method + '?' + queryString, fetchData);
    } else {
      newData = await fetch(process.env.REACT_APP_BACKEND_SERVER_URL + method);
    }

    newData = await newData.json();
    return newData;
  } catch (error) {
    console.error(error);
  }
}

// @deprecated
export const findNodeById = (nodes, id) => {
  let final;

  function findNode(nodes, id) {
    nodes.forEach((n) => {
      if (n.id === id) {
        final = n;
        return;
      }
      if (n.files) findNode(n.files, id);
    });
  }

  findNode(nodes, id);

  return final;
};

export const searchDFS = ({ data, cond, childPathKey = "children" }) => {
  let final = null;
  let parentPath = [];
  let parent = null;
  let next = null;
  let prev = null;

  const recursiveFind = (tree) => {
    tree.forEach((item, index) => {
      if (cond(item, index)) {
        final = item;

        if (parentPath) {
          parentPath.forEach((p) => {
            // check if parent has the `current item`
            if (p && p[childPathKey].includes(item)) {
              parent = p;
              // set next & previous indexes
              next = p[childPathKey][index + 1];
              prev = p[childPathKey][index - 1];
            } else {
              parent = tree;
              // if parent is null then check the root of the tree
              next = tree[index + 1];
              prev = tree[index - 1];
            }
          });
        }
        return;
      }
      if (item[childPathKey]) {
        // push parent stack
        parentPath.push(item);
        recursiveFind(item[childPathKey]);
      }
    });
  };

  recursiveFind(data);
  return {
    parent,
    item: final,
    nextSibling: next,
    previousSibling: prev,
  };
};

// export const useDidMountEffect = (func, deps) => {
//   const didMount = useRef(false);

//   useEffect(() => {
//     if (didMount.current) func();
//     else didMount.current = true;
//   }, deps);
// };

export const createFolder = ({ name }) => ({ name, type: "folder", files: [] });
