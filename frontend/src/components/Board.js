import { useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import rough from "roughjs/bin/rough";
import { useState } from "react";
import { addBoardElement } from "../store/boardSlice";

const Board=()=>{
    const dispatch=useDispatch();
    const currentToolItem=useSelector((store)=>{
        return store.board.activeToolItem;
    })

    const canvasRef=useRef(null);
    const boardElements=useSelector((store)=>{
        return store.board.boardElements;
    })

    const [isDrawing,setIsDrawing]=useState(false);
    const [startPoint,setStartPoint]=useState(null);
    const [preview,setPreview]=useState(null);
    const onMouseDown=(event)=>{
        if(currentToolItem!=="line"){
            return;
        }
        setIsDrawing(true);
        setStartPoint({x:event.clientX,y:event.clientY});
    }

    const onMouseMove=(e)=>{
        if(!isDrawing){
            return;
        }

        setPreview({
            x1:startPoint.x,
            y1:startPoint.y,
            x2:e.clientX,
            y2:e.clientY
        });
    };

    const onMouseUp=()=>{
        if(!isDrawing) return;

        dispatch(addBoardElement({
            type:"line",
            ...preview
        }));

        setIsDrawing(false);
        setPreview(null);
    };


    useEffect(()=>{
        const canvas=canvasRef.current;
        const ctx=canvas.getContext("2d");

        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        const roughCanvas=rough.canvas(canvas);
        const generator=roughCanvas.generator;

        boardElements.forEach((element)=>{
            if(element.type==="line"){
                roughCanvas.draw(generator.line(element.x1,element.y1,element.x2,element.y2));
            }
        });

        if(preview){
            roughCanvas.draw(generator.line(
                preview.x1,preview.y1,
                preview.x2,preview.y2
            ));
        }
    },[boardElements,preview]);

    return (
        <canvas ref={canvasRef} className="block" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}/>
    );
};

export default Board;
