import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { saveBase64File } from "../../fileIntercept";
import { authMiddleware } from "../user";
import { setGPSMetadata } from "./imageMetaDataSetter";
import fs from "fs";
import { Transactions } from "../../transaction/transaction";
const prisma = new PrismaClient();
const singleSyncRouter = Router();

Transactions.getInstance();

const DeleteTimeout = 60 * 1000; // MILLISECONDS - minute

function isImagePresent(imagePath: string, directoryPath: string) {
  const fullPath = directoryPath + '/' + imagePath;
  return fs.existsSync(fullPath);
}



singleSyncRouter.post("/", authMiddleware, async (req, res) => {
  try {
    console.log(req.body);
    const body = req.body;
    console.log("THE DATA IS", body);
    let success = true;
    let result;
    // do some checks if the data is integral or not.
    if (req.userId) result = Transactions.getInstance().insertData(body, req.userId);
    console.log(result)
    if (result?.dataId) Transactions.getInstance().destructAndClean(result?.dataId);
    res.json({
      message: "succes",
      success: true,
      dataId: result?.dataId,
    });
  } catch (e) {
    console.log("error", e);
    res.json({
      success: false,
    });
  }
});

singleSyncRouter.post("/image", authMiddleware, async (req, res) => {
  try {
    const fileData = req.body.fileData;
    // also intercept the extension of the file
    // console.log("SAVED THE IMAGE CHECK POINT 1", fileData);
    const fileName = `${crypto.randomUUID()}.jpg`;
    if (!Transactions.getInstance().ifDataExists(req.body.dataId)) {
      throw Error();
    }
    const dataId = req.body.dataId;
    const result = Transactions.getInstance()?.latitudeAndLongitude(dataId);
    const latitude = result?.latitude;
    const longitude = result?.longitude;
    saveBase64File(fileData, fileName, latitude, longitude);
    Transactions.getInstance()?.syncImageUpdate(dataId, fileName);
    console.log(fileName, "dataid:", req.body.dataId);
    console.log("SAVED THE IMAGE CHECK POINT 2")
    console.log("THE DATAID", req.body.dataId)
    Transactions.getInstance()?.checkAndPush(dataId);
    console.log("SAVED THE IMAGE CHECK POINT 3");
    // const latitude: number = data?.latitude.toNumber();
    // setGPSMetadata(fileName, data?.latitude.toNumber(), data?.longitude.toNumber());
    res.json({
      success: true,
    });
    console.log("IMAGE RESPONSE WAS ", true)
  } catch (e) {
    console.log("NOT SAVED THE IMAGE CHECK POINT 4");
    console.log(e);
    res.json({
      success: false,
    });
  }
});

singleSyncRouter.post("/synced/", authMiddleware, async (req, res) => {
  console.log("helloweas")
  try {
    const userId = req.userId;
    const response = await prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    const response2 = await prisma.data.findMany({
      where: {
        userId: userId
      }
    })
    console.log("SYNCED Data request it is ", response?.synced);
    res.json({
      synced: response?.synced,
      success: true
    })
  }
  catch (error) {
    console.log(error, " IS THE ERROR")
  }
})

export default singleSyncRouter;
