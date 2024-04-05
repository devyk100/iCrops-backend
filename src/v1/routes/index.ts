import { Router } from "express";
import { singleSyncRouter } from "./sync";
import dataRouter from "./data";
import userRouter from "./user";

const initialVersionRouter = Router();

initialVersionRouter.get("/", (req, res) => {
    console.log("v1 router")
    res.send("from v1")
})

initialVersionRouter.use("/sync", singleSyncRouter);
initialVersionRouter.use("/data", dataRouter);
initialVersionRouter.use("/user", userRouter);

export default initialVersionRouter