import Board from "./components/Board"
import ReactDOM from "react-dom/client"
import ToolBar from "./components/ToolBar";
import { Provider } from "react-redux";
import appStore from "./store/appStore";

const AppLayout=()=>{
    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <Board/>
        </div>
    );
};



const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={appStore}>
        <AppLayout/>
    </Provider>
);