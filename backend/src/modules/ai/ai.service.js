const config=require("../../config/env");

const parseImageDataUrl=(imageDataUrl)=>{
    const match=/^data:(image\/(?:png|jpeg|jpg|webp));base64,([\s\S]+)$/.exec(imageDataUrl||"");
    if(!match){
        const error=new Error("Send a PNG, JPEG, or WEBP data URL.");
        error.statusCode=400;
        throw error;
    }

    const mimeType=match[1]==="image/jpg"?"image/jpeg":match[1];
    const data=match[2].replace(/\s/g,"");

    return {
        mimeType,
        data
    };
};

const getPrompt=(prompt)=>{
    const cleanPrompt=String(prompt||"").trim();
    if(!cleanPrompt){
        const error=new Error("Prompt is required.");
        error.statusCode=400;
        throw error;
    }

    return cleanPrompt;
};

const getGeminiErrorMessage=(data,text)=>{
    return data?.error?.message||data?.error||data?.message||text||"Gemini request failed.";
};

const isGeminiAuthProblem=(message)=>{
    return /api key not valid|API_KEY_INVALID|permission denied|unauthenticated|forbidden|credential/i.test(message);
};

const hasQuotaProblem=(message,statusCode)=>{
    return statusCode===429 || /quota|429|RESOURCE_EXHAUSTED|rate limit/i.test(message);
};

const formatGeminiError=(message,statusCode,model)=>{
    if(isGeminiAuthProblem(message)){
        return [
            `Gemini rejected the API key${model?` for ${model}`:""} in backend/.env or your deployed environment variables.`,
            "Add GEMINI_API_KEY from Google AI Studio, then restart the backend."
        ].join(" ");
    }

    if(hasQuotaProblem(message,statusCode)){
        return [
            `Gemini quota or rate limit was reached${model?` for ${model}`:""}.`,
            "Check your Google AI Studio billing and quota, then try again."
        ].join(" ");
    }

    return message;
};

const createGeminiError=(message,statusCode,model)=>{
    const error=new Error(formatGeminiError(message,statusCode,model));
    error.statusCode=statusCode||400;
    error.isAuthProblem=isGeminiAuthProblem(message);
    return error;
};

const postGemini=async(model,parts,generationConfig)=>{
    if(!config.gemini.apiKey){
        const error=new Error([
            "Gemini image generation needs a Google AI Studio API key.",
            "Add GEMINI_API_KEY to backend/.env or your deployed environment variables."
        ].join(" "));
        error.statusCode=401;
        throw error;
    }

    const response=await fetch(`${config.gemini.apiUrl}/models/${model}:generateContent`,{
        method: "POST",
        headers: {
            "x-goog-api-key": config.gemini.apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                role: "user",
                parts
            }],
            ...(generationConfig?{ generationConfig }:{})
        })
    });

    const text=await response.text().catch(()=>"");
    let data=null;

    try{
        data=text?JSON.parse(text):null;
    }
    catch{
        data=null;
    }

    if(!response.ok){
        throw createGeminiError(getGeminiErrorMessage(data,text),response.status,model);
    }

    return data;
};

const getResponseParts=(data)=>{
    return data?.candidates?.flatMap(candidate=>candidate?.content?.parts||[])||[];
};

const findInlineImage=(data)=>{
    return getResponseParts(data).find(part=>{
        return part?.inlineData?.data || part?.inline_data?.data;
    });
};

const makeImagePart=(image)=>{
    return {
        inline_data: {
            mime_type: image.mimeType,
            data: image.data
        }
    };
};

const generateNativeImage=async(image,prompt)=>{
    const data=await postGemini(config.gemini.imageModel,[
        { text: prompt },
        makeImagePart(image)
    ],{
        responseModalities: ["TEXT","IMAGE"]
    });

    const imagePart=findInlineImage(data);
    const inlineData=imagePart?.inlineData||imagePart?.inline_data;

    if(!inlineData?.data){
        throw new Error("Gemini returned text only. No image was generated.");
    }

    return {
        title: "AI Image",
        imageDataUrl: `data:${inlineData.mimeType||inlineData.mime_type||"image/png"};base64,${inlineData.data}`,
        prompt,
        mode: "gemini-native",
        model: config.gemini.imageModel,
        modelName: "Gemini Image"
    };
};

const generateFromSketch=async(payload)=>{
    const image=parseImageDataUrl(payload.imageDataUrl);
    const prompt=getPrompt(payload.prompt);

    return generateNativeImage(image,prompt);
};

module.exports={
    generateFromSketch
};