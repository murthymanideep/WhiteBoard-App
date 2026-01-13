import { createSlice } from "@reduxjs/toolkit";

const initialState={
    activeToolItem: "",
    history:{
        past: [],
        present: {
            boardElements : []
        },
        future: []
    }
}
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
            state.history.past.push(state.history.present);
            state.history.present={
                boardElements: [
                    ...state.history.present.boardElements,
                    element
                ]
            }
            state.history.future=[];
        },
        removeBoardElement : (state,action)=>{
            state.history.past.push(state.history.present);
            state.history.present.boardElements=state.history.present.boardElements.filter((element)=>{ 
                return element.id!==action.payload
            });
            state.history.future=[];
        },
        batchRemoveBoardElements:(state,action)=>{
            const ids=action.payload;
            state.history.past.push(state.history.present);
            state.history.present = {
                boardElements: state.history.present.boardElements.filter((element)=>{
                    return !ids.includes(element.id);
                }
            )};
            state.history.future=[];
        },
        undo : (state)=>{
            if(state.history.past.length===0){
                return;
            }
            state.history.future.unshift(state.history.present);
            state.history.present=state.history.past.pop();
        },
        redo: (state)=>{
            if(state.history.future.length===0){
                return;
            }
            state.history.past.push(state.history.present);
            state.history.present=state.history.future.shift();
        }
    }
});

const boardReducer=boardSlice.reducer;

export const {setActiveToolItem,addBoardElement,removeBoardElement,undo,redo,batchRemoveBoardElements}=boardSlice.actions;

export default boardReducer;