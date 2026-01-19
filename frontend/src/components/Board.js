import { useEffect,useRef } from "react";
import { useSelector } from "react-redux";
import rough from "roughjs/bin/rough";
import useBoardMouseHandlers from "../hooks/useBoardMouseHandlers";
import ToolBar from "./ToolBar";
import ToolBox from "./ToolBox";
import { getColorValue } from "../utils/colorClassMap";

const Board=()=>{
    const canvasRef=useRef(null);
    const boardElements=useSelector((store)=>{
        return store.board.history.present.boardElements;
    });
    const {activeToolItem:activeTool,strokeColor,fillColor,strokeWidth}=useSelector((store)=>{
        return store.board;
    });
    const {preview,onMouseDown,onMouseMove,onMouseUp}=useBoardMouseHandlers();

    const downloadImage=()=>{
        const canvas=canvasRef.current;
        if(!canvas){
            return;
        }
        const link=document.createElement("a");
        link.href=canvas.toDataURL("image/png");
        link.download="drawing.png";
        link.click();
    };

    useEffect(()=>{
        const canvas=canvasRef.current;
        if(!canvas){
            return;
        }
        const ctx=canvas.getContext("2d");
        canvas.style.width="100vw";
        canvas.style.height="100vh";

        const dpr=window.devicePixelRatio || 1;
        const width=window.innerWidth;
        const height=window.innerHeight;

        canvas.width=width*dpr;
        canvas.height=height*dpr;
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr,dpr);

        ctx.clearRect(0,0,width,height);
        ctx.fillStyle="#ffffff";
        ctx.fillRect(0,0,width,height);

        const roughCanvas=rough.canvas(canvas);
        const generator=roughCanvas.generator;

        //For rendering the elements
        boardElements.forEach((element)=>{
            if(!element){
                return;
            }
            const baseOpts={
                seed: element.seed,
                stroke: getColorValue(element.strokeColor),
                strokeWidth: element.strokeWidth
            };
            const fillOpts=element.fillColor && element.fillColor!=="transparent"?{
                fill: getColorValue(element.fillColor),
                fillStyle: "solid"
            }:{};

            if(element.type==="line"){
                roughCanvas.draw(generator.line(element.x1,element.y1,element.x2,element.y2,baseOpts));
            }
            else if(element.type==="rect"){
                roughCanvas.draw(generator.rectangle(element.x,element.y,element.width,element.height,{...baseOpts,...fillOpts}));
            }
            else if(element.type==="ellipse"){
                roughCanvas.draw(generator.ellipse(element.cx,element.cy,(element.rx)*2,(element.ry)*2,{...baseOpts,...fillOpts}));
            }
            else if(element.type=="brush"){
                for(let i=1;i<element.points.length;i++){
                    roughCanvas.draw(generator.line(element.points[i-1].x,
                        element.points[i-1].y,
                        element.points[i].x,
                        element.points[i].y,
                        baseOpts));      
                }
            }
            else if(element.type=="circle"){
                roughCanvas.draw(generator.circle(element.cx,element.cy,element.r,{...baseOpts,...fillOpts}))
            }
        });

        //For preview
        if(preview){
            const previewOpts={
                stroke:getColorValue(strokeColor),
                strokeWidth,
                ...(activeTool!=="line" && activeTool!=="brush" && fillColor!=="transparent"?{
                    fill:getColorValue(fillColor),
                    fillStyle:"solid"
                }:{})
            };

            if(activeTool==="line"){
                roughCanvas.draw(generator.line(preview.x1,preview.y1,preview.x2,preview.y2,previewOpts));
            }
            else if(activeTool==="rect"){
                roughCanvas.draw(generator.rectangle(preview.x,preview.y,preview.width,preview.height,previewOpts));
            }
            else if(activeTool==="ellipse"){
                roughCanvas.draw(generator.ellipse(preview.cx,preview.cy,(preview.rx)*2,(preview.ry)*2,previewOpts));
            }
            else if(activeTool==="brush"){
                if(!preview.points){
                    return;
                }
                for(let i=1;i<preview.points.length;i++){
                    roughCanvas.draw(generator.line(preview.points[i-1].x,
                        preview.points[i-1].y,
                        preview.points[i].x,
                        preview.points[i].y,
                        {
                            stroke:getColorValue(strokeColor),
                            strokeWidth
                        }));      
                }
            }
            else if(activeTool==="circle"){
                roughCanvas.draw(generator.circle(preview.cx,preview.cy,preview.r,previewOpts));
            }
        }
    },[boardElements,preview,activeTool,strokeColor,fillColor,strokeWidth]);

    return (
        <>
            <ToolBar Download={downloadImage}/> 
            <ToolBox/>           
            <canvas ref={canvasRef} className="block" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}/>
            
        </>
    );
};

export default Board;
