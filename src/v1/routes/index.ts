import { Router } from "express";
import { singleSyncRouter } from "./sync";
import dataRouter from "./data";
import userRouter from "./user";
import adminRouter from "./admin";
import fileDataRouter from "./file";
import archiveRouter from "./archiveGenerator";

const initialVersionRouter = Router();

initialVersionRouter.get("/", (req, res) => {
    console.log("v1 router")
    res.send("from v1")
})

initialVersionRouter.use("/sync", singleSyncRouter);
initialVersionRouter.use('/file-data', fileDataRouter);
initialVersionRouter.use('/archive-data', archiveRouter);
initialVersionRouter.use("/data", dataRouter);
initialVersionRouter.use("/admin", adminRouter)
initialVersionRouter.use("/user", userRouter);

export default initialVersionRouter