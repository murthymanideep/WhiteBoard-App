const COLOR_CLASS_MAP = {
    black:"bg-black",
    red:"bg-red-500",
    green:"bg-green-500",
    blue:"bg-blue-500",
    purple:"bg-purple-500",
    yellow:"bg-yellow-400",
    white:"bg-white",

    "red-light":"bg-red-300",
    "green-light":"bg-green-300",
    "blue-light":"bg-blue-300",
    "purple-light":"bg-purple-300",

    transparent:"bg-transparent"
};

export const getColorClass=(color)=>{
    return COLOR_CLASS_MAP[color] || "";
};
