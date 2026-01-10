import { useState } from "react"
import { addBoardElement,removeBoardElement } from "../store/boardSlice";
import { useDispatch, useSelector } from "react-redux";
import useErase from "./useErase";

const useBoardMouseHandlers=()=>{
    const dispatch=useDispatch();
    const {eraseAtPoint}=useErase();
    const currentToolItem=useSelector((store)=>{
        return store.board.activeToolItem;
    })
    const [isDrawing,setIsDrawing]=useState(false);
    const [startPoint,setStartPoint]=useState(null);
    const [preview,setPreview]=useState(null);

    const onMouseDown=(event)=>{
        if(currentToolItem==="erase"){
            eraseAtPoint(event.clientX,event.clientY);
            return;
        }
        if(currentToolItem!=="line"){
            return;
        }
        setIsDrawing(true);
        setStartPoint({x:event.clientX,y:event.clientY});
    }

    const onMouseMove=(event)=>{
        if(!isDrawing){
            return;
        }
        setPreview({x1:startPoint.x,y1:startPoint.y,x2:event.clientX,y2:event.clientY});
    }

    const onMouseUp=()=>{
        if(!isDrawing || !preview){
            return;
        }
        dispatch(addBoardElement({
            id:Date.now(),
            type:"line",
            ...preview
        }));
        setIsDrawing(false);
        setPreview(null);
        setStartPoint(null);
    }
    return {
        preview,
        onMouseDown,
        onMouseMove,
        onMouseUp
    };
}

export default useBoardMouseHandlers;