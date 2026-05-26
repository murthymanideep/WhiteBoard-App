const express=require("express");
const aiRoutes=require("../modules/ai/ai.routes");
const healthRoutes=require("../modules/health/health.routes");

const router=express.Router();

router.use(healthRoutes);
router.use("/api",aiRoutes);

module.exports=router;
