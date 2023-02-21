import React, { useState } from "react";
import Select from "react-select";
import { useTreeContext } from "../state/TreeContext";
import makeAnimated from "react-select/animated";
import { relationships } from '../Dropdown/dropdown';
import {fetchAPIDATA} from "../../utils";
<<<<<<< HEAD
=======
import { tag } from "./tag.css"
>>>>>>> backup

const animatedComponents = makeAnimated();

const AnimatedMultiTagging = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const { dispatch } = useTreeContext();

  const handleSelectChange = async (selectedOptions) => {
    setSelectedOptions(selectedOptions);
    try {
        let tags = selectedOptions.map((option) => option.value);
        let apiEndpoint = "setTagFilter/tags=";
        if (tags.length === 0) {
            apiEndpoint = "resetTagFilter";
        } else {
            tags = tags.join(",");
            apiEndpoint = "setTagFilter/tags=" + tags;
        }
        const newData = await fetchAPIDATA(apiEndpoint);
        dispatch({type: "SET_DATA", payload: newData})
    } catch (error) {
        console.error(error);
    }
  };

  const styles = {
        container: (provided) => ({
            ...provided,
            margin: "15px 10% 15px 10%",
            "font-size": "13px",
            }),
        control: (provided) => ({
            ...provided,    
            border : "1px solid rgb(89, 89, 89)",
            
            }),
        input: (provided) => ({
            ...provided,
            "font-size": "13px",
                "&: hover": {
                    "border-color": "rgb(89, 89, 89)",
                },
        }),
        IndicatorsContainer: (provided) => ({
            ...provided,
            "border": "10px solid rgb(89, 89, 89)",
            "font-size": "13px",
        }),
        option: (provided) => ({
            ...provided,
            color: "rgb(89, 89, 89)",
            "font-size": "13px",

            ":hover": {
                backgroundColor: "rgb(89, 89, 89)",
                color: "white",
                "font-size": "13px",
            },
        }),
    };

  return (
    <div className="custom-select">
        <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        value={selectedOptions}
        onChange={handleSelectChange}
        isMulti
        options={relationships}
        closeMenuOnScroll={true}
        styles={styles}
        />
    </div>
  );
}

export { AnimatedMultiTagging };