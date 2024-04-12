import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { adminAuthMiddleware } from "../admin";
import { filterAndSearch } from "./filter";

const prisma = new PrismaClient();
const dataRouter = Router();
interface imgType {
  id: number;
  fileName: string;
  dataId: number;
}

export interface cropInfo {
  waterSource: string;
  cropGrowthStage: string;
  cropIntensity: string;
  livestock: string;
  croppingPattern: string;
  primaryCrop: string;
  primarySeason: string;
  remarks: string;
  secondaryCrop: string;
  secondarySeason: string;
}

export interface CCEType {
  biomassWeight: string;
  cultivar: string;
  grainWeight: string;
  dataId: number;
  harvestDate: Date;
  id: number;
  sampleSize_1: number;
  sampleSize_2: number;
  sowDate: Date;
}
type Data = {
  latitude: number;
  longitude: number;
  accuracy: number;
  landCover: string;
  description: string;
  cropInformation: cropInfo[];
  CCEdata: CCEType[];
  user: {
    email: string;
  };
  images: imgType[];
};
dataRouter.post("", adminAuthMiddleware, async (req, res) => {
  const body: {
    pageNo: string;
    entries: string;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    landCover: string | null;
    description: string | null;
    email: string | null;
    sampleSize_1: number | null;
    sampleSize_2: number | null;
    biomassWeight: number | null;
    cultivar: string | null;
    sowDate: string | null;
    harvestDate: string | null;
    waterSource: string | null;
    cropIntensity: string | null;
    primarySeason: string | null;
    primaryCrop: string | null;
    secondarySeason: string | null;
    secondaryCrop: string | null;
    livestock: string | null;
    croppingPattern: string | null;
    cropGrowthStage: string | null;
    remarks: string | null;
  } = req.body;

  const pageNo = body.pageNo;
  const entries = body.entries;
  console.log("Latitude was sent as ", body.latitude);
  try {
    const response = await prisma.data.findMany({
      skip: (parseInt(pageNo) - 1) * parseInt(entries),
      take: parseInt(entries),
      include: {
        cropInformation: {
          take: 10,
        },
        CCEdata: {
          take: 10,
        },
        images: {
          take: 10,
        },
        user: {
          include: {
            _count: true,
          },
        },
      },
    });
    const newResponse = response.filter((value) => {
      return (
        filterAndSearch(body.latitude, value.latitude) &&
        filterAndSearch(body.longitude, value.longitude) &&
        filterAndSearch(body.accuracy, value.accuracy) &&
        filterAndSearch(body.landCover, value.landCover) &&
        filterAndSearch(body.description, value.description) &&
        filterAndSearch(body.email, value.user.email) &&
        filterAndSearch(body.sampleSize_1, value.CCEdata[0]?.sampleSize_1) &&
        filterAndSearch(body.sampleSize_2, value.CCEdata[0]?.sampleSize_2) &&
        filterAndSearch(body.biomassWeight, value.CCEdata[0]?.biomassWeight) &&
        filterAndSearch(body.cultivar, value.CCEdata[0]?.cultivar) &&
        filterAndSearch(body.sowDate, value.CCEdata[0]?.sowDate) &&
        filterAndSearch(body.harvestDate, value.CCEdata[0]?.harvestDate) &&
        filterAndSearch(
          body.waterSource,
          value.cropInformation[0]?.waterSource
        ) &&
        filterAndSearch(
          body.cropIntensity,
          value.cropInformation[0]?.cropIntensity
        ) &&
        filterAndSearch(
          body.primarySeason,
          value.cropInformation[0]?.primarySeason
        ) &&
        filterAndSearch(
          body.primaryCrop,
          value.cropInformation[0]?.primaryCrop
        ) &&
        filterAndSearch(
          body.secondarySeason,
          value.cropInformation[0]?.secondarySeason
        ) &&
        filterAndSearch(
          body.secondaryCrop,
          value.cropInformation[0]?.secondaryCrop
        ) &&
        filterAndSearch(body.livestock, value.cropInformation[0]?.livestock) &&
        filterAndSearch(
          body.croppingPattern,
          value.cropInformation[0]?.croppingPattern
        ) &&
        filterAndSearch(
          body.cropGrowthStage,
          value.cropInformation[0]?.cropGrowthStage
        ) &&
        filterAndSearch(body.remarks, value.cropInformation[0]?.remarks)
      );
    });
    const count = await prisma.data.count();
    console.log(count, 'is the count')
    res.json({response: newResponse, count:count});
    // res.json(newResponse);
  } catch (error) {
    res.json({ message: "Failed" });
    console.log(error);
  }
});



dataRouter.post("/deletemany", adminAuthMiddleware, async (req, res) => {
  const body: {
    dataId: number[]
  } = req.body;
  const dataIdArr = body.dataId
  console.log(dataIdArr, "is the arraay we got")
  try{

    const response = await prisma.$transaction(async (pr) => {
      for(let a of dataIdArr){
        await pr.data.deleteMany({
          where: {
            id: a
          }
        })
        await pr.images.deleteMany({
          where: {
            dataId: a
          }
        })
        await pr.cCE.deleteMany({
          where: {
            dataId: a
          }
        })
        await pr.cropInformation.deleteMany({
          where: {
            dataId: a
          }
        })
      }
      
    })
    res.json({"message": "okay"})
  }
  catch(e){
    res.send("error")
    console.log(e)
  }
  })
  
  dataRouter.post("/deleteAll", adminAuthMiddleware, async (req, res) => {
    const response = await prisma.data.deleteMany({});
    const response1 = await prisma.cCE.deleteMany({});
  const response2 = await prisma.cropInformation.deleteMany({});
  const response3 = await prisma.images.deleteMany({});
})

// dataRouter.post("/cce/:id", async (req, res) => {
//     console.log(req.params.id)
// })

dataRouter.post("/:id", adminAuthMiddleware, async (req, res) => {
  console.log(req.params.id);
  let id = parseInt(req.params.id);
  if (!id) {
    id = 16;
  }
  try {
    const response = await prisma.data.findFirst({
      // take:10,
      where: {
        id: id,
      },
      include: {
        cropInformation: {
          take: 10,
        },
        CCEdata: {
          take: 10,
        },
        images: {
          take: 10,
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    const count = await prisma.data.count();
    console.log(count, 'is the count')
    res.json({...response, count:count});
  } catch (error) {
    res.json({
      message: "failed",
    });
    console.log(error);
  }
});

dataRouter.get("/", async (req, res) => {
  res.send("hello");
});

dataRouter.get("/image/:filename", (req, res) => {
  try {
    const imagePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "savedImages",
      req.params.filename
    );
    // const image = fs.readFileSync(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    res.json({ message: "failed" });
    console.log(error);
  }
});


export default dataRouter;
