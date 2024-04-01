import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function insertingSomethings() {
  // await prisma.user.create({
  //     // where:{
  //     //     // id: 1,
  //     //     username: "something",
  //     // },
  //     data:{
  //         Country: "India",
  //         Designation: "Student",
  //         Institute: "Institute",
  //         password: "something",
  //         username: "something",
  //         Province: "Telengana",
  //         email: "something@gmail.com"
  //     }
  // })
  // await prisma.data.create({
  //     data: {
  //         accuracy: 5.99992,
  //         latitude: 17.888888888823,
  //         longitude: 13.12222240943,
  //         description: "somethings have happened and this is a description",
  //         landCover: "Barren",
  //         userId: 2
  //     }
  // })
  // await prisma.cCE.create({
  //     data:{
  //         biomassWeight: 10,
  //         cultivar: "crop123",
  //         grainWeight: 12,
  //         harvestDate: new Date(),
  //         sampleSize_1: 10,
  //         sampleSize_2: 12,
  //         sowDate: new Date(),
  //         dataId: 1
  //     }
  // })
//   await prisma.images.createMany({
//     data: [
//       {
//         fileName: "/something/someRandomFilename.jpg",
//         dataId: 1,
//       },
//       {
//         fileName: "/something/someRandomFilename2.jpg",
//         dataId: 1,
//       },
//     ],
//   });
await prisma.cropInformation.create({
    data: {
        waterSource: "Rainfed",
        cropIntensity: "Single",
        primaryCrop: 'PigeonPea',
        secondaryCrop: "Wheat",
        livestock: "Buffaloes",
        croppingPattern: "Mixed",
        primarySeason: "Kharif",
        secondarySeason: "Meher",
        cropGrowthStage: "Vegetative",
        remarks:"some remarks here",
        dataId: 1
    }
})
}

insertingSomethings();
