import { createSlice } from "@reduxjs/toolkit";
import { moveElement } from "../utils/selectionHelpers";

const MAX_PAST=50;
const MAX_FUTURE=50;

const savedState=()=>{
    try{
        const rawStateData=localStorage.getItem("boardState");
        const state=JSON.parse(rawStateData);
        return {
            ...state,
            history:{
                past: state.history?.past?.slice(-MAX_PAST)||[],
                present: state.history?.present||{boardElements:[]},
                future: state.history?.future?.slice(0,MAX_FUTURE)||[]
            }
        };
    }
    catch{
        return null;
    }
}

const initialState=savedState()||{
    activeToolItem:"",
    strokeColor:"black",
    fillColor:"transparent",
    strokeWidth:2,
    history:{
        past:[],
        present:{ boardElements:[] },
        future:[]
    }
};

const Instance=(present)=>({
    boardElements: [...present.boardElements]
});

const boardSlice=createSlice({
    name: "board",
    initialState,
    reducers: {
        setActiveToolItem : (state,action)=>{
            state.activeToolItem=action.payload;
        },
        addBoardElement : (state,action)=>{
            const element=action.payload;
            if(!element || !element.id || !element.type){
                return;
            }
            state.history.past.push(Instance(state.history.present));
            if(state.history.past.length>MAX_PAST){
                state.history.past.shift();
            }
            state.history.present={
                boardElements: [
                    ...state.history.present.boardElements,
                    element
                ]
            }
            state.history.future=[];
        },
        addBoardElements : (state,action)=>{
            const elements=(action.payload||[]).filter(element=>element?.id && element?.type);
            if(elements.length===0){
                return;
            }

            state.history.past.push(Instance(state.history.present));
            if(state.history.past.length>MAX_PAST){
                state.history.past.shift();
            }
            state.history.present={
                boardElements: [
                    ...state.history.present.boardElements,
                    ...elements
                ]
            };
            state.history.future=[];
        },
        removeBoardElement : (state,action)=>{
            state.history.past.push(Instance(state.history.present));
            if(state.history.past.length>MAX_PAST){
                state.history.past.shift();
            }

            state.history.present.boardElements=state.history.present.boardElements.filter((element)=>{ 
                return element.id!==action.payload
            });
            state.history.future=[];
        },
        batchRemoveBoardElements:(state,action)=>{
            const ids=action.payload||[];
            if(ids.length===0){
                return;
            }

            state.history.past.push(Instance(state.history.present));
            if(state.history.past.length>MAX_PAST){
                state.history.past.shift();
            }

            state.history.present = {
                boardElements: state.history.present.boardElements.filter((element)=>{
                    return !ids.includes(element.id);
                }
            )};
            state.history.future=[];
        },
        moveBoardElements:(state,action)=>{
            const { ids=[],dx=0,dy=0 }=action.payload||{};
            if(ids.length===0 || (dx===0 && dy===0)){
                return;
            }

            state.history.past.push(Instance(state.history.present));
            if(state.history.past.length>MAX_PAST){
                state.history.past.shift();
            }

            const selectedIds=new Set(ids);
            state.history.present={
                boardElements: state.history.present.boardElements.map((element)=>{
                    if(!selectedIds.has(element.id)){
                        return element;
                    }
                    return moveElement(element,dx,dy);
                })
            };
            state.history.future=[];
        },
        undo : (state)=>{
            if(state.history.past.length===0){
                return;
            }
            state.history.future.unshift(
                Instance(state.history.present)
            );
            if(state.history.future.length>MAX_FUTURE){
                state.history.future.pop();
            }
            state.history.present=state.history.past.pop();
        },
        redo: (state)=>{
            if(state.history.future.length===0){
                return;
            }
            state.history.past.push(
                Instance(state.history.present)
            );

            if(state.history.past.length>MAX_PAST){
                state.history.past.shift();
            }
            state.history.present=state.history.future.shift();
        },
        setStrokeColor: (state,action)=>{
            state.strokeColor=action.payload;
        },
        setFillColor: (state,action)=>{
            state.fillColor=action.payload;
        },
        setStrokeWidth: (state,action)=>{
            state.strokeWidth=action.payload;
        }
    }
});

const boardReducer=boardSlice.reducer;

export const {setActiveToolItem,addBoardElement,addBoardElements,removeBoardElement,undo,redo,batchRemoveBoardElements,moveBoardElements
    ,setFillColor,setStrokeColor,setStrokeWidth
}=boardSlice.actions;

export default boardReducer;
