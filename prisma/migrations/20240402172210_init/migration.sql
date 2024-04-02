/*
  Warnings:

  - Added the required column `imageCount` to the `Data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Data" ADD COLUMN     "imageCount" INTEGER NOT NULL;
