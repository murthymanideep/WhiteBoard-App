import { useEffect,useRef } from "react";
import { useSelector } from "react-redux";
import rough from "roughjs/bin/rough";

const Board=()=>{
    const currentToolItem=useSelector((store)=>{
        return store.board.activeToolItem;
    })
    const canvasRef=useRef(null);
    const boardElements=useSelector((store)=>{
        return store.board.boardElements;
    })

    useEffect(()=>{
        const canvas=canvasRef.current;
        const ctx=canvas.getContext("2d");

        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        const roughCanvas=rough.canvas(canvas);
        const generator=roughCanvas.generator;

        if(currentToolItem==="line"){
            const line=generator.line(100,100,200,200);
            roughCanvas.draw(line);
        }
        
    },[currentToolItem]);

    return (
        <canvas ref={canvasRef} className="block"/>
    );
};

export default Board;
