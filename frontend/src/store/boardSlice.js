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
            state.boardElements.push(action.payload);
        }
    }
});

const boardReducer=boardSlice.reducer;

export const {setActiveToolItem,addBoardElement}=boardSlice.actions;

export default boardReducer;