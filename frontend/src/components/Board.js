import { useEffect,useRef,useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import rough from "roughjs/bin/rough";
import useBoardMouseHandlers from "../hooks/useBoardMouseHandlers";
import ToolBar from "./ToolBar";
import ToolBox from "./ToolBox";
import { getColorValue } from "../utils/colorClassMap";
import { addBoardElement,setActiveToolItem } from "../store/boardSlice";
import { drawTextElement } from "../utils/textHelpers";
import TextBoxEditor from "./TextBoxEditor";
import AiPanel from "./AiPanel";

const Board=()=>{
    const dispatch=useDispatch();
    const canvasRef=useRef(null);
    const imageCacheRef=useRef({});
    const [textPoint,setTextPoint]=useState(null);
    const [imageVersion,setImageVersion]=useState(0);
    const boardElements=useSelector((store)=>{
        return store.board.history.present.boardElements;
    });
    const {activeToolItem:activeTool,strokeColor,fillColor,strokeWidth}=useSelector((store)=>{
        return store.board;
    });
    const {preview,onMouseDown,onMouseMove,onMouseUp}=useBoardMouseHandlers();

    useEffect(()=>{
        if(activeTool!=="text-box"){
            setTextPoint(null);
        }
    },[activeTool]);

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

    const handleMouseDown=(event)=>{
        if(activeTool==="text-box"){
            return;
        }

        onMouseDown(event);
    };

    const handleCanvasClick=(event)=>{
        if(activeTool!=="text-box"){
            return;
        }

        setTextPoint({ x:event.clientX,y:event.clientY });
    };

    const addTextElement=(textData)=>{
        dispatch(addBoardElement({
            id: Date.now(),
            seed: Date.now(),
            type: "text-box",
            ...textData,
            strokeColor,
            strokeWidth
        }));
        setTextPoint(null);
    };

    const addImageElement=(imageData)=>{
        const width=Math.min(imageData.width,window.innerWidth-160);
        const height=width/imageData.ratio;

        dispatch(addBoardElement({
            id: Date.now(),
            seed: Date.now(),
            type: "image",
            src: imageData.src,
            x: Math.max(40,(window.innerWidth-width)/2),
            y: Math.max(110,(window.innerHeight-height)/2),
            width,
            height
        }));

        dispatch(setActiveToolItem("brush"));
    };

    const closeAiPanel=()=>{
        dispatch(setActiveToolItem(""));
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
            else if(element.type==="text-box"){
                drawTextElement(ctx,element,getColorValue);
            }
            else if(element.type==="image"){
                let image=imageCacheRef.current[element.src];

                if(!image){
                    image=new Image();
                    image.onload=()=>{
                        setImageVersion(version=>version+1);
                    };
                    image.src=element.src;
                    imageCacheRef.current[element.src]=image;
                }

                if(image.complete && image.naturalWidth){
                    ctx.drawImage(image,element.x,element.y,element.width,element.height);
                }
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
    },[boardElements,preview,activeTool,strokeColor,fillColor,strokeWidth,imageVersion]);

    return (
        <>
            <ToolBar Download={downloadImage}/> 
            <ToolBox/>
            {activeTool==="ai" && (
                <AiPanel
                    canvasRef={canvasRef}
                    onApplyImage={addImageElement}
                    onClose={closeAiPanel}
                />
            )}
            {textPoint && (
                <TextBoxEditor
                    point={textPoint}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    onSubmit={addTextElement}
                    onCancel={()=>setTextPoint(null)}
                />
            )}
            <canvas
                ref={canvasRef}
                className={activeTool==="text-box"?"block cursor-text":"block"}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            />
            
        </>
    );
};

export default Board;
