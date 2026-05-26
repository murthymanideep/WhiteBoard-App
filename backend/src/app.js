const express=require("express");
const cors=require("cors");
const config=require("./config/env");
const routes=require("./routes");
const notFound=require("./middleware/notFound");
const errorHandler=require("./middleware/errorHandler");

const app=express();

app.set("trust proxy",1);

const isOriginAllowed=(origin)=>{
    return config.frontendUrls.includes(origin);
};

app.use(cors({
    origin: (origin,callback)=>{
        if(!origin || isOriginAllowed(origin)){
            callback(null,true);
            return;
        }

        const error=new Error("This origin is not allowed to use the API.");
        error.statusCode=403;
        callback(error);
    }
}));
app.use(express.json({
    limit: config.bodyLimit
}));

app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports=app;
