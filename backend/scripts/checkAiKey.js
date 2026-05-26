const config=require("../src/config/env");

const tinyPng="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABBAEAgh6FOQAAAABJRU5ErkJggg==";

const readError=(text)=>{
    try{
        const data=JSON.parse(text);
        return data?.error?.message||data?.error||data?.message||"";
    }
    catch{
        return text;
    }
};

const inspect=async(name,responsePromise)=>{
    const response=await responsePromise;
    const text=await response.text();
    const error=readError(text);

    console.log(`${name}: ${response.status}${response.ok?" - OK":error?` - ${error}`:""}`);

    return {
        ok: response.ok,
        status: response.status,
        error
    };
};

const makeVisionBody=(prompt)=>{
    return {
        contents: [{
            role: "user",
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: "image/png",
                        data: tinyPng
                    }
                }
            ]
        }]
    };
};

const makeImageBody=(prompt)=>{
    return {
        contents: [{
            role: "user",
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: "image/png",
                        data: tinyPng
                    }
                }
            ]
        }],
        generationConfig: {
            responseModalities: ["TEXT","IMAGE"]
        }
    };
};

const main=async()=>{
    if(!config.gemini.apiKey){
        console.log("GEMINI_API_KEY is missing in backend/.env");
        process.exit(1);
    }

    console.log(`Key shape: ${config.gemini.apiKey.slice(0,4)}... (${config.gemini.apiKey.length} chars)`);
    console.log(`Gemini model: ${config.gemini.textModel}`);
    console.log(`Gemini image model: ${config.gemini.imageModel}`);
    console.log(`Gemini API URL: ${config.gemini.apiUrl}`);

    const visionResult=await inspect("Gemini vision request",fetch(`${config.gemini.apiUrl}/models/${config.gemini.textModel}:generateContent`,{
        method: "POST",
        headers: {
            "x-goog-api-key": config.gemini.apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(makeVisionBody("Reply with OK."))
    }));

    if(!visionResult.ok){
        process.exit(1);
    }

    const imageResult=await inspect("Gemini image generation request",fetch(`${config.gemini.apiUrl}/models/${config.gemini.imageModel}:generateContent`,{
        method: "POST",
        headers: {
            "x-goog-api-key": config.gemini.apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(makeImageBody("Generate a neat colorful image of a simple house."))
    }));

    if(!imageResult.ok){
        process.exit(1);
    }
};

main().catch(error=>{
    console.error(error.message);
    process.exit(1);
});
