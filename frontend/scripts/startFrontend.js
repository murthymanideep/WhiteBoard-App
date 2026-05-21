const { spawn }=require("node:child_process");
const fs=require("node:fs");
const net=require("node:net");
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

function getPort(value,fallback){
    const port=Number(value||fallback);
    return Number.isInteger(port) && port>0 ? port : fallback;
}

function readEnvFile(filePath){
    const env={};

    if(!fs.existsSync(filePath)){
        return env;
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
            env[key]=value;
        }
    });

    return env;
}

function getFrontendEnv(appPort){
    const env={
        ...readEnvFile(frontendEnvPath),
        ...process.env,
        APP_PORT: String(appPort),
        PORT: String(appPort)
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

    return env;
}

function writeAiConfig(env){
    fs.mkdirSync(path.dirname(aiConfigPath),{
        recursive: true
    });
    fs.writeFileSync(
        aiConfigPath,
        `// Generated from frontend/.env by scripts/startFrontend.js.\nexport const AI_ENDPOINT=${JSON.stringify(env.AI_ENDPOINT||"")};\n`
    );
}

const appHost=process.env.APP_HOST||"127.0.0.1";
const appStartPort=getPort(process.env.APP_PORT,1234);

function isPortAvailable(port,host){
    return new Promise(resolve=>{
        const tester=net.createServer()
            .once("error",()=>resolve(false))
            .once("listening",()=>{
                tester.close(()=>resolve(true));
            })
            .listen(port,host);
    });
}

async function findOpenPort(startPort,host){
    for(let port=startPort; port<startPort+50; port+=1){
        if(await isPortAvailable(port,host)){
            return port;
        }
    }

    throw new Error(`No open frontend port found from ${startPort} to ${startPort+49}.`);
}

async function start(){
    const appPort=await findOpenPort(appStartPort,appHost);
    const frontendEnv=getFrontendEnv(appPort);

    if(appPort!==appStartPort){
        console.log(`[frontend] Port ${appStartPort} is busy. Using frontend port ${appPort}.`);
    }

    if(!frontendEnv.AI_ENDPOINT){
        throw new Error("Missing AI_ENDPOINT. Add it to frontend/.env, for example AI_ENDPOINT=http://127.0.0.1:8787/api/realistic-photo");
    }

    writeAiConfig(frontendEnv);

    const child=spawn(parcelBin,[
        "index.html",
        "--no-cache",
        "--port",
        String(appPort),
        "--host",
        appHost
    ],{
        cwd: rootDir,
        env: frontendEnv,
        stdio: "inherit"
    });

    child.on("exit",code=>{
        process.exit(code||0);
    });

    child.on("error",error=>{
        console.error(`[frontend] ${error.message}`);
        process.exit(1);
    });
}

start().catch(error=>{
    console.error(`[frontend] ${error.message}`);
    process.exit(1);
});
