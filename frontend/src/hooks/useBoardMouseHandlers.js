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

    //Handler for Mousedown
    const onMouseDown=(event)=>{
        if(currentToolItem==="erase"){
            eraseAtPoint(event.clientX,event.clientY);
            return;
        }
        if(currentToolItem!=="line" && currentToolItem!=="rect"){
            return;
        }
        setIsDrawing(true);
        setStartPoint({x:event.clientX,y:event.clientY});
    }

    //Handler for Mousemove 
    const onMouseMove=(event)=>{
        if(!isDrawing){
            return;
        }

        if(currentToolItem=="line"){
            setPreview({x1:startPoint.x,y1:startPoint.y,x2:event.clientX,y2:event.clientY});
        }
        else if(currentToolItem=="rect"){
            const x1=startPoint.x;
            const y1=startPoint.y;
            const x2=event.clientX;
            const y2=event.clientY;
            setPreview({x: Math.min(x1,x2),y: Math.min(y1,y2),width: Math.abs(x2-x1),height: Math.abs(y2-y1)});
        }
    }

    //Hnadler for Mouseup
    const onMouseUp=()=>{
        if(!isDrawing || !preview){
            return;
        }
        if(currentToolItem=="line"){
            dispatch(addBoardElement({
                id:Date.now(),
                type:"line",
                ...preview
            }));
        }
        else if(currentToolItem=="rect"){
            dispatch(addBoardElement({
                id:Date.now(),
                type:"rect",
                ...preview
            }));
        }

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