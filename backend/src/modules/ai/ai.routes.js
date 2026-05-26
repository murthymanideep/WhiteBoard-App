const express=require("express");
const aiController=require("./ai.controller");

const router=express.Router();

router.post("/realistic-photo",aiController.createRealisticPhoto);

module.exports=router;
