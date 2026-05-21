import { useState } from "react";
import { FiDownload,FiX } from "react-icons/fi";
import { RiImageAiFill } from "react-icons/ri";
import { buildAiSketchRequest,createRealisticPhoto } from "../utils/aiClient";

const AiPanel=({canvasRef,onApplyImage,onClose})=>{
    const [prompt,setPrompt]=useState("");
    const [isLoading,setIsLoading]=useState(false);
    const [result,setResult]=useState(null);
    const [error,setError]=useState("");
    const [imageWidth,setImageWidth]=useState(420);
    const [imageRatio,setImageRatio]=useState(1);
    const [lastPrompt,setLastPrompt]=useState("");
    const [lastSketch,setLastSketch]=useState("");

    const generatePhoto=async()=>{
        const cleanPrompt=prompt.trim();
        if(!cleanPrompt){
            setError("Enter a prompt for Gemini.");
            return;
        }

        setIsLoading(true);
        setError("");
        setResult(null);

        try{
            const request=buildAiSketchRequest(canvasRef.current,cleanPrompt);

            if(!request.hasInk){
                throw new Error("Draw something on the board first.");
            }

            setLastPrompt(request.prompt);
            setLastSketch(request.imageDataUrl);

            const data=await createRealisticPhoto(request);
            setResult(data);
            setLastPrompt(data.sentPrompt||data.prompt||request.prompt);
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setIsLoading(false);
        }
    };

    const downloadImage=()=>{
        if(!result?.imageDataUrl){
            return;
        }

        const link=document.createElement("a");
        link.href=result.imageDataUrl;
        link.download=result.imageDataUrl.startsWith("data:image/svg+xml")?"ai-image.svg":"ai-image.png";
        link.click();
    };

    const continueDrawing=()=>{
        if(!result?.imageDataUrl){
            return;
        }

        onApplyImage({
            src: result.imageDataUrl,
            width: imageWidth,
            ratio: imageRatio
        });
    };

    return (
        <div className="fixed right-6 top-1/2 z-30 flex max-h-[calc(100vh-48px)] w-[340px] -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                    <RiImageAiFill size={18}/>
                    <h2 className="text-sm font-semibold">AI Photo</h2>
                </div>

                {result?.mode && (
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                        {result.modelName||"Sketch guided"}
                    </span>
                )}

                <button
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-gray-100 active:scale-95"
                    onClick={onClose}
                    title="Close"
                >
                    <FiX size={16}/>
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600" htmlFor="ai-prompt">
                    Prompt
                </label>
                <textarea
                    id="ai-prompt"
                    className="min-h-24 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-5 text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    placeholder="Enter Prompt"
                    value={prompt}
                    onChange={(event)=>setPrompt(event.target.value)}
                    disabled={isLoading}
                />
            </div>

            <button
                className="h-10 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-300"
                onClick={generatePhoto}
                disabled={isLoading || !prompt.trim()}
            >
                {isLoading?"Generating...":"Generate Photo"}
            </button>

            {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600">
                    {error}
                </p>
            )}

            {lastPrompt && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">Prompt sent</p>
                        <span className="text-[10px] text-gray-400">
                            {isLoading?"Sending now":"Last request"}
                        </span>
                    </div>
                    <p className="max-h-28 overflow-y-auto text-[11px] leading-5 text-gray-500">
                        {lastPrompt}
                    </p>
                </div>
            )}

            {lastSketch && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">Sketch sent</p>
                        <span className="text-[10px] text-gray-400">
                            {isLoading?"Uploading":"Reference"}
                        </span>
                    </div>
                    <img
                        src={lastSketch}
                        alt="Sketch sent to AI"
                        className="h-28 w-full rounded-md border border-gray-200 bg-white object-contain"
                    />
                </div>
            )}

            {result?.imageDataUrl && (
                <div className="flex flex-col gap-3">
                    <img
                        src={result.imageDataUrl}
                        alt={result.title||"Generated AI photo"}
                        className="h-52 w-full rounded-lg border border-gray-200 bg-gray-50 object-contain"
                        onLoad={(event)=>{
                            const image=event.currentTarget;
                            if(image.naturalWidth && image.naturalHeight){
                                setImageRatio(image.naturalWidth/image.naturalHeight);
                            }
                        }}
                    />

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">Board size</p>
                            <span className="text-[11px] text-gray-500">{imageWidth}px</span>
                        </div>
                        <input
                            type="range"
                            min="180"
                            max="900"
                            step="20"
                            value={imageWidth}
                            onChange={(event)=>setImageWidth(Number(event.target.value))}
                            className="accent-blue-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 active:scale-95"
                            onClick={downloadImage}
                        >
                            <FiDownload size={15}/>
                            Download
                        </button>

                        <button
                            className="h-10 flex-1 rounded-lg bg-blue-500 px-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95"
                            onClick={continueDrawing}
                        >
                            Continue Drawing
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiPanel;
