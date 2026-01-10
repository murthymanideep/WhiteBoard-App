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
                return false;
            });
        if(topMostElement){
            dispatch(removeBoardElement(topMostElement.id));
        }
    };

    return { eraseAtPoint };
};

export default useErase;