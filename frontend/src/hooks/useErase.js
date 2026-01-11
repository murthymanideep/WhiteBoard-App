import { useDispatch,useSelector } from "react-redux";
import { removeBoardElement } from "../store/boardSlice";

const HIT_THRESHOLD=6;

const isPointNearLine=(pointX,pointY,line)=>{
    const { x1,y1,x2,y2 }=line;

    const pointVectorX=pointX-x1;
    const pointVectorY=pointY-y1;

    const lineVectorX=x2-x1;
    const lineVectorY=y2-y1;

    const dotProduct=pointVectorX*lineVectorX+pointVectorY*lineVectorY;
    const lineLengthSquared=lineVectorX*lineVectorX+lineVectorY*lineVectorY;

    const projectionFactor=dotProduct/lineLengthSquared;

    let closestX,closestY;

    if(projectionFactor<0){
        closestX=x1;
        closestY=y1;
    } 
    else if(projectionFactor>1){
        closestX=x2;
        closestY=y2;
    } 
    else{
        closestX=x1+projectionFactor*lineVectorX;
        closestY=y1+projectionFactor*lineVectorY;
    }

    const distanceX=pointX-closestX;
    const distanceY=pointY-closestY;

    return Math.sqrt(distanceX*distanceX+distanceY*distanceY)<HIT_THRESHOLD;
};

const isPointInsideRect=(x,y,rect)=>{
    return(
        x>=rect.x &&
        x<=rect.x+rect.width &&
        y>=rect.y &&
        y<=rect.y+rect.height
    );
};

const isPointInsideEllipse=(x,y,ellipse)=>{
    const dx=x-ellipse.cx;
    const dy=y-ellipse.cy;
    return ((dx*dx)/(ellipse.rx*ellipse.rx)+(dy*dy)/(ellipse.ry*ellipse.ry))<=1;
}

const isPointNearBrush=(x,y,brushElement)=>{
    for(let i=1;i<brushElement.points.length;i++){
        const p1=brushElement.points[i-1];
        const p2=brushElement.points[i];

        if(isPointNearLine(x,y,{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y})){
            return true;
        }
    }
    return false;
}

const isPointInsideCicle=(x,y,circle)=>{
    const dx=x-circle.cx;
    const dy=y-circle.cy;
    return (dx*dx+dy*dy)<=(circle.r)*(circle.r);
}

const useErase=()=>{
    const dispatch=useDispatch();
    const boardElements=useSelector(state=>state.board.boardElements);

    const eraseAtPoint=(x,y)=>{
        const topMostElement=boardElements
            .slice()
            .reverse()
            .find(element=>{
                if(!element?.id){
                    return false;
                }
                if(element.type==="line"){
                    return isPointNearLine(x,y,element);
                }
                if(element.type==="rect"){
                    return isPointInsideRect(x,y,element);
                }
                if(element.type==="ellipse"){
                    return isPointInsideEllipse(x,y,element);
                }
                if(element.type==="brush"){
                    return isPointNearBrush(x,y,element);
                }
                if(element.type==="circle"){
                    return isPointInsideCicle(x,y,element);
                }
                return false;
            });
        if(topMostElement){
            dispatch(removeBoardElement(topMostElement.id));
        }
    };

    return { eraseAtPoint };
};

export default useErase;