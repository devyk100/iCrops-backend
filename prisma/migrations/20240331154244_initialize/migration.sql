-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "Designation" TEXT NOT NULL,
    "Institute" TEXT NOT NULL,
    "Province" TEXT NOT NULL,
    "Country" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Data" (
    "id" SERIAL NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "accuracy" DECIMAL(65,30) NOT NULL,
    "landCover" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropInformation" (
    "id" SERIAL NOT NULL,
    "waterSource" TEXT NOT NULL,
    "cropIntensity" TEXT NOT NULL,
    "primarySeason" TEXT NOT NULL,
    "primaryCrop" TEXT NOT NULL,
    "secondarySeason" TEXT NOT NULL,
    "secondaryCrop" TEXT NOT NULL,
    "livestock" TEXT NOT NULL,
    "croppingPattern" TEXT NOT NULL,
    "cropGrowthStage" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "dataId" INTEGER NOT NULL,

    CONSTRAINT "CropInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CCE" (
    "id" SERIAL NOT NULL,
    "sampleSize_1" INTEGER NOT NULL,
    "sampleSize_2" INTEGER NOT NULL,
    "grainWeight" INTEGER NOT NULL,
    "biomassWeight" INTEGER NOT NULL,
    "cultivar" TEXT NOT NULL,
    "sowDate" TIMESTAMP(3) NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "dataId" INTEGER NOT NULL,

    CONSTRAINT "CCE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Images" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "dataId" INTEGER NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CropInformation" ADD CONSTRAINT "CropInformation_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CCE" ADD CONSTRAINT "CCE_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
