/*
  Warnings:

  - Added the required column `complete` to the `Integrity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Integrity" ADD COLUMN     "complete" BOOLEAN NOT NULL;
