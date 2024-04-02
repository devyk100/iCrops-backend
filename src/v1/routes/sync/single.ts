import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { saveBase64File } from "../../fileIntercept";
const prisma = new PrismaClient();
const singleSyncRouter = Router();


const dataSchema = z.object({
    generalData: z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracyCorrection: z.number(),
        landCover: z.string(),
        locationDescription: z.string()
    }),
    cropInformation: z.object({
        waterSource: z.string(),
        cropIntensity: z.string(),
        primarySeason: z.string(),
        primaryCrop: z.string(),
        secondarySeason: z.string(),
        secondaryCrop: z.string(),
        livestock: z.string(),
        croppingPattern: z.string(),
        cropGrowthStage: z.string(),
        remarks: z.string()
    }),
    CCE: z.object({
        sampleSize1: z.number(),
        sampleSize2: z.number(),
        grainWeight: z.number(),
        biomassWeight: z.number(),
        cultivar: z.string(),
        sowDate: z.date(),
        harvestDate: z.date()
    }),
    noOfImages: z.number()
})

singleSyncRouter.post("/", (req, res) => {
    res.json({
        message: "succes",
        dataId: 1
    })
    console.log(req.body)
})

singleSyncRouter.post("/image", (req, res) => {
    const fileData = req.body.fileData;
    // also intercept the extension of the file
    const fileName = `${crypto.randomUUID()}.jpg`;
    saveBase64File(fileData, fileName)
    console.log(fileName, "dataid:", req.body.dataId)
    res.send("response received")
})

export default singleSyncRouter