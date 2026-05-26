const aiService=require("./ai.service");

const createRealisticPhoto=async(req,res,next)=>{
    try{
        const result=await aiService.generateFromSketch(req.body||{});
        res.status(200).json(result);
    }
    catch(error){
        next(error);
    }
};

module.exports={
    createRealisticPhoto
};
