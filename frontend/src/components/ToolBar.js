import { useState } from "react";
import { RiRectangleLine } from "react-icons/ri";
import { FaSlash } from "react-icons/fa";
import { LuEraser } from "react-icons/lu";
import { IoEllipseOutline } from "react-icons/io5";
import { FaPaintBrush } from "react-icons/fa";
import { toolbarContainer,getToolButtonClass } from "../utils/toolbarStyles";
import { useDispatch } from "react-redux";
import { setActiveToolItem} from "../store/boardSlice";
import { useSelector } from "react-redux";

const ToolBar=()=>{
    const dispatch=useDispatch();
    const changeActiveToolItem=(ToolItem)=>{
        dispatch(setActiveToolItem(ToolItem));
    }
    
    const activeTool=useSelector((store)=>{
        return store.board.activeToolItem;
    });

    return (
        <div className={toolbarContainer}>
            <button className={getToolButtonClass(activeTool,"brush")} onClick={()=>changeActiveToolItem("brush")}>
                <FaPaintBrush size={18}/>
            </button>
            <button className={getToolButtonClass(activeTool,"rect")} onClick={()=>changeActiveToolItem("rect")}>
                <RiRectangleLine size={18}/>
            </button>
            <button className={getToolButtonClass(activeTool,"line")} onClick={()=>changeActiveToolItem("line")}>
                <FaSlash size={16}/>
            </button>
            <button className={getToolButtonClass(activeTool,"ellipse")} onClick={()=>changeActiveToolItem("ellipse")}>
                <IoEllipseOutline size={20}/>
            </button>
            <button className={getToolButtonClass(activeTool,"erase")} onClick={()=>changeActiveToolItem("erase")}>
                <LuEraser size={18}/>
            </button>
        </div>
    );
};

export default ToolBar;
