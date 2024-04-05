import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { saveBase64File } from "../../fileIntercept";
import { authMiddleware } from "../user";
const prisma = new PrismaClient();
const singleSyncRouter = Router();

const dataSchema = z.object({
  generalData: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracyCorrection: z.number(),
    landCover: z.string(),
    locationDescription: z.string(),
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
    remarks: z.string(),
  }),
  CCE: z.object({
    sampleSize1: z.number(),
    sampleSize2: z.number(),
    grainWeight: z.number(),
    biomassWeight: z.number(),
    cultivar: z.string(),
    sowDate: z.date(),
    harvestDate: z.date(),
  }),
  noOfImages: z.number(),
});

singleSyncRouter.post("/", authMiddleware,async (req, res) => {
  console.log(req.body);
  const body = req.body;

  const result = await prisma.data.create({
    data: {
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracyCorrection,
      landCover: body.landCoverType,
      description: body.locationDesc || " ",
    //   userId: 2,
      imageCount: body.noOfImages,
      user: {
        connect: { id: req.userId },
      },
    },
  });
  if(req.body.landCoverType == "Cropland"){
    const cropInformation = req.body.cropInformation
    await prisma.cropInformation.create({
        data: {
            cropGrowthStage: cropInformation.cropGrowthStage,
            cropIntensity: cropInformation.cropIntensity,
            croppingPattern: cropInformation.croppingPattern,
            livestock: cropInformation.liveStock,
            primaryCrop: cropInformation.primarySeason.cropName,
            primarySeason: cropInformation.primarySeason.seasonName,
            remarks: cropInformation.remarks || " ",
            secondaryCrop: cropInformation.secondarySeason.cropName,
            secondarySeason: cropInformation.secondarySeason.seasonName,
            waterSource: cropInformation.waterSource,
            data: {
                connect: {
                    id: result.id
                }
            }
        }
    })
  }
  if(req.body.CCE.isCaptured){
    const CCEData = req.body.CCE;
    await prisma.cCE.create({
        data: {
            biomassWeight: parseInt(CCEData.biomassWeight),
            cultivar: CCEData.cultivar,
            sowDate: new Date(CCEData.sowDate),
            grainWeight:    parseInt(CCEData.grainWeight),
            harvestDate: new Date(CCEData.harvestDate),
            sampleSize_1: parseInt(CCEData.sampleSize1),
            sampleSize_2: parseInt(CCEData.sampleSize2),
            data: {
                connect: {
                    id: result.id
                }
            }
        }
    })
  }
  console.log(result);
  res.json({
    message: "succes",
    dataId: result.id,
  });
});

singleSyncRouter.post("/image", authMiddleware, async (req, res) => {
  const fileData = req.body.fileData;
  // also intercept the extension of the file
  const fileName = `${crypto.randomUUID()}.jpg`;
  saveBase64File(fileData, fileName);
  console.log(fileName, "dataid:", req.body.dataId);
  const imageResult = await prisma.images.create({
    data: {
        fileName: fileName,
        data: {
            connect: {
               id: req.body.dataId 
            }
        }
    }
  })
  res.send("response received");
});

export default singleSyncRouter;
