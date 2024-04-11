import { Router } from "express";
import { singleSyncRouter } from "./sync/index.js";
import dataRouter from "./data/index.js";
import userRouter from "./user/index.js";
import adminRouter from "./admin/index.js";

const initialVersionRouter = Router();

initialVersionRouter.get("/", (req, res) => {
    console.log("v1 router")
    res.send("from v1")
})

initialVersionRouter.use("/sync", singleSyncRouter);
initialVersionRouter.use("/data", dataRouter);
initialVersionRouter.use("/admin", adminRouter)
initialVersionRouter.use("/user", userRouter);

export default initialVersionRouter