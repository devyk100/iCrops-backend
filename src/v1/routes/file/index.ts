import { Router } from "express";
import { adminAuthMiddleware } from "../admin";
import { filterAndSearch } from "../data/filter";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import { stringify } from "csv-stringify";
import path from "node:path";
import xlsxFileDataHandler from "./xlsx";
import { requestForFullData } from "../data/fetcher";
import shpFileRouter from "./shp";
const fileDataRouter = Router();
const prisma = new PrismaClient();
const columns: string[] = [
  "data-id",
    "Latitude",
    "Longitude",
    "Accuracy",
    "Land Cover",
    "Description",
    "Email",
    "Water Source",
    "Crop Intensity",
    "Primary Season",
    "Primary Crop",
    "Secondary Season",
    "Secondary Crop",
    "Livestock",
    "Cropping Pattern",
    "Crop Growth Stage",
    "Remarks",
    "Sample Size 1",
    "Sample Size 2",
    "Biomass Weight",
    "Cultivar",
    "Sow Date",
    "Harvest Date",
];


fileDataRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const filename = crypto.randomUUID();
  console.log(req.body, " is the whole body though")
  fs.open(path.join(__dirname, filename + ".csv"), "w", (error) => {
    console.log(error);
  });
  const writableStream = fs.createWriteStream(path.join(__dirname, filename+".csv"));
  const stringifier = stringify({ header: true, columns: columns });
  try {
    const newResponse = await requestForFullData(req)

    // const count = await prisma.data.count();
    // console.log(count, 'is the count')
    // res.json({response: newResponse, count:count});
    // res.json(newResponse);
    for(let a of newResponse.data){
        let row = {
          "data-id":a.id.toString(),
            "Latitude":a.latitude.toString(),
            "Longitude":a.longitude.toString(),
            "Accuracy":a.accuracy.toString(),
            "Land Cover":a.landCover,
            "Description":a.description,
            "Email":a.user.email,
            "Sample Size 1":a.CCEdata[0]?.sampleSize_1,
            "Sample Size 2":a.CCEdata[0]?.sampleSize_1,
            "Biomass Weight":a.CCEdata[0]?.biomassWeight,
            "Cultivar":a.CCEdata[0]?.cultivar,
            "Sow Date":a.CCEdata[0]?.sowDate.toDateString(),
            "Harvest Date":a.CCEdata[0]?.harvestDate.toDateString(),
            "Water Source":a.cropInformation[0]?.waterSource,
            "Crop Intensity":a.cropInformation[0]?.cropIntensity,
            "Primary Season":a.cropInformation[0]?.primarySeason,
            "Primary Crop":a.cropInformation[0]?.primaryCrop,
            "Secondary Season":a.cropInformation[0]?.secondarySeason,
            "Secondary Crop":a.cropInformation[0]?.secondaryCrop,
            "Livestock":a.cropInformation[0]?.livestock,
            "Cropping Pattern":a.cropInformation[0]?.croppingPattern,
            "Crop Growth Stage":a.cropInformation[0]?.cropGrowthStage,
            "Remarks" :a.cropInformation[0]?.remarks  
        }
        stringifier.write(row);
    }
    stringifier.pipe(writableStream);
    const filePath = path.join(__dirname, filename+".csv"); // Provide the path to your file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

    setTimeout(() => {
        fs.unlinkSync(path.join(__dirname, filename+".csv"));
    }, 60000)
  } catch (error) {
    res.json({ message: "Failed" });
    console.log(error);
  }
  finally{
    // fs.unlinkSync(path.join(__dirname, filename+".csv"));
  }
});


fileDataRouter.use("/xlsx", xlsxFileDataHandler)

fileDataRouter.use("/shp", shpFileRouter);

export default fileDataRouter;
