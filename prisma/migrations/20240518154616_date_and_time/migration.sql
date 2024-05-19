/*
  Warnings:

  - You are about to drop the column `timeLeft` on the `Integrity` table. All the data in the column will be lost.
  - Added the required column `timeAdded` to the `Integrity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Integrity" DROP COLUMN "timeLeft",
ADD COLUMN     "timeAdded" TIMESTAMP(3) NOT NULL;
