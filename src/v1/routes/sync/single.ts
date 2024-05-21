import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { saveBase64File } from "../../fileIntercept";
import { authMiddleware } from "../user";
import { setGPSMetadata } from "./imageMetaDataSetter";
const prisma = new PrismaClient();
const singleSyncRouter = Router();

const DeleteTimeout = 60 *  1000; // MILLISECONDS - 1 Hour

setInterval(async () => {
    const response = await prisma.integrity.findMany({});
    for(let a of response){
      const timeAdded = a.timeAdded;
      const timeNow = new Date();
      const diff = timeNow.getTime() - timeAdded.getTime();
      if(a.complete){
        await prisma.integrity.delete({where:{id: a.id}})
      }
      else if(a.complete == false && diff >= DeleteTimeout){
        await prisma.images.deleteMany(
          {where: {
            dataId: a.dataId
          }}
        )
        await prisma.cCE.deleteMany({
          where: {
            dataId: a.dataId
          }
        })
        await prisma.cropInformation.deleteMany({
          where:{ 
            dataId: a.dataId
          }
        })
        await prisma.integrity.deleteMany({
          where:{
            dataId: a.dataId
          }
        })
        await prisma.data.deleteMany({
          where: {
            id: a.dataId
          }
        })
      }
    }
},  DeleteTimeout * 6)


singleSyncRouter.post("/", authMiddleware, async (req, res) => {
  try {
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
    if (req.body.landCoverType == "Cropland") {
      const cropInformation = req.body.cropInformation;
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
              id: result.id,
            },
          },
        },
      });
    }
    if (req.body.CCE.isCaptured) {
      const CCEData = req.body.CCE;
      await prisma.cCE.create({
        data: {
          biomassWeight: parseInt(CCEData.biomassWeight),
          cultivar: CCEData.cultivar,
          sowDate: new Date(CCEData.sowDate),
          grainWeight: parseInt(CCEData.grainWeight),
          harvestDate: new Date(CCEData.harvestDate),
          sampleSize_1: parseInt(CCEData.sampleSize1),
          sampleSize_2: parseInt(CCEData.sampleSize2),
          data: {
            connect: {
              id: result.id,
            },
          },
        },
      });
    }
    console.log(result);

    const timerId = setTimeout(async () => {
      const res = await prisma.integrity.findFirst({
        where: {
          dataId: result.id
        }
      })
      if(res?.complete){
        await prisma.integrity.deleteMany({
          where: {
            dataId: result.id
          }
        })
      }
      else{
        await prisma.integrity.deleteMany({
          where: {
            dataId: result.id
          }
        })

        await prisma.cCE.deleteMany({
          where: {
            dataId: result.id
          }
        })
        await prisma.cropInformation.deleteMany({
          where: {
            dataId: result.id
          }
        })
        await prisma.images.deleteMany({
          where: {
            dataId: result.id
          }
        })
        await prisma.data.delete({
          where: {
            id: result.id
          }
        })
      }
    }, DeleteTimeout)
    console.log(timerId, "IS THE TIMERID")
    const response = await prisma.integrity.create({
      data:{
        timeAdded: new Date(),
        timerId: 0,
        dataId: result.id,
        complete: false
      }
    })

    res.json({
      message: "succes",
      success: true,
      dataId: result.id,
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
    const data = await prisma.data.findFirst({
      where:{
        id: req.body.dataId
      }
    })
    saveBase64File(fileData, fileName, data?.latitude.toNumber(), data?.longitude.toNumber());
    console.log(fileName, "dataid:", req.body.dataId);
    console.log("SAVED THE IMAGE CHECK POINT 2")
    console.log("THE DATAID", req.body.dataId)
    const imageResult = await prisma.images.create({
      data: {
        fileName: fileName,
        data: {
          connect: {
            id: req.body.dataId,
          },
        },
      },
    });
    console.log("SAVED THE IMAGE CHECK POINT 3");
    // const latitude: number = data?.latitude.toNumber();
    // setGPSMetadata(fileName, data?.latitude.toNumber(), data?.longitude.toNumber());
    res.json({
      success: true,
    });
  } catch (e) {
    console.log("NOT SAVED THE IMAGE CHECK POINT 4");
    console.log(e);
    res.json({
      success: false,
    });
  }
});

singleSyncRouter.post("/complete", async (req, res) => {
  try{
    const dataId = req.body.dataId;
    const response = await prisma.integrity.updateMany({
      where: {
        dataId: dataId
      },
      data: {
        complete: true
      }
    })
    res.json({
      success: true
    })
    return;
  }
  catch(error){
    res.json({
      success: false
    })
  }
})

export default singleSyncRouter;
