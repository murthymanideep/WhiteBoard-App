const path=require("node:path");
const dotenv=require("dotenv");

const loadEnv=()=>{
    dotenv.config({
        path: path.join(__dirname,"..","..",".env"),
        override: false,
        quiet: true
    });
};

loadEnv();

const isProduction=process.env.NODE_ENV==="production";
const parseList=(value)=>{
    return String(value||"")
        .split(",")
        .map(item=>item.trim())
        .map(item=>item.replace(/\/+$/,""))
        .filter(Boolean);
};

const getPort=(value,fallback)=>{
    const port=Number(value||fallback);
    return Number.isInteger(port) && port>0 ? port : fallback;
};

const defaultFrontendUrl=isProduction ? "" : "http://127.0.0.1:1234";
const frontendUrls=parseList(process.env.FRONTEND_URL||defaultFrontendUrl);

if(isProduction && !frontendUrls.length){
    throw new Error("FRONTEND_URL is required in production.");
}

if(frontendUrls.includes("*")){
    throw new Error("FRONTEND_URL must be a real frontend origin, not '*'.");
}

const config={
    env: process.env.NODE_ENV||"development",
    port: getPort(process.env.PORT||process.env.AI_SERVER_PORT,8787),
    host: process.env.AI_SERVER_HOST||process.env.HOST||(isProduction ? "0.0.0.0" : "127.0.0.1"),
    frontendUrls,
    bodyLimit: process.env.BODY_LIMIT||"10mb",
    gemini: {
        apiUrl: (process.env.GEMINI_API_URL||"https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/,""),
        apiKey: process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY||"",
        textModel: process.env.GEMINI_TEXT_MODEL||"gemini-2.5-flash",
        imageModel: process.env.GEMINI_IMAGE_MODEL||"gemini-2.5-flash-image"
    }
};

module.exports=config;
