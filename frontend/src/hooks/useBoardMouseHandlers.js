import { useCallback,useEffect,useState } from "react";
import { addBoardElement,moveBoardElements } from "../store/boardSlice";
import { useDispatch, useSelector } from "react-redux";
import useErase from "./useErase";
import {
    boxesIntersect,
    getElementBounds,
    getSelectionBounds,
    isPointInsideBox,
    normalizeBox
} from "../utils/selectionHelpers";

const MIN_SELECTION_SIZE=4;

const getEventPoint=(event)=>{
    const rect=event.currentTarget?.getBoundingClientRect?.();

    if(!rect){
        return { x:event.clientX,y:event.clientY };
    }

    return {
        x: event.clientX-rect.left,
        y: event.clientY-rect.top
    };
};

const isSmallBox=(box)=>{
    if(!box){
        return true;
    }

    return box.width<MIN_SELECTION_SIZE && box.height<MIN_SELECTION_SIZE;
};

const getElementAtPoint=(elements,point)=>{
    return elements
        .slice()
        .reverse()
        .find(element=>isPointInsideBox(point,getElementBounds(element)));
};

const useBoardMouseHandlers=()=>{
    const dispatch=useDispatch();
    const { eraseAtPoint,commitErase }=useErase();

    const {activeToolItem: currentToolItem,strokeColor,fillColor,strokeWidth}=useSelector((store)=>{
        return store.board;
    });

    const [isDrawing,setIsDrawing]=useState(false);
    const [isErasing,setIsErasing]=useState(false);
    const [startPoint,setStartPoint]=useState(null);
    const [preview,setPreview]=useState(null);
    const [selectedIds,setSelectedIds]=useState([]);
    const [selectionBox,setSelectionBox]=useState(null);
    const [selectionStartPoint,setSelectionStartPoint]=useState(null);
    const [selectionAction,setSelectionAction]=useState(null);
    const [moveStartPoint,setMoveStartPoint]=useState(null);
    const [moveDelta,setMoveDelta]=useState({ dx:0,dy:0 });
    const [moveIds,setMoveIds]=useState([]);

    const boardElements=useSelector((store)=>{
        return store.board.history.present.boardElements;
    });

    const clearSelection=useCallback(()=>{
        setSelectedIds([]);
        setSelectionBox(null);
        setSelectionStartPoint(null);
        setSelectionAction(null);
        setMoveStartPoint(null);
        setMoveDelta({ dx:0,dy:0 });
        setMoveIds([]);
    },[]);

    useEffect(()=>{
        if(currentToolItem!=="select"){
            clearSelection();
        }
    },[clearSelection,currentToolItem]);

    // Handler for MouseDown
    const onMouseDown=(event)=>{
        const point=getEventPoint(event);

        if(currentToolItem==="select"){
            event.preventDefault();

            const selectedBounds=getSelectionBounds(boardElements,selectedIds);
            const target=getElementAtPoint(boardElements,point);

            if(target){
                const idsForMove=selectedIds.includes(target.id)?selectedIds:[target.id];
                setSelectedIds(idsForMove);
                setMoveIds(idsForMove);
                setSelectionAction("moving");
                setMoveStartPoint(point);
                setMoveDelta({ dx:0,dy:0 });
                setSelectionBox(null);
                return;
            }

            if(selectedIds.length>0 && isPointInsideBox(point,selectedBounds)){
                setMoveIds(selectedIds);
                setSelectionAction("moving");
                setMoveStartPoint(point);
                setMoveDelta({ dx:0,dy:0 });
                return;
            }

            setSelectedIds([]);
            setMoveIds([]);
            setSelectionAction("selecting");
            setSelectionStartPoint(point);
            setSelectionBox(normalizeBox(point,point));
            return;
        }

        if(currentToolItem==="eraser"){
            setIsErasing(true);
            eraseAtPoint(point.x,point.y);
            return;
        }

        const notOk=(currentToolItem!=="line" && currentToolItem!=="rect" && currentToolItem!=="ellipse"
            && currentToolItem!=="brush" && currentToolItem!=="circle"
        );
        if(notOk){
            return;
        }

        setIsDrawing(true);
        setStartPoint(point);
        if(currentToolItem==="brush"){
            setPreview({
                points:[point]
            });
        }
    };

    //Handler for Mousemove
    const onMouseMove=(event)=>{
        const point=getEventPoint(event);

        if(currentToolItem==="select"){
            if(selectionAction==="selecting" && selectionStartPoint){
                setSelectionBox(normalizeBox(selectionStartPoint,point));
            }
            else if(selectionAction==="moving" && moveStartPoint){
                setMoveDelta({
                    dx: point.x-moveStartPoint.x,
                    dy: point.y-moveStartPoint.y
                });
            }
            return;
        }

        if(currentToolItem==="eraser"){
            if(!isErasing){
                return;
            }
            eraseAtPoint(point.x,point.y);
            return;
        }
        if(!isDrawing || !startPoint){
            return;
        }

        const a1=startPoint.x;
        const b1=startPoint.y;
        const a2=point.x;
        const b2=point.y;
        if(currentToolItem==="line"){
            setPreview({x1:a1,y1:b1,x2:a2,y2:b2});
        }
        else if(currentToolItem==="rect"){
            setPreview({x: Math.min(a1,a2), y: Math.min(b1,b2), width:Math.abs(a2-a1), height:Math.abs(b2-b1)});
        }
        else if(currentToolItem==="ellipse"){
            setPreview({cx:a1, cy:b1, rx:Math.abs(a2-a1), ry:Math.abs(b2-b1)});
        }
        else if(currentToolItem==="brush"){
            setPreview((oldPreview)=>{
                if(!oldPreview || !oldPreview.points){
                    return { points:[{ x:a2,y:b2 }] };
                }
                return{
                    points:[...oldPreview.points,{x:a2,y:b2}]
                }
            })
        }
        else if(currentToolItem==="circle"){
            setPreview({cx:a1, cy:b1, r:Math.sqrt((a2-a1)*(a2-a1)+(b2-b1)*(b2-b1))});
        }
    };

    //Handler for Mouseup
    const onMouseUp=(event)=>{
        if(currentToolItem==="select"){
            const point=event?getEventPoint(event):selectionStartPoint;

            if(selectionAction==="selecting"){
                const finalBox=selectionBox||normalizeBox(selectionStartPoint,point);

                if(isSmallBox(finalBox)){
                    const target=getElementAtPoint(boardElements,point);
                    setSelectedIds(target?[target.id]:[]);
                }
                else{
                    setSelectedIds(
                        boardElements
                            .filter(element=>boxesIntersect(finalBox,getElementBounds(element)))
                            .map(element=>element.id)
                    );
                }

                setSelectionBox(null);
                setSelectionStartPoint(null);
                setSelectionAction(null);
                return;
            }

            if(selectionAction==="moving"){
                const ids=moveIds.length>0?moveIds:selectedIds;

                if(ids.length>0 && (moveDelta.dx!==0 || moveDelta.dy!==0)){
                    dispatch(moveBoardElements({
                        ids,
                        dx: moveDelta.dx,
                        dy: moveDelta.dy
                    }));
                }

                setMoveDelta({ dx:0,dy:0 });
                setMoveStartPoint(null);
                setMoveIds([]);
                setSelectionAction(null);
                return;
            }

            return;
        }

        if(currentToolItem==="eraser"){
            if(isErasing){
                commitErase();
                setIsErasing(false);
            }
            return;
        }

        if(!isDrawing || !preview){
            return;
        }
        dispatch(addBoardElement({
            id: Date.now(),
            seed: Date.now(),
            type: currentToolItem,
            ...(currentToolItem==="brush"?{ points:preview.points}: preview
            ),
            strokeColor,
            strokeWidth,
            ...(currentToolItem!=="line" && currentToolItem!=="brush"? { fillColor }:{}
            )
        }));

        setIsDrawing(false);
        setPreview(null);
        setStartPoint(null);
    };

    return {
        preview,
        selectedIds,
        selectionBox,
        moveDelta,
        clearSelection,
        setSelectedIds,
        onMouseDown,
        onMouseMove,
        onMouseUp
    };
};

export default useBoardMouseHandlers;
