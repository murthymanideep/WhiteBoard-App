export const toolbarContainer=
    "fixed top-4 left-1/2 -translate-x-1/2 z-20 bg-white shadow-md rounded-lg px-3 py-2 flex gap-2";

const toolButtonBase =
    "w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-md transition";

 export const toolLabel =
    "text-[10px] leading-none opacity-70";

export const toolButtonActive=
    "bg-blue-500 text-white";

export const toolButtonInactive=
    "bg-gray-100 hover:bg-gray-200";

export const getToolButtonClass = (activeTool, tool) =>{
    return toolButtonBase+" "+(activeTool===tool?toolButtonActive:toolButtonInactive);
}