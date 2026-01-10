const createElement=(type)=>{
    if(type==="line"){
        return {
            id:Date.now(),
            type:"line",
            x1:10,
            y1:10,
            x2:100,
            y2:100
        };
    }

    if(type==="rect"){
        return {
            id:Date.now(),
            type:"rect",
            x:20,
            y:20,
            width:160,
            height:100
        };
    }
};

export default createElement;
