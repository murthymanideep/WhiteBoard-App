export const TEXT_FONT_FAMILY="Arial, sans-serif";

export const getTextFontSize=(strokeWidth=2)=>{
    return Math.max(18,Math.min(48,16+strokeWidth*4));
};

export const getTextLineHeight=(fontSize)=>{
    return Math.round(fontSize*1.3);
};

export const measureTextBox=(text,fontSize,lineHeight)=>{
    if(typeof document==="undefined"){
        const lines=(text||"").split("\n");
        return {
            width: Math.max(80,...lines.map(line=>line.length*fontSize*0.55)),
            height: Math.max(lineHeight,lines.length*lineHeight)
        };
    }

    const canvas=document.createElement("canvas");
    const ctx=canvas.getContext("2d");
    const lines=(text||"").split("\n");

    ctx.font=`${fontSize}px ${TEXT_FONT_FAMILY}`;

    return {
        width: Math.max(80,...lines.map(line=>ctx.measureText(line||" ").width)),
        height: Math.max(lineHeight,lines.length*lineHeight)
    };
};

export const drawTextElement=(ctx,element,getColorValue)=>{
    const fontSize=element.fontSize||24;
    const lineHeight=element.lineHeight||getTextLineHeight(fontSize);
    const lines=(element.text||"").split("\n");

    ctx.save();
    ctx.font=`${fontSize}px ${element.fontFamily||TEXT_FONT_FAMILY}`;
    ctx.fillStyle=getColorValue(element.strokeColor||"black");
    ctx.textBaseline="top";

    lines.forEach((line,index)=>{
        ctx.fillText(line,element.x,element.y+index*lineHeight);
    });

    ctx.restore();
};
