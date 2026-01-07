import { useEffect,useRef } from "react";

const Board=()=>{
    const canvasRef=useRef(null);

    useEffect(()=>{
        const canvas=canvasRef.current;
        const ctx=canvas.getContext("2d");

        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        ctx.strokeStyle="red";
        ctx.lineWidth=2;
        ctx.strokeRect(100,100,200,150);
    },[]);

    return (
        <canvas ref={canvasRef} className="block"/>
    );
};

export default Board;
