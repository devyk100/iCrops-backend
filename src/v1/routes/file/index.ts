import { Router } from "express";
import { adminAuthMiddleware } from "../admin";
import { filterAndSearch } from "../data/filter";
import { PrismaClient } from "@prisma/client";

const fileDataRouter = Router()
const prisma = new PrismaClient()
fileDataRouter.post("/", adminAuthMiddleware, async (req, res) => {
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
        // const count = await prisma.data.count();
        // console.log(count, 'is the count')
        // res.json({response: newResponse, count:count});
        // res.json(newResponse);
      } catch (error) {
        res.json({ message: "Failed" });
        console.log(error);
      }
})

export default fileDataRouter;