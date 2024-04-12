import { Request, Router } from "express";
import AdmZip from "adm-zip";
// var AdmZip = require("adm-zip");
import path from "node:path";
import { filterAndSearch } from "../data/filter";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import { stringify } from "csv-stringify";
import { exec } from "node:child_process";
const archiveRouter = Router();

const prisma = new PrismaClient();

const csvGenerator = async (req: Request, zipFolderName: string) => {
  const filename = crypto.randomUUID();
  const columns: string[] = [
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
  const writableStream = fs.createWriteStream(
    path.join(__dirname, zipFolderName, filename + ".csv")
  );
  const stringifier = stringify({ header: true, columns: columns });
  let newResponse = await requestForData(req);
  for (let a of newResponse.data) {
    let row = {
      Latitude: a.latitude.toString(),
      Longitude: a.longitude.toString(),
      Accuracy: a.accuracy.toString(),
      "Land Cover": a.landCover,
      Description: a.description,
      Email: a.user.email,
      "Sample Size 1": a.CCEdata[0]?.sampleSize_1,
      "Sample Size 2": a.CCEdata[0]?.sampleSize_1,
      "Biomass Weight": a.CCEdata[0]?.biomassWeight,
      Cultivar: a.CCEdata[0]?.cultivar,
      "Sow Date": a.CCEdata[0]?.sowDate.toDateString(),
      "Harvest Date": a.CCEdata[0]?.harvestDate.toDateString(),
      "Water Source": a.cropInformation[0]?.waterSource,
      "Crop Intensity": a.cropInformation[0]?.cropIntensity,
      "Primary Season": a.cropInformation[0]?.primarySeason,
      "Primary Crop": a.cropInformation[0]?.primaryCrop,
      "Secondary Season": a.cropInformation[0]?.secondarySeason,
      "Secondary Crop": a.cropInformation[0]?.secondaryCrop,
      Livestock: a.cropInformation[0]?.livestock,
      "Cropping Pattern": a.cropInformation[0]?.croppingPattern,
      "Crop Growth Stage": a.cropInformation[0]?.cropGrowthStage,
      Remarks: a.cropInformation[0]?.remarks,
    };
    stringifier.write(row);
  }
  await stringifier.pipe(writableStream);
  return filename + ".csv";
};

const requestForData = async (req: Request) => {
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
    console.log(count, "is the count");
    return {
      data: newResponse,
      count: count,
    };
  } catch (e) {
    console.log(e);
    return {
      data: [],
    };
  }
};

archiveRouter.post("/", async (req, res) => {
  const newResponse = await requestForData(req);
  const zipFolderName = crypto.randomUUID();
  const zipFileName = zipFolderName + ".zip";
  fs.mkdirSync(path.join(__dirname, zipFolderName));
  var zip = new AdmZip("", {
    readEntries: true,
  });
  const csvfilename = await csvGenerator(req, zipFolderName);
  // fs.copyFileSync(path.join(__dirname, csvfilename), path.join(__dirname, zipFolderName, csvfilename));
  for (let value of newResponse.data) {
    if (value.images.length > 0)
      fs.mkdirSync(
        path.join(__dirname, zipFolderName, `data-entry-${value.id}`)
      );
    for (let imageFileName of value.images) {
      fs.copyFileSync(
        path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "savedImages",
          imageFileName.fileName
        ),
        path.join(
          __dirname,
          zipFolderName,
          `data-entry-${imageFileName.dataId}`,
          `data-${imageFileName.dataId}-image-${imageFileName.id}.jpg`
        )
      );
    }
  }
  // //   const bufferData = fs.readFileSync(path.join(__dirname, csvfilename))
  //   zip.addLocalFolder(path.join(__dirname, zipFolderName));
  //   zip.writeZip(path.join(__dirname, zipFileName));
  exec(
    `cd ${path.join(
      __dirname,
      zipFolderName
    )} && zip -r ${zipFileName} . && cd ..`,
    function (err, stdout, stderr) {
      console.log(err, stdout, stderr);
      const filePath = path.join(__dirname, zipFolderName, zipFileName); // Provide the path to your file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      if(err) res.send("Failed to convert to zip")
      setTimeout(() => {
        console.log("deleted "+zipFolderName)
        fs.rmdirSync(path.join(__dirname, zipFolderName));
      }, 200000);
    }
  );
});

export default archiveRouter;
