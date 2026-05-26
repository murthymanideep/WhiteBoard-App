const app=require("./app");
const config=require("./config/env");

app.listen(config.port,config.host,()=>{
    console.log(`Backend server running at http://${config.host}:${config.port}`);
});
