import {configureStore} from "@reduxjs/toolkit"
import boardReducer from "./boardSlice";

const appStore=configureStore({
    reducer : {
        board : boardReducer
    }
});

export default appStore;