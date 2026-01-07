import Board from "./components/Board"
import ReactDOM from "react-dom/client"
import ToolBar from "./components/ToolBar";

const AppLayout=()=>{
    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <ToolBar/>
            <Board/>
        </div>
    );
};



const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppLayout/>);