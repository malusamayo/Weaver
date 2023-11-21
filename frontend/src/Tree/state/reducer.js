import _cloneDeep from "lodash.clonedeep";
import { searchDFS, createFolder} from "../../utils";
import { FOLDER } from "./constants";

// function updateTree(children, action) {
//   return children.map(child => {
//     if (child.id === action.payload.id) {
//       return {
//         ...child,
//         isHighlighted: action.payload.isHighlighted
//       };
//     } else {
//       return {
//         ...child,
//         children: updateTree(child.children, action)
//       };
//     }
//   });
// }

const reducer = (state, action) => {
  let newState = _cloneDeep(state);
  let node = null;
  let parent = null;

  // if (action.payload && action.payload.id) {
  //   let foundNode = searchDFS({
  //     data: newState,
  //     cond: (item) => {
  //       return item.id === action.payload.id;
  //     },
  //   });
  //   node = foundNode.item;
  //   parent = node.parentNode;
  // }

  // console.log(node, parent)

  switch (action.type) {
    case "SET_DATA":
      return action.payload;

    // case "SET_HIGHLIGHTED":
    //   return state.map(root => {
    //     if (root.id === action.payload.id) {
    //       return {
    //         ...root,
    //         isHighlighted: action.payload.isHighlighted
    //       };
    //     } else {
    //       return {
    //         ...root,
    //         children: updateTree(root.children, action)
    //       };
    //     }
    //   });

    // [TODO] - reduce cost of updating folder
    case FOLDER.REFRESH:
      return action.payload;

    case FOLDER.CREATE:
      node.files.push(createFolder({ name: action.payload.name }));
      return newState;

    case FOLDER.EDIT:
      node.name = action.payload.name;
      return newState;

    case FOLDER.DELETE:
      if (!parent || Array.isArray(parent)) {
        newState = newState.filter((file) => file.id !== action.payload.id);
        return newState;
      } else {
        parent.files = parent.files.filter(
          (file) => file.id !== action.payload.id
        );
      }
      return newState;

    default:
      return state;
  }
};

export { reducer };
