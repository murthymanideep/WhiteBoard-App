const SELECTION_PADDING=6;
const COPY_OFFSET=24;

export const normalizeBox=(pointA,pointB)=>({
    x: Math.min(pointA.x,pointB.x),
    y: Math.min(pointA.y,pointB.y),
    width: Math.abs(pointB.x-pointA.x),
    height: Math.abs(pointB.y-pointA.y)
});

export const getElementBounds=(element)=>{
    if(!element){
        return null;
    }

    const padding=Math.max(SELECTION_PADDING,element.strokeWidth||0);

    if(element.type==="line"){
        return {
            x: Math.min(element.x1,element.x2)-padding,
            y: Math.min(element.y1,element.y2)-padding,
            width: Math.abs(element.x2-element.x1)+padding*2,
            height: Math.abs(element.y2-element.y1)+padding*2
        };
    }

    if(element.type==="rect"){
        return {
            x: element.x-padding,
            y: element.y-padding,
            width: element.width+padding*2,
            height: element.height+padding*2
        };
    }

    if(element.type==="ellipse"){
        return {
            x: element.cx-element.rx-padding,
            y: element.cy-element.ry-padding,
            width: element.rx*2+padding*2,
            height: element.ry*2+padding*2
        };
    }

    if(element.type==="circle"){
        const radius=element.r/2;
        return {
            x: element.cx-radius-padding,
            y: element.cy-radius-padding,
            width: radius*2+padding*2,
            height: radius*2+padding*2
        };
    }

    if(element.type==="brush"){
        const points=element.points||[];
        if(!points.length){
            return null;
        }

        const xs=points.map(point=>point.x);
        const ys=points.map(point=>point.y);

        return {
            x: Math.min(...xs)-padding,
            y: Math.min(...ys)-padding,
            width: Math.max(...xs)-Math.min(...xs)+padding*2,
            height: Math.max(...ys)-Math.min(...ys)+padding*2
        };
    }

    if(element.type==="text-box"){
        return {
            x: element.x-padding,
            y: element.y-padding,
            width: (element.width||160)+padding*2,
            height: (element.height||32)+padding*2
        };
    }

    if(element.type==="image"){
        return {
            x: element.x-padding,
            y: element.y-padding,
            width: element.width+padding*2,
            height: element.height+padding*2
        };
    }

    return null;
};

export const boxesIntersect=(boxA,boxB)=>{
    if(!boxA || !boxB){
        return false;
    }

    return (
        boxA.x<=boxB.x+boxB.width &&
        boxA.x+boxA.width>=boxB.x &&
        boxA.y<=boxB.y+boxB.height &&
        boxA.y+boxA.height>=boxB.y
    );
};

export const isPointInsideBox=(point,box)=>{
    if(!box){
        return false;
    }

    return (
        point.x>=box.x &&
        point.x<=box.x+box.width &&
        point.y>=box.y &&
        point.y<=box.y+box.height
    );
};

export const getSelectionBounds=(elements,selectedIds)=>{
    const selectedIdSet=new Set(selectedIds);
    const bounds=elements
        .filter(element=>selectedIdSet.has(element.id))
        .map(getElementBounds)
        .filter(Boolean);

    if(!bounds.length){
        return null;
    }

    const minX=Math.min(...bounds.map(box=>box.x));
    const minY=Math.min(...bounds.map(box=>box.y));
    const maxX=Math.max(...bounds.map(box=>box.x+box.width));
    const maxY=Math.max(...bounds.map(box=>box.y+box.height));

    return {
        x: minX,
        y: minY,
        width: maxX-minX,
        height: maxY-minY
    };
};

export const moveElement=(element,dx,dy)=>{
    if(!element){
        return element;
    }

    if(element.type==="line"){
        return {
            ...element,
            x1: element.x1+dx,
            y1: element.y1+dy,
            x2: element.x2+dx,
            y2: element.y2+dy
        };
    }

    if(element.type==="rect" || element.type==="text-box" || element.type==="image"){
        return {
            ...element,
            x: element.x+dx,
            y: element.y+dy
        };
    }

    if(element.type==="ellipse" || element.type==="circle"){
        return {
            ...element,
            cx: element.cx+dx,
            cy: element.cy+dy
        };
    }

    if(element.type==="brush"){
        return {
            ...element,
            points: element.points.map(point=>({
                x: point.x+dx,
                y: point.y+dy
            }))
        };
    }

    return element;
};

export const cloneElementForCopy=(element,index=0)=>{
    const now=Date.now();
    const seed=now+index;
    const uniqueId=Math.random().toString(36).slice(2,8);

    return moveElement({
        ...element,
        id: `${now}-${index}-${uniqueId}`,
        seed,
        points: element.points?.map(point=>({ ...point }))
    },COPY_OFFSET,COPY_OFFSET);
};
