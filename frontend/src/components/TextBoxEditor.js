import { useEffect,useRef,useState } from "react";
import { getColorValue } from "../utils/colorClassMap";
import { getTextFontSize,getTextLineHeight,measureTextBox,TEXT_FONT_FAMILY } from "../utils/textHelpers";

const TextBoxEditor=({point,strokeColor,strokeWidth,onSubmit,onCancel})=>{
    const [text,setText]=useState("");
    const inputRef=useRef(null);
    const isClosedRef=useRef(false);

    const fontSize=getTextFontSize(strokeWidth);
    const lineHeight=getTextLineHeight(fontSize);

    useEffect(()=>{
        inputRef.current?.focus();
    },[]);

    useEffect(()=>{
        const input=inputRef.current;
        if(!input){
            return;
        }

        input.style.height="auto";
        input.style.height=`${Math.max(lineHeight+18,input.scrollHeight)}px`;
    },[text,lineHeight]);

    const submitText=()=>{
        if(isClosedRef.current){
            return;
        }

        const cleanText=text.trimEnd();
        if(!cleanText.trim()){
            isClosedRef.current=true;
            onCancel();
            return;
        }

        const size=measureTextBox(cleanText,fontSize,lineHeight);
        isClosedRef.current=true;
        onSubmit({
            x: point.x,
            y: point.y,
            text: cleanText,
            fontSize,
            lineHeight,
            fontFamily: TEXT_FONT_FAMILY,
            width: size.width,
            height: size.height
        });
    };

    const handleKeyDown=(event)=>{
        if(event.key==="Enter" && !event.shiftKey){
            event.preventDefault();
            submitText();
        }

        if(event.key==="Escape"){
            event.preventDefault();
            if(!isClosedRef.current){
                isClosedRef.current=true;
                onCancel();
            }
        }
    };

    return (
        <textarea
            ref={inputRef}
            value={text}
            placeholder="Type..."
            rows={1}
            wrap="off"
            onChange={(event)=>setText(event.target.value)}
            onBlur={submitText}
            onKeyDown={handleKeyDown}
            onClick={(event)=>event.stopPropagation()}
            onMouseDown={(event)=>event.stopPropagation()}
            className="fixed z-40 min-w-[180px] max-w-[420px] resize-none overflow-hidden rounded-lg border border-blue-400 bg-white/90 px-3 py-2 text-gray-800 shadow-lg outline-none ring-2 ring-blue-200"
            style={{
                left: point.x,
                top: point.y,
                color: getColorValue(strokeColor),
                fontSize,
                lineHeight: `${lineHeight}px`,
                fontFamily: TEXT_FONT_FAMILY
            }}
        />
    );
};

export default TextBoxEditor;
