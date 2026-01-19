import {
    toolBoxContainer,
    toolSection,
    toolSectionLabel,
    colorGrid,
    getColorSwitchClass,
    strokeWidthRow,
    getStrokeWidthButtonClass
} from "../utils/toolBoxStyles";
import { STROKE_COLORS,FILL_COLORS } from "../utils/colors";
import { useDispatch,useSelector } from "react-redux";
import { setFillColor,setStrokeColor,setStrokeWidth } from "../store/boardSlice";

const STROKE_WIDTHS=[1,2,3,4,6,8,10];

const ToolBox=()=>{
    const dispatch=useDispatch();
    const { strokeColor,fillColor,strokeWidth }=useSelector(
        state=>state.board
    );

    return(
        <div className={toolBoxContainer}>

            {/* Stroke Color */}
            <div className={toolSection}>
                <p className={toolSectionLabel}>Stroke</p>
                <div className={colorGrid}>
                    {STROKE_COLORS.map((color)=>(
                        <button key={color} className={getColorSwitchClass(color,strokeColor)} onClick={()=>dispatch(setStrokeColor(color))}/>
                    ))}
                </div>
            </div>

            {/* Fill Color */}
            <div className={toolSection}>
                <p className={toolSectionLabel}>Fill</p>
                <div className={colorGrid}>
                    {FILL_COLORS.map((color)=>(
                        <button key={color} className={getColorSwitchClass(color,fillColor)} onClick={()=>dispatch(setFillColor(color))}/>
                    ))}
                </div>
            </div>

            {/* Stroke Width */}
            <div className={toolSection}>
                <p className={toolSectionLabel}>Stroke Width</p>
                <div className={strokeWidthRow}>
                    {STROKE_WIDTHS.map(w => (
                        <button key={w} className={getStrokeWidthButtonClass(w,strokeWidth)} onClick={()=>dispatch(setStrokeWidth(w))}>
                            <div className="bg-current rounded-full" style={{ width:w*2,height:w*2 }}/>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ToolBox;
