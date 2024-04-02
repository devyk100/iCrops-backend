import express from "express";

import initialVersionRouter from "./v1/routes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express()
app.use(express.json())
app.use("/api/v1", initialVersionRouter);

app.get("/",(req, res) => {
  console.log("it works")
  res.send("hello")
})

app.listen(3000, () => {
  console.log("listening on port 3000");
})

// async function clear(){
//   await prisma.data.delete({
//     where: {
//       id: 1
//     }
//   })
// }
// clear()