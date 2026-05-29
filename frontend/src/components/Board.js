import { useEffect,useRef,useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import rough from "roughjs/bin/rough";
import useBoardMouseHandlers from "../hooks/useBoardMouseHandlers";
import ToolBar from "./ToolBar";
import ToolBox from "./ToolBox";
import { getColorValue } from "../utils/colorClassMap";
import {
    addBoardElement,
    addBoardElements,
    batchRemoveBoardElements,
    redo,
    setActiveToolItem,
    undo
} from "../store/boardSlice";
import { drawTextElement } from "../utils/textHelpers";
import TextBoxEditor from "./TextBoxEditor";
import AiPanel from "./AiPanel";
import {
    cloneElementForCopy,
    getSelectionBounds,
    moveElement
} from "../utils/selectionHelpers";

const isEditableTarget=(target)=>{
    return (
        target?.tagName==="INPUT" ||
        target?.tagName==="TEXTAREA" ||
        target?.isContentEditable
    );
};

const Board=()=>{
    const dispatch=useDispatch();
    const canvasRef=useRef(null);
    const imageCacheRef=useRef({});
    const clipboardRef=useRef([]);
    const [textPoint,setTextPoint]=useState(null);
    const [imageVersion,setImageVersion]=useState(0);
    const boardElements=useSelector((store)=>{
        return store.board.history.present.boardElements;
    });
    const {activeToolItem:activeTool,strokeColor,fillColor,strokeWidth}=useSelector((store)=>{
        return store.board;
    });
    const {
        preview,
        selectedIds,
        selectionBox,
        moveDelta,
        clearSelection,
        setSelectedIds,
        onMouseDown,
        onMouseMove,
        onMouseUp
    }=useBoardMouseHandlers();

    useEffect(()=>{
        if(activeTool!=="text-box"){
            setTextPoint(null);
        }
    },[activeTool]);

    useEffect(()=>{
        const handleKeyDown=(event)=>{
            if(isEditableTarget(event.target)){
                return;
            }

            const key=event.key.toLowerCase();
            const hasModifier=event.ctrlKey || event.metaKey;

            if(hasModifier && key==="z"){
                event.preventDefault();
                dispatch(event.shiftKey?redo():undo());
                return;
            }

            if(hasModifier && key==="y"){
                event.preventDefault();
                dispatch(redo());
                return;
            }

            if(hasModifier && key==="c"){
                if(selectedIds.length===0){
                    return;
                }

                const selectedSet=new Set(selectedIds);
                clipboardRef.current=boardElements
                    .filter(element=>selectedSet.has(element.id))
                    .map(element=>JSON.parse(JSON.stringify(element)));
                event.preventDefault();
                return;
            }

            if(hasModifier && key==="v"){
                if(clipboardRef.current.length===0){
                    return;
                }

                const pastedElements=clipboardRef.current.map((element,index)=>cloneElementForCopy(element,index));
                clipboardRef.current=pastedElements.map(element=>JSON.parse(JSON.stringify(element)));
                dispatch(addBoardElements(pastedElements));
                dispatch(setActiveToolItem("select"));
                setSelectedIds(pastedElements.map(element=>element.id));
                event.preventDefault();
                return;
            }

            if(key==="delete" || key==="backspace"){
                if(selectedIds.length===0){
                    return;
                }

                dispatch(batchRemoveBoardElements(selectedIds));
                clearSelection();
                event.preventDefault();
                return;
            }

            if(key==="escape"){
                if(selectedIds.length>0 || textPoint){
                    clearSelection();
                    setTextPoint(null);
                    event.preventDefault();
                }
            }
        };

        window.addEventListener("keydown",handleKeyDown);

        return ()=>{
            window.removeEventListener("keydown",handleKeyDown);
        };
    },[boardElements,clearSelection,dispatch,selectedIds,setSelectedIds,textPoint]);

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
        const selectedIdSet=new Set(selectedIds);
        const hasMoveDelta=moveDelta.dx!==0 || moveDelta.dy!==0;
        const displayElements=boardElements.map((element)=>{
            if(activeTool==="select" && hasMoveDelta && selectedIdSet.has(element.id)){
                return moveElement(element,moveDelta.dx,moveDelta.dy);
            }

            return element;
        });

        //For rendering the elements
        displayElements.forEach((element)=>{
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

        if(activeTool==="select"){
            ctx.save();
            ctx.lineWidth=1.5;
            ctx.strokeStyle="#2563eb";
            ctx.fillStyle="rgba(37,99,235,0.08)";
            ctx.setLineDash([6,4]);

            if(selectionBox){
                ctx.fillRect(selectionBox.x,selectionBox.y,selectionBox.width,selectionBox.height);
                ctx.strokeRect(selectionBox.x,selectionBox.y,selectionBox.width,selectionBox.height);
            }

            const selectedBounds=getSelectionBounds(displayElements,selectedIds);
            if(selectedBounds){
                ctx.fillRect(selectedBounds.x,selectedBounds.y,selectedBounds.width,selectedBounds.height);
                ctx.strokeRect(selectedBounds.x,selectedBounds.y,selectedBounds.width,selectedBounds.height);
            }

            ctx.restore();
        }
    },[boardElements,preview,activeTool,strokeColor,fillColor,strokeWidth,imageVersion,selectedIds,selectionBox,moveDelta]);

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
                className={activeTool==="text-box"?"block cursor-text":activeTool==="select"?"block cursor-crosshair":"block"}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            />
            
        </>
    );
};

export default Board;
