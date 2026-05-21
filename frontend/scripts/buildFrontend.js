const { spawn }=require("node:child_process");
const fs=require("node:fs");
const path=require("node:path");

const rootDir=path.join(__dirname,"..");
const frontendEnvPath=path.join(rootDir,".env");
const aiConfigPath=path.join(rootDir,"src","config","aiConfig.js");
const parcelBin=path.join(
    rootDir,
    "node_modules",
    ".bin",
    process.platform==="win32"?"parcel.cmd":"parcel"
);
const tmpDir=path.join(rootDir,".parcel-tmp");

fs.mkdirSync(tmpDir,{
    recursive: true
});

function readEnvFile(filePath){
    const fileEnv={};

    if(!fs.existsSync(filePath)){
        return fileEnv;
    }

    fs.readFileSync(filePath,"utf8").split(/\r?\n/).forEach(line=>{
        const cleanLine=line.trim();
        if(!cleanLine || cleanLine.startsWith("#")){
            return;
        }

        const equalIndex=cleanLine.indexOf("=");
        if(equalIndex===-1){
            return;
        }

        const key=cleanLine.slice(0,equalIndex).trim();
        const value=cleanLine.slice(equalIndex+1).trim().replace(/^["']|["']$/g,"");

        if(key){
            fileEnv[key]=value;
        }
    });

    return fileEnv;
}

const env={
    ...readEnvFile(frontendEnvPath),
    ...process.env,
    TMPDIR: tmpDir,
    TMP: tmpDir,
    TEMP: tmpDir
};

env.AI_ENDPOINT=env.AI_ENDPOINT||env.BACKEND_AI_URL;
env.BACKEND_AI_URL=env.BACKEND_AI_URL||env.AI_ENDPOINT;

[
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "GEMINI_IMAGE_MODE",
    "GEMINI_IMAGE_MODEL",
    "GEMINI_TEXT_MODEL"
].forEach(key=>{
    delete env[key];
});

if(!env.AI_ENDPOINT){
    console.error("[build] Missing AI_ENDPOINT. Add it to frontend/.env or pass AI_ENDPOINT=https://your-backend-domain.com/api/realistic-photo npm run build");
    process.exit(1);
}

fs.mkdirSync(path.dirname(aiConfigPath),{
    recursive: true
});
fs.writeFileSync(
    aiConfigPath,
    `// Generated from frontend/.env by scripts/buildFrontend.js.\nexport const AI_ENDPOINT=${JSON.stringify(env.AI_ENDPOINT)};\n`
);

const child=spawn(parcelBin,[
    "build",
    "index.html",
    "--no-cache",
    "--public-url",
    "./",
    "--no-source-maps"
],{
    cwd: rootDir,
    env,
    stdio: "inherit"
});

child.on("exit",code=>{
    process.exit(code||0);
});

child.on("error",error=>{
    console.error(`[build] ${error.message}`);
    process.exit(1);
});
