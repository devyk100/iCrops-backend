import express from "express";

import initialVersionRouter from "./v1/routes";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import https from "node:https"
import fs from "node:fs"
import path from "node:path"
const prisma = new PrismaClient();
const app = express()

const sslServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, "..", "cert", 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, "..", "cert", 'cert.pem'))
},

app)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://dit2dtt5nci8z.cloudfront.net/  ');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(cors())
app.use(express.json({
  limit: "50mb"
}))
app.use("/api/v1", initialVersionRouter);

app.get("/",(req, res) => {
  console.log("it works")
  res.send("hello")
})

sslServer.listen(3001, () => {
  console.log("listening on port 3000");
})

// async function clear(){
//   await prisma.data.delete({
//     where: {
//       id: 1