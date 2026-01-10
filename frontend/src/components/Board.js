import { useEffect,useRef } from "react";
import { useSelector } from "react-redux";
import rough from "roughjs/bin/rough";
import useBoardMouseHandlers from "../hooks/useBoardMouseHandlers";

const Board=()=>{
    const canvasRef=useRef(null);
    const boardElements=useSelector((store)=>{
        return store.board.boardElements;
    })
    const activeTool=useSelector((store)=>{
        return store.board.activeToolItem;
    })
    const {preview,onMouseDown,onMouseMove,onMouseUp}=useBoardMouseHandlers();

    useEffect(()=>{
        const canvas=canvasRef.current;
        const ctx=canvas.getContext("2d");

        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        const roughCanvas=rough.canvas(canvas);
        const generator=roughCanvas.generator;

        //For rendering the elements
        boardElements.forEach((element)=>{
            if(!element){
                return;
            }
            if(element.type==="line"){
                roughCanvas.draw(generator.line(element.x1,element.y1,element.x2,element.y2));
            }
            else if(element.type==="rect"){
                roughCanvas.draw(generator.rectangle(element.x,element.y,element.width,element.height));
            }
        });

        //For preview
        if(preview){
            if(activeTool==="line"){
                roughCanvas.draw(generator.line(preview.x1,preview.y1,preview.x2,preview.y2));
            }
            else if(activeTool==="rect"){
                roughCanvas.draw(generator.rectangle(preview.x,preview.y,preview.width,preview.height));
            }
        }
    },[boardElements,preview]);

    return (
        <canvas ref={canvasRef} className="block" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}/>
    );
};

export default Board;
