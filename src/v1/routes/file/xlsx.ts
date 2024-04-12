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

// await writeXlsxFile(objects, {
//   schema,
//   filePath: '/path/to/file.xlsx'
// })
const prisma = new PrismaClient();
const HEADER_ROW = [
    {
      value: 'Latitude',
      fontWeight: 'bold'
    },
    {
      value: 'Longitude',
      fontWeight: 'bold'
    },
    {
      value: 'Accuracy',
      fontWeight: 'bold'
    },
    {
      value: 'Land Cover Type',
      fontWeight: 'bold'
    },
    {
      value: 'Description',
      fontWeight: 'bold'
    },
    {
      value: 'Water Source',
      fontWeight: 'bold'
    },
    {
      value: 'Crop Growth Stage',
      fontWeight: 'bold'
    },
    {
      value: 'Crop Intensity',
      fontWeight: 'bold'
    },
    {
      value: 'Livestock',
      fontWeight: 'bold'
    },
    {
      value: 'Cropping Pattern',
      fontWeight: 'bold'
    },
    {
      value: 'Primary Crop',
      fontWeight: 'bold'
    },
    {
      value: 'Primary Season',
      fontWeight: 'bold'
    },
    {
      value: 'Remarks',
      fontWeight: 'bold'
    },
    {
      value: 'Secondary Crop',
      fontWeight: 'bold'
    },
    {
      value: 'Secondary Season',
      fontWeight: 'bold'
    },
    {
      value: 'Biomass Weight',
      fontWeight: 'bold'
    },
    {
      value: 'Cultivar',
      fontWeight: 'bold'
    },
    {
      value: 'Grain Weight',
      fontWeight: 'bold'
    },
    {
      value: 'Sample Size 1',
      fontWeight: 'bold'
    },
    {
      value: 'Sample Size 2',
      fontWeight: 'bold'
    },
    {
      value: 'Harvest Date',
      fontWeight: 'bold'
    },
    {
      value: 'Sow Date',
      fontWeight: 'bold'
    },
    {
      value: 'User Email',
      fontWeight: 'bold'
    },
  ];
  

xlsxFileDataHandler.post("", async (req, res) => {


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
    const data = newResponse.map((value) => {
        const cropInfo = value.cropInformation.length > 0 ? value.cropInformation[0] : null;
        const cceData = value.CCEdata.length > 0 ? value.CCEdata[0] : null;
    
        return ([
            { type: String, value: value.latitude.toString() || " " },
            { type: String, value: value.longitude.toString() || " " },
            { type: String, value: value.accuracy.toString() || " " },
            { type: String, value: value.landCover || "" },
            { type: String, value: value.description || "" },
            { type: String, value: cropInfo?.waterSource || "" },
            { type: String, value: cropInfo?.cropGrowthStage || "" },
            { type: String, value: cropInfo?.cropIntensity || "" },
            { type: String, value: cropInfo?.livestock || "" },
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
            { type: Date || null, value: cceData?.harvestDate ? cceData?.harvestDate : "" , format: "dd/mm/yy"},
            { type: Date || null, value: cceData?.sowDate ? cceData?.sowDate : "" , format: "dd/mm/yy"},
            // { type: String, value: cceData?.dataId || "" },
            // { type: String, value: cceData?.id || "" },
            { type: String, value: value.user.email || "" },
        ]);
    });
    const filename = crypto.randomUUID()+".xlsx";
    
    // @ts-ignore
    const file = await writeXlsxFile([HEADER_ROW,...data], {
      filePath: path.join(__dirname, filename),
    });

    const filePath = path.join(__dirname, filename); // Provide the path to your file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

    setTimeout(() => {
        fs.unlinkSync(path.join(__dirname, filename));
    }, 60000)
  } catch (e) {
    res.json({
      message: "failed",
    });
    console.log(e)
  }
});

export default xlsxFileDataHandler;
