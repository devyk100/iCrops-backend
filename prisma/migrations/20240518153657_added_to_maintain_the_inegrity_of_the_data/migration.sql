-- CreateTable
CREATE TABLE "Integrity" (
    "id" SERIAL NOT NULL,
    "dataId" INTEGER NOT NULL,
    "timerId" INTEGER NOT NULL,
    "timeLeft" INTEGER NOT NULL,

    CONSTRAINT "Integrity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Integrity" ADD CONSTRAINT "Integrity_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
