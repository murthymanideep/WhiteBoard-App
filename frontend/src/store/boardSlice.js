import { createSlice } from "@reduxjs/toolkit";

const boardSlice=createSlice({
    name: "board",
    initialState: {
        activeToolItem: "",
        boardElements: []
    },
    reducers: {
        setActiveToolItem : (state,action)=>{
            state.activeToolItem=action.payload;
        },
        addBoardElement : (state,action)=>{
            const element=action.payload;
            if(!element || !element.id || !element.type){
                return;
            }
            state.boardElements.push(element);
        },
        removeBoardElement : (state,action)=>{
            state.boardElements=state.boardElements.filter((element)=>{ 
                return element.id!==action.payload
            });
        }
    }
});

const boardReducer=boardSlice.reducer;

export const {setActiveToolItem,addBoardElement,removeBoardElement}=boardSlice.actions;

export default boardReducer;