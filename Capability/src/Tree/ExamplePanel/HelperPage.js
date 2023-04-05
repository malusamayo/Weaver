import React, {useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  // AiOutlinePlus,
  AiFillEdit,
  // AiOutlineMinus,
  // AiFillFolder,
  // AiFillFolderOpen,
} from "react-icons/ai";
import {
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";
import {
  VscTriangleRight,
  VscTriangleDown
} from "react-icons/vsc";

import { MdDeleteForever } from "react-icons/md";
import { FaFolderPlus } from "react-icons/fa";
// import { BiRefresh } from "react-icons/bi";
import { BsSearch, BsFillPlusCircleFill } from "react-icons/bs";
import { FaRedo } from "react-icons/fa";
import { GrAddCircle } from "react-icons/gr";
import { FaLongArrowAltRight } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import {
    RiDeleteBin2Line
}   from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";
import { GoArrowLeft } from "react-icons/go";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { IoMdHelpCircle } from "react-icons/io";


const HelperItem = ({ icons, text, detailText }) => {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <div>
            {/* <span onClick={() => setShowDetail(!showDetail)}>{showDetail ? 
                <VscTriangleDown style={{cursor:"pointer", opacity:"0.8", marginBottom: "3px"}} /> : 
                <VscTriangleRight style={{cursor:"pointer", opacity:"0.8", marginBottom: "3px"}}/>}
            </span> &nbsp; */}
            <li>
            {text}: &nbsp;
            {icons.map((icon, index) => {
                return <span key={index}>{icon}</span>
            })}
            {/* {showDetail ?  */}
            <div style={{color: "grey"}}> {detailText} <p></p>      </div> 
            {/* :  */}
            {/* null} */}
            </li>
        </div>
    )
}



const HelperPage = () => {
  return (
    <div>
      <h4>Helper Page</h4>

      <HelperItem icons={[<GoArrowLeft size={30}/>]} text={"Undo changes"} detailText={"Click the top-left icon to undo changes. Alternatively, you could also use keyboard shortcuts Ctrl/Cmd +Z."} />
      <HelperItem icons={[<BsToggleOn  size={25}/>]} text={"Checked topics only"} detailText={"Use the toggle to show only the checked topics. You could use it to view all topics you have explored."} />

      <br></br>
      {/* <p>Welcome to the Helper Page!</p> */}
      <h6>Topic Tree</h6>
        <HelperItem icons={[<RiCheckboxBlankCircleLine/>, <RiCheckboxCircleFill/>]} text={"Topic checkbox"} detailText={"When you start creating examples for a topic, the checkbox will be automatically checked. You could also manually (un-)check these boxes."} />
        <HelperItem icons={[<VscTriangleRight/>, <VscTriangleDown/>]} text={"Expand/collapse topics"} detailText={"You could show or hide subtopics by clicking on the triangle icons."} />
        <HelperItem icons={[<BsFillPlusCircleFill style={{ opacity:"0.8", color: "grey",}}/>]} text={"Show more subtopics"} detailText={"You could show more subtopics by clicking on the line: Show more subtopics for \"topic\"."}/>
        <HelperItem icons={[<BsSearch/>]} text={"Explore examples"} detailText={"You could start exploring examples by clicking on the search icon. Alternatively, you could also click on the topic name to explore examples."} />
        <HelperItem icons={[<AiFillEdit/>]} text={"Edit topic"} detailText={"You could edit the topic name by clicking on the edit icon. Alternatively, you could double click on the topic name to edit."} />
        <HelperItem icons={[<MdDeleteForever/>]} text={"Delete topic"} detailText={"You could delete the topic by clicking on the delete icon."} />
        <HelperItem icons={[<FaFolderPlus/>]} text={"Add subtopic"} detailText={"You could add a subtopic manually by clicking on the add subtopic icon."} />
      
      <br></br>
      <h6>Example Panel</h6>
      <HelperItem icons={[<FaRedo/>]} text={"Suggest examples"} detailText={"You could ask the LM to suggest a few examples on the current topic. Clicking it will refresh suggestions (existing suggestions will be DELETED)."} />
      <HelperItem icons={[<GrAddCircle/>]} text={"Add example"} detailText={"You could add an example manually by clicking on the add example icon. Click input textbox to edit the example."} />
      <HelperItem icons={[<GrAddCircle/>]} text={"Add suggsted example"} detailText={"You could add a suggested example by clicking on the icon. Make sure you add suggested examples you like before refreshing suggestions."} />
      <HelperItem icons={[<TiTick style={{fontSize: "25px", opacity: "1", color: "rgb(61, 125, 68)"}}/>, <ImCross style={{fontSize: "12px", opacity: "1", color: "rgb(190, 53, 53"}}/>]} text={"Mark examples as pass/fail"} detailText={"You could mark an example as pass/fail by clicking on the icons. The deault status is pass. Ouputs (ground truth) will be automatically updated when you mark examples. Suggestions will also be automatically added."} />
      <HelperItem icons={[<RiDeleteBin2Line/>]} text={"Delete example"} detailText={"You could delete an example by clicking on the delete icon."} />
      <HelperItem icons={[]} text={"Edit inputs"} detailText={"You could edit the input of an example by double-clicking on the textbox. Submit the editted input by \"Enter\". Model predictions and confidence will show upon submission."} />
      <HelperItem icons={[]} text={"Edit outputs"} detailText={"Optionally, you could also edit the output of an example by double-clicking on the textbox. Submit by \"Enter\"."} />

      {/* <p>Need more help? Contact us at help@example.com.</p> */}
    </div>
  );
};

export { HelperPage };