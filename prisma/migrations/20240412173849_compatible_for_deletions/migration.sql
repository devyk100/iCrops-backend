-- DropForeignKey
ALTER TABLE "CCE" DROP CONSTRAINT "CCE_dataId_fkey";

-- DropForeignKey
ALTER TABLE "CropInformation" DROP CONSTRAINT "CropInformation_dataId_fkey";

-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_dataId_fkey";

-- AlterTable
ALTER TABLE "CCE" ALTER COLUMN "dataId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CropInformation" ALTER COLUMN "dataId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Images" ALTER COLUMN "dataId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CropInformation" ADD CONSTRAINT "CropInformation_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CCE" ADD CONSTRAINT "CCE_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
