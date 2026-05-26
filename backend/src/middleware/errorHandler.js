const errorHandler=(error,req,res,next)=>{
    if(res.headersSent){
        next(error);
        return;
    }

    res.status(error.statusCode||400).json({
        error: error.message||"Request failed."
    });
};

module.exports=errorHandler;
