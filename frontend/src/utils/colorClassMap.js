export const COLOR_CLASS_MAP={
    black: {class:"bg-black",value:"#000000"},
    red: {class:"bg-red-500",value:"#ef4444"},
    green: {class:"bg-green-500",value:"#22c55e"},
    blue: {class:"bg-blue-500",value:"#3b82f6"},
    purple: {class:"bg-purple-500",value:"#a855f7"},
    yellow: {class:"bg-yellow-400",value:"#facc15"},
    white: {class:"bg-white",value:"#ffffff"},

    "red-light": {class:"bg-red-300",value:"#fecaca"},
    "green-light": {class:"bg-green-300",value:"#bbf7d0"},
    "blue-light": {class:"bg-blue-300",value:"#bfdbfe"},
    "purple-light": {class:"bg-purple-300",value:"#e9d5ff"},

    transparent:{class:"bg-transparent",value:"rgba(0,0,0,0)"}
};

export const getColorClass=(color)=>
    COLOR_CLASS_MAP[color]?.class || "";

export const getColorValue=(color)=>
    COLOR_CLASS_MAP[color]?.value || color;