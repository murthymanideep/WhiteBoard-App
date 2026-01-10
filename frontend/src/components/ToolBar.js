import { useState } from "react";
import { RiRectangleLine } from "react-icons/ri";
import { FaSlash } from "react-icons/fa";
import { toolbarContainer,getToolButtonClass } from "../utils/toolbarStyles";
import { useDispatch } from "react-redux";
import { setActiveToolItem,addBoardElement } from "../store/boardSlice";
import { useSelector } from "react-redux";
import createElement from "../utils/createElement";

const ToolBar=()=>{
    const dispatch=useDispatch();
    
    const changeActiveToolItem=(ToolItem)=>{
        dispatch(setActiveToolItem(ToolItem));

        const element=createElement(ToolItem);
        dispatch(addBoardElement(element));
    }

    const activeTool=useSelector((store)=>{
        return store.board.activeToolItem;
    });

    return (
        <div className={toolbarContainer}>
            <button className={getToolButtonClass(activeTool,"rect")} onClick={()=>changeActiveToolItem("rect")}>
                <RiRectangleLine size={18}/>
            </button>
            <button className={getToolButtonClass(activeTool,"line")} onClick={()=>changeActiveToolItem("line")}>
                <FaSlash size={16}/>
            </button>
        </div>
    );
};

export default ToolBar;
