import {configureStore} from "@reduxjs/toolkit"
import boardReducer from "./boardSlice";

const appStore=configureStore({
    reducer : {
        board : boardReducer
    }
});

let saveTimeout=null;
appStore.subscribe(()=>{
    if(saveTimeout){
        return;
    }
    saveTimeout=setTimeout(()=>{
        try{
            const state=appStore.getState().board;
            localStorage.setItem("boardState",JSON.stringify(state));
        }
        catch{}
        saveTimeout=null;
    },300);
});

export default appStore;