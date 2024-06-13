import { Router } from "express";
import { any } from "zod";
// const writeXlsxFile = require('write-excel-file/node')
import writeXlsxFile from "write-excel-file/node";
import { Data } from "../data";
import { filterAndSearch } from "../data/filter";
import { PrismaClient } from "@prisma/client";
const xlsxFileDataHandler = Router();
import fs from "node:fs";
import { stringify } from "csv-stringify";
import path from "node:path";
import { requestForFullData } from "../data/fetcher";
import { rimraf } from "rimraf";

// await writeXlsxFile(objects, {
//   schema,
//   filePath: '/path/to/file.xlsx'
// })
const prisma = new PrismaClient();
const HEADER_ROW = [
  {
    value: "data-id",
    fontWeight: "bold",
  },
  {
    value: "Latitude",
    fontWeight: "bold",
  },
  {
    value: "Longitude",
    fontWeight: "bold",
  },
  {
    value: "Accuracy",
    fontWeight: "bold",
  },
  {
    value: "Land Cover Type",
    fontWeight: "bold",
  },
  {
    value: "Description",
    fontWeight: "bold",
  },
  {
    value: "Water Source",
    fontWeight: "bold",
  },
  {
    value: "Crop Growth Stage",
    fontWeight: "bold",
  },
  {
    value: "Crop Intensity",
    fontWeight: "bold",
  },
  // {
  //   value: "Livestock",
  //   fontWeight: "bold",
  // },
  {
    value: "Cropping Pattern",
    fontWeight: "bold",
  },
  {
    value: "Primary Crop",
    fontWeight: "bold",
  },
  {
    value: "Primary Season",
    fontWeight: "bold",
  },
  {
    value: "Remarks",
    fontWeight: "bold",
  },
  {
    value: "Secondary Crop",
    fontWeight: "bold",
  },
  {
    value: "Secondary Season",
    fontWeight: "bold",
  },
  {
    value: "Biomass Weight",
    fontWeight: "bold",
  },
  {
    value: "Cultivar",
    fontWeight: "bold",
  },
  {
    value: "Grain Weight",
    fontWeight: "bold",
  },
  {
    value: "Sample Size 1",
    fontWeight: "bold",
  },
  {
    value: "Sample Size 2",
    fontWeight: "bold",
  },
  {
    value: "Harvest Date",
    fontWeight: "bold",
  },
  {
    value: "Sow Date",
    fontWeight: "bold",
  },
  {
    value: "User Email",
    fontWeight: "bold",
  },
];

xlsxFileDataHandler.post("", async (req, res) => {
  try {
    const newResponse = await requestForFullData(req);
    const data = newResponse.data.map((value) => {
      const cropInfo =
        value.cropInformation.length > 0 ? value.cropInformation[0] : null;
      const cceData = value.CCEdata.length > 0 ? value.CCEdata[0] : null;

      return [
        { type: String, value: value.id.toString() || " " },
        { type: String, value: value.latitude.toString() || " " },
        { type: String, value: value.longitude.toString() || " " },
        { type: String, value: value.accuracy.toString() || " " },
        { type: String, value: value.landCover || "" },
        { type: String, value: value.description || "" },
        { type: String, value: cropInfo?.waterSource || "" },
        { type: String, value: cropInfo?.cropGrowthStage || "" },
        { type: String, value: cropInfo?.cropIntensity || "" },
        // { type: String, value: cropInfo?.livestock || "" },
        { type: String, value: cropInfo?.croppingPattern || "" },
        { type: String, value: cropInfo?.primaryCrop || "" },
        { type: String, value: cropInfo?.primarySeason || "" },
        { type: String, value: cropInfo?.remarks || "" },
        { type: String, value: cropInfo?.secondaryCrop || "" },
        { type: String, value: cropInfo?.secondarySeason || "" },
        { type: String, value: cceData?.biomassWeight.toString() || "" },
        { type: String, value: cceData?.cultivar || "" },
        { type: String, value: cceData?.grainWeight.toString() || "" },
        { type: String, value: cceData?.sampleSize_1.toString() || "" },
        { type: String, value: cceData?.sampleSize_2.toString() || "" },
        {
          type: Date || null,
          value: cceData?.harvestDate ? cceData?.harvestDate : "",
          format: "dd/mm/yy",
        },
        {
          type: Date || null,
          value: cceData?.sowDate ? cceData?.sowDate : "",
          format: "dd/mm/yy",
        },
        // { type: String, value: cceData?.dataId || "" },
        // { type: String, value: cceData?.id || "" },
        { type: String, value: value.user.email || "" },
      ];
    });
    const filename = crypto.randomUUID() + ".xlsx";

    // @ts-ignore
    const file = await writeXlsxFile([HEADER_ROW, ...data], {
      filePath: path.join(__dirname, filename),
    });

    const filePath = path.join(__dirname, filename); // Provide the path to your file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    const timerid = setInterval(() => {
      if (fileStream.closed) {
        rimraf.sync(path.join(__dirname, filename));
        clearInterval(timerid)
      }
    }, 3000);
  } catch (e) {
    res.json({
      message: "failed",
    });
    console.log(e);
  }
});

export default xlsxFileDataHandler;
