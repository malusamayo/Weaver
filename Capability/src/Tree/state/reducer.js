import _cloneDeep from "lodash.clonedeep";
import { searchDFS, createFolder} from "../../utils";
import { FOLDER } from "./constants";

const reducer = (state, action) => {
  let newState = _cloneDeep(state);
  let node = null;
  let parent = null;
  if (action.payload && action.payload.id) {
    let foundNode = searchDFS({
      data: newState,
      cond: (item) => {
        return item.id === action.payload.id;
      },
    });
    node = foundNode.item;
    parent = node.parentNode;
  }

  switch (action.type) {
    case "SET_DATA":
      return action.payload;

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
