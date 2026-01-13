import { useState } from "react";
import { RiRectangleLine } from "react-icons/ri";
import { FaSlash } from "react-icons/fa";
import { LuEraser } from "react-icons/lu";
import { IoEllipseOutline,IoText } from "react-icons/io5";
import { FaPaintBrush } from "react-icons/fa";
import { LuUndo,LuRedo  } from "react-icons/lu";
import { GoDownload } from "react-icons/go";
import { toolbarContainer,getToolButtonClass, toolLabel } from "../utils/toolbarStyles";
import { useDispatch } from "react-redux";
import { setActiveToolItem, undo} from "../store/boardSlice";
import { useSelector } from "react-redux";
import { undo, redo } from "../store/boardSlice";

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
                <span className={toolLabel}>Brush</span>
            </button>
            <button className={getToolButtonClass(activeTool,"rect")} onClick={()=>changeActiveToolItem("rect")}>
                <RiRectangleLine size={18}/>
                <span className={toolLabel}>Rectangle</span>
            </button>
            <button className={getToolButtonClass(activeTool,"line")} onClick={()=>changeActiveToolItem("line")}>
                <FaSlash size={16}/>
                <span className={toolLabel}>Line</span>
            </button>
            <button className={getToolButtonClass(activeTool,"ellipse")} onClick={()=>changeActiveToolItem("ellipse")}>
                <IoEllipseOutline size={20}/>
                <span className={toolLabel}>Ellipse</span>
            </button>
            <button className={getToolButtonClass(activeTool,"circle")} onClick={()=>changeActiveToolItem("circle")}>
                <IoEllipseOutline size={20}/>
                <span className={toolLabel}>Circle</span>
            </button>
            <button className={getToolButtonClass(activeTool,"text-box")} onClick={()=>changeActiveToolItem("text-box")}>
                <IoText size={20}/>
                <span className={toolLabel}>Text</span>
            </button>
            <button className={getToolButtonClass(activeTool,"undo")} onClick={()=>dispatch(undo())}>
                <LuUndo size={18}/>
                <span className={toolLabel}>Undo</span>
            </button>
            <button className={getToolButtonClass(activeTool,"redo")} onClick={()=>dispatch(redo())}>
                <LuRedo size={18}/>
                <span className={toolLabel}>Redo</span>
            </button>
            <button className={getToolButtonClass(activeTool,"eraser")} onClick={()=>changeActiveToolItem("eraser")}>
                <LuEraser size={18}/>
                <span className={toolLabel}>Eraser</span>
            </button>
            <button className={getToolButtonClass(activeTool,"downlaod")}>
                <GoDownload size={18}/>
                <span className={toolLabel}>Downlaod</span>
            </button>
        </div>
    );
};

export default ToolBar;
