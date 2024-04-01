import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

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
    })
})

singleSyncRouter.post("/", (req, res) => {
    
})


export default singleSyncRouter