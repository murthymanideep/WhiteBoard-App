import { useState } from "react";
import { RiRectangleLine } from "react-icons/ri";
import { FaSlash } from "react-icons/fa";
import {
    toolbarContainer,
    toolButtonBase,
    toolButtonActive,
    toolButtonInactive
} from "../utils/toolbarStyles";

const ToolBar=()=>{
    const [active,setActive]=useState("rect");
    const rectBtnClass=
        toolButtonBase+" "+
        (active==="rect" ? toolButtonActive : toolButtonInactive);

    const lineBtnClass=
        toolButtonBase+" "+
        (active==="line" ? toolButtonActive : toolButtonInactive);

    return (
        <div className={toolbarContainer}>
            <button className={rectBtnClass} onClick={()=>setActive("rect")}>
                <RiRectangleLine size={18}/>
            </button>
            <button className={lineBtnClass} onClick={()=>setActive("line")}>
                <FaSlash size={16}/>
            </button>
        </div>
    );
};

export default ToolBar;
