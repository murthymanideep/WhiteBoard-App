import { useState } from "react"
import { addBoardElement,removeBoardElement } from "../store/boardSlice";
import { useDispatch, useSelector } from "react-redux";
import useErase from "./useErase";

const useBoardMouseHandlers=()=>{
    const dispatch=useDispatch();
    const {eraseAtPoint,commitErase}=useErase();
    const currentToolItem=useSelector((store)=>{
        return store.board.activeToolItem;
    })
    const [isDrawing,setIsDrawing]=useState(false);
    const [startPoint,setStartPoint]=useState(null);
    const [preview,setPreview]=useState(null);
    const [textInput,setTextInput]=useState(null);

    //Handler for Mousedown
    const onMouseDown=(event)=>{
        if(currentToolItem==="eraser"){
            eraseAtPoint(event.clientX,event.clientY);
            return;
        }
        const notOk=(currentToolItem!=="line" && currentToolItem!=="rect" && currentToolItem!=="ellipse"
            && currentToolItem!=="brush" && currentToolItem!=="circle" && currentToolItem!=="text-box"
        );
        if(notOk){
            return;
        }
        setIsDrawing(true);
        setStartPoint({x:event.clientX,y:event.clientY});
        if(currentToolItem==="brush"){
            setPreview({
                points:[{ x:event.clientX,y:event.clientY }]
            });
        }
        if(currentToolItem==="text-box"){
            setTextInput({x:event.clientX,y:event.clientY,value:""});
        }
    }

    //Handler for Mousemove 
    const onMouseMove=(event)=>{
         if(currentToolItem==="eraser"){
        eraseAtPoint(event.clientX,event.clientY);
    }
        if(!isDrawing){
            return;
        }
        const a1=startPoint.x;
        const b1=startPoint.y;
        const a2=event.clientX;
        const b2=event.clientY;
        if(currentToolItem==="line"){
            setPreview({x1:a1,y1:b1,x2:a2,y2:b2});
        }
        else if(currentToolItem==="rect"){
            setPreview({x: Math.min(a1,a2), y: Math.min(b1,b2), width:Math.abs(a2-a1), height:Math.abs(b2-b1)});
        }
        else if(currentToolItem==="ellipse"){
            setPreview({cx:a1, cy:b1, rx:Math.abs(a2-a1), ry:Math.abs(b2-b1)});
        }
        else if(currentToolItem==="brush"){
            setPreview((oldPreview)=>{
                if(!oldPreview || !oldPreview.points){
                    return { points:[{ x:a2,y:b2 }] };
                }
                return{
                    points:[...oldPreview.points,{x:a2,y:b2}]
                }
            })
        }
        else if(currentToolItem==="circle"){
            setPreview({cx:a1, cy:b1, r:Math.sqrt((a2-a1)*(a2-a1)+(b2-b1)*(b2-b1))});
        }
    }

    //Hnadler for Mouseup
    const onMouseUp=()=>{
        if(currentToolItem==="eraser"){
        commitErase();
    }
        if(!isDrawing || !preview){
            return;
        }
        dispatch(addBoardElement({
            id: Date.now(),
            seed: Date.now(),
            type: currentToolItem,
            ...(currentToolItem==="brush"?{ points: preview.points }:preview)
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