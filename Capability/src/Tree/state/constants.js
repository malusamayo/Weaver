const createActionTypes = (name) => {
  return {
    CREATE: `${name}_CREATE`,
    EDIT: `${name}_EDIT`,
    DELETE: `${name}_DELETE`,
    REFRESH: `${name}_REFRESH`,
    HIGHLIGHT: `${name}_HIGHLIGHT`,
    TAGS: `${name}_TAGS`
  };
};

const FOLDER = createActionTypes("FOLDER");

export { FOLDER };
