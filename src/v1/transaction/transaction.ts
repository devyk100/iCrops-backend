import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

interface TransactionTypeFace {
    userId: number; // it is from random
    data: DataType;
    images: {
        imgList: string[],
        syncCount: number,
        totalImages: number,
    };
}

interface DataType {
    capturedFromMaps: boolean;
    latitude: number;
    longitude: number;
    accuracyCorrection: number;
    bearingToCenter: number;
    distanceToCenter: number[],
    landCoverType: string,
    cropInformation: {
        isCaptured: boolean,
        waterSource: string,
        cropIntensity: string,
        primarySeason: { seasonName: string, cropName: string },
        secondarySeason: { seasonName: string, cropName: string },
        // liveStock: string,
        croppingPattern: string,
        cropGrowthStage: string,
        remarks: string
    },
    CCE: {
        isCaptured: boolean,
        isGoingToBeCaptured: boolean,
        sampleSize: number,
        grainWeight: string
        biomassWeight: string,
        cultivar: string,
        sowDate: Date,
        harvestDate: Date,
        sampleSize1: string,
        sampleSize2: string
    },
    images: string[]
    locationDesc: null | string,
    noOfImages: number
}

export class Transactions {
    private static instance: Transactions;
    private dataRecords: Record<string, TransactionTypeFace>;
    private constructor() {
        this.dataRecords = {}
    }
    static getInstance() {
        console.log("hello")
        if (!Transactions.instance) {
            Transactions.instance = new Transactions();
            return Transactions.instance;
        }
        else return Transactions.instance;
    }

    ifDataExists(dataId: string): boolean {
        if (this.dataRecords[dataId].data) {
            return true;
        }
        return false;
    }

    latitudeAndLongitude(dataId: string): {
        latitude: number;
        longitude: number;
    } {
        return {
            latitude: this.dataRecords[dataId].data.latitude,
            longitude: this.dataRecords[dataId].data.longitude
        }
    }

    insertData(data: DataType, userId: number): { dataId: string } {
        const dataId = crypto.randomUUID();
        this.dataRecords[dataId] = {
            data: data,
            images: {
                imgList: [],
                syncCount: 0,
                totalImages: data.images.length
            },
            userId: userId
        };
        this.dataRecords[dataId]
        console.log("data id is", dataId)
        return { dataId };
    }

    syncImageUpdate(dataId: number, imgName: string) {
        this.dataRecords[dataId].images.syncCount++;
        this.dataRecords[dataId].images.imgList.push(imgName)
    }

    async checkAndPush(dataId: number) {
        if (this.dataRecords[dataId].images.syncCount != this.dataRecords[dataId].images.totalImages) return;
        // this.dataRecords[dataId] //-> push this to db now
        const body = this.dataRecords[dataId].data
        if (body) {
            if (body.latitude != null && body.longitude != null && body.accuracyCorrection != null && body.landCoverType != null) {
                if (body.landCoverType == "Cropland") {
                    if (body.cropInformation.cropGrowthStage != null && body.cropInformation.cropIntensity != null && body.cropInformation.croppingPattern != null && body.cropInformation.isCaptured != null &&
                        // body.cropInformation.liveStock != null && 
                        body.cropInformation.primarySeason.cropName != null && body.cropInformation.primarySeason.seasonName != null && body.cropInformation.secondarySeason.cropName != null && body.cropInformation.secondarySeason.seasonName != null) {
                        console.log("hello", "NO ERRPR")
                    }
                    else return;
                    if (body.CCE.isCaptured) {
                        if (body.CCE.biomassWeight != null && body.CCE.cultivar != null && body.CCE.grainWeight != null && body.CCE.harvestDate != null && body.CCE.sampleSize1 != null && body.CCE.sampleSize2 != null && body.CCE.sowDate != null) { }
                        else return;
                    }
                }
                if (body.images.length > 0) { }
                else return;
            }
            else return;
        }
        else return;

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
                    connect: { id: this.dataRecords[dataId].userId },
                },
            },
        });
        if (body.landCoverType == "Cropland") {
            const cropInformation = body.cropInformation;
            await prisma.cropInformation.create({
                data: {
                    cropGrowthStage: cropInformation.cropGrowthStage,
                    cropIntensity: cropInformation.cropIntensity,
                    croppingPattern: cropInformation.croppingPattern,
                    livestock: "cropInformation.liveStock",
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
        if (body.CCE.isCaptured) {
            const CCEData = body.CCE;
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
        for (let fileName of this.dataRecords[dataId].images.imgList) {
            const imageResult = await prisma.images.create({
                data: {
                    fileName: fileName,
                    data: {
                        connect: {
                            id: result.id,
                        },
                    },
                },
            });
        }
        console.log(result);
        const response = await prisma.integrity.create({
            data: {
                timeAdded: new Date(),
                timerId: 0,
                dataId: result.id,
                complete: false
            }
        })


        //destruct itself now
        delete this.dataRecords[dataId];
    }

    destructAndClean(dataId: string) {
        setTimeout(async () => {
            if (!this.dataRecords[dataId]) return;
            if (this.dataRecords[dataId].images.syncCount == this.dataRecords[dataId].images.totalImages) return;
            else {
                console.log("deletion fired");

                for (let a of this.dataRecords[dataId].images.imgList) {
                    // delete the images of a name
                    fs.unlinkSync(path.join(__dirname, "..", "..", "..", "savedImages", a));
                    fs.unlinkSync(path.join(__dirname, "..", "..", "..", "savedImages", a + "_original"));
                    console.log(a, "deleted");
                }
                delete this.dataRecords[dataId];
            }
        }, 720000);
    }

};
