import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
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

const resolvers = {
  Query: {
    async data() {
      const pageNo = "1";
      const entries = "50";
      try {
        const response: any = await prisma.data.findMany({
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
        // let newResponse;
        // // if(response.cropInformation){
        // //     newResponse = {
        // //       ...response,
        // //       cropInformation: response.cropInformation[0],
        // //     };
        // // }
        console.log(response);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    async getData(
      _,
      {
        latitude,
        longitude,
        accuracy,
        landCover,
        description,
        email,
        sampleSize_1,
        sampleSize_2,
        biomassWeight,
        cultivar,
        sowDate,
        harvestDate,
        waterSource,
        cropIntensity,
        primarySeason,
        primaryCrop,
        secondarySeason,
        secondaryCrop,
        livestock,
        croppingPattern,
        cropGrowthStage,
        remarks,
      }: {
        latitude: Number;
        longitude: Number;
        accuracy: Number;
        landCover: String;
        description: String;
        email: String;
        sampleSize_1: Number;
        sampleSize_2: Number;
        biomassWeight: Number;
        cultivar: String;
        sowDate: String;
        harvestDate: String;
        waterSource: String;
        cropIntensity: String;
        primarySeason: String;
        primaryCrop: String;
        secondarySeason: String;
        secondaryCrop: String;
        livestock: String;
        croppingPattern: String;
        cropGrowthStage: String;
        remarks: String;
      }
    ) {
      const pageNo = "1";
      const entries = "50";
      let response: any = await prisma.data.findMany({
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
      // let newResponse = response.filter((value) => {

      // })

      return response;
    },
  },
};
export default resolvers;
