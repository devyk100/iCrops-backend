import { Router } from "express";
import { singleSyncRouter } from "./sync";
import dataRouter from "./data";

const initialVersionRouter = Router();

initialVersionRouter.get("/", (req, res) => {
    console.log("v1 router")
    res.send("from v1")
})

initialVersionRouter.use("/sync", singleSyncRouter);
initialVersionRouter.use("/data", dataRouter);


export default initialVersionRouter