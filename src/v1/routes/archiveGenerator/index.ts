import { Request, Response, Router } from "express";
import AdmZip from "adm-zip";
// var AdmZip = require("adm-zip");
import path from "node:path";
import { filterAndSearch } from "../data/filter";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import { stringify } from "csv-stringify";
import { exec } from "node:child_process";
import { xlsxGenerator } from "./xlsx";
import { requestForFullData } from "../data/fetcher";
const archiveRouter = Router();

const prisma = new PrismaClient();

const csvGenerator = async (newResponse: any, zipFolderName: string) => {
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
//   let newResponse = await requestForData(req);
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


enum Mode{
    csv,
    xlsx
}

const archiveMaker = async (req: Request, res: Response, mode: Mode) => {
    const newResponse = await requestForFullData(req);
    const zipFolderName = crypto.randomUUID();
    const zipFileName = zipFolderName + ".zip";
    fs.mkdirSync(path.join(__dirname, zipFolderName));
    var zip = new AdmZip("", {
      readEntries: true,
    });
    let csvfilename = "";
    let xlsxfilename = "";
    if(mode == Mode.csv) csvfilename = await csvGenerator(newResponse, zipFolderName);
    else if(mode == Mode.xlsx) xlsxfilename = await xlsxGenerator(newResponse, zipFolderName);
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

    exec(
      `cd ${path.join(
        __dirname,
        zipFolderName
      )} && zip -r ${zipFileName} . && cd ..`,
      function (err, stdout, stderr) {
        console.log(err, stdout, stderr);
        const filePath = path.join(__dirname, zipFolderName, zipFileName);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        if(err) res.send("Failed to convert to zip")
        setTimeout(() => {
          console.log("deleted "+zipFolderName)
          fs.rmSync(path.join(__dirname, zipFolderName), {
            recursive: true,
            force: true
          });
        }, 200000);
      }
    );
}


archiveRouter.post("/", async (req, res) => {
    await archiveMaker(req, res, Mode.csv);
});

archiveRouter.post("/xlsx", async (req, res) => {
    await archiveMaker(req, res, Mode.xlsx);
})


export default archiveRouter;
