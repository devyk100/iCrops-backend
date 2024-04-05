import express from "express";

import initialVersionRouter from "./v1/routes";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
const prisma = new PrismaClient();
const app = express()
app.use(cors())
app.use(express.json({
  limit: "50mb"
}))
app.use("/api/v1", initialVersionRouter);

app.get("/",(req, res) => {
  console.log("it works")
  res.send("hello")
})

app.listen(3001, () => {
  console.log("listening on port 3000");
})

// async function clear(){
//   await prisma.data.delete({
//     where: {
//       id: 1