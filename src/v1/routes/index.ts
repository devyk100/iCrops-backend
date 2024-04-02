import { Router } from "express";
import { singleSyncRouter } from "./sync";

const initialVersionRouter = Router();

initialVersionRouter.get("/", (req, res) => {
    console.log("v1 router")
    res.send("from v1")
})

initialVersionRouter.use("/sync", singleSyncRouter);

export default initialVersionRouter