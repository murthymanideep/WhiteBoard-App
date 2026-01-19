export const toolbarContainer =
    "fixed top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-4 py-3 flex gap-3 border border-gray-200";

const toolButtonBase =
    "w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 select-none";

export const toolLabel =
    "text-[10px] leading-none text-gray-600";

export const toolButtonActive =
    "bg-blue-500 text-white shadow-md scale-105";

export const toolButtonInactive =
    "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95";

export const getToolButtonClass = (activeTool, tool) =>
    toolButtonBase + " " + (activeTool === tool ? toolButtonActive : toolButtonInactive);
