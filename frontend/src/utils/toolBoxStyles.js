import { getColorClass } from "./colorClassMap";

export const toolBoxContainer =
    "fixed left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-4 flex flex-col gap-5 border border-gray-200";

export const toolSection =
    "flex flex-col gap-2";

export const toolSectionLabel =
    "text-[11px] font-medium text-gray-600";

export const colorGrid =
    "flex gap-2 flex-wrap";

const colorSwatchBase =
    "w-6 h-6 rounded-full border transition-all duration-150";

const colorSwatchActive =
    "ring-2 ring-blue-500 scale-110";

const colorSwatchInactive =
    "hover:scale-110 hover:border-gray-400";

export const getColorSwitchClass = (color, activeColor) => {
    return [
        colorSwatchBase,
        getColorClass(color),
        color === activeColor ? colorSwatchActive : colorSwatchInactive
    ].join(" ");
};

export const strokeWidthRow =
    "flex items-center gap-2";

const strokeWidthButtonBase =
    "w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center transition-all";

const strokeWidthButtonActive =
    "bg-blue-500 text-white border-blue-500";

const strokeWidthButtonInactive =
    "bg-white text-gray-700 hover:bg-gray-100";

export const getStrokeWidthButtonClass = (value, activeValue) => {
    return [
        strokeWidthButtonBase,
        value === activeValue
            ? strokeWidthButtonActive
            : strokeWidthButtonInactive
    ].join(" ");
};
