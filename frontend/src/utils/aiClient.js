import { AI_ENDPOINT } from "../config/aiConfig";

const MAX_IMAGE_SIDE=1280;
const SNAPSHOT_PADDING=56;

const getAiEndpoint=()=>{
    if(!AI_ENDPOINT){
        throw new Error("AI_ENDPOINT is not configured. Add it to frontend/.env.");
    }

    return AI_ENDPOINT;
};

const getCanvasSnapshot=(canvas)=>{
    const scale=Math.min(1,MAX_IMAGE_SIDE/Math.max(canvas.width,canvas.height));
    const width=Math.round(canvas.width*scale);
    const height=Math.round(canvas.height*scale);

    const snapshot=document.createElement("canvas");
    const ctx=snapshot.getContext("2d");

    snapshot.width=width;
    snapshot.height=height;

    ctx.fillStyle="#ffffff";
    ctx.fillRect(0,0,width,height);
    ctx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,width,height);

    const bounds=getSketchBounds(ctx,width,height);
    if(!bounds){
        return {
            imageDataUrl: snapshot.toDataURL("image/png"),
            width,
            height,
            hasInk: false
        };
    }

    const cropped=document.createElement("canvas");
    const croppedCtx=cropped.getContext("2d");

    cropped.width=bounds.width;
    cropped.height=bounds.height;
    croppedCtx.fillStyle="#ffffff";
    croppedCtx.fillRect(0,0,cropped.width,cropped.height);
    croppedCtx.drawImage(
        snapshot,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        0,
        0,
        bounds.width,
        bounds.height
    );

    return {
        imageDataUrl: cropped.toDataURL("image/png"),
        width: cropped.width,
        height: cropped.height,
        hasInk: true
    };
};

const getSketchBounds=(ctx,width,height)=>{
    const imageData=ctx.getImageData(0,0,width,height);
    const data=imageData.data;
    let minX=width;
    let minY=height;
    let maxX=0;
    let maxY=0;

    for(let y=0; y<height; y+=1){
        for(let x=0; x<width; x+=1){
            const index=(y*width+x)*4;
            const red=data[index];
            const green=data[index+1];
            const blue=data[index+2];
            const alpha=data[index+3];
            const hasInk=alpha>20 && (red<245 || green<245 || blue<245);

            if(hasInk){
                minX=Math.min(minX,x);
                minY=Math.min(minY,y);
                maxX=Math.max(maxX,x);
                maxY=Math.max(maxY,y);
            }
        }
    }

    if(minX>maxX || minY>maxY){
        return null;
    }

    return {
        x: Math.max(0,minX-SNAPSHOT_PADDING),
        y: Math.max(0,minY-SNAPSHOT_PADDING),
        width: Math.min(width,maxX+SNAPSHOT_PADDING)-Math.max(0,minX-SNAPSHOT_PADDING),
        height: Math.min(height,maxY+SNAPSHOT_PADDING)-Math.max(0,minY-SNAPSHOT_PADDING)
    };
};

export const buildAiSketchRequest=(canvas,prompt)=>{
    if(!canvas){
        throw new Error("Canvas is not ready yet.");
    }

    const snapshot=getCanvasSnapshot(canvas);
    const cleanPrompt=String(prompt||"").trim();

    return {
        imageDataUrl: snapshot.imageDataUrl,
        imageWidth: snapshot.width,
        imageHeight: snapshot.height,
        hasInk: snapshot.hasInk,
        prompt: cleanPrompt
    };
};

export const createRealisticPhoto=async(request)=>{
    if(!request?.imageDataUrl){
        throw new Error("Canvas is not ready yet.");
    }

    const response=await fetch(getAiEndpoint(),{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            imageDataUrl: request.imageDataUrl,
            imageWidth: request.imageWidth,
            imageHeight: request.imageHeight,
            prompt: request.prompt
        })
    });

    const data=await response.json().catch(()=>null);

    if(!response.ok){
        throw new Error(data?.error||"AI request failed.");
    }

    return {
        ...data,
        requestImageDataUrl: request.imageDataUrl,
        sentPrompt: request.prompt
    };
};
