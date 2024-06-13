import express from "express";

import initialVersionRouter from "./v1/routes";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import https from "node:https"
import fs from "node:fs"
import path from "node:path"
import { readFileSync } from "fs";
import bodyParser from "body-parser";
const prisma = new PrismaClient();
const app = express()

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://dit2dtt5nci8z.cloudfront.net/  ');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.use(cors())



app.use("/api/v1", initialVersionRouter);

app.get("/", (req, res) => {
  console.log("it works")
  res.send("hello")
})

const server = app.listen(8090, () => {
  console.log("listening on port 8090");
  server.setTimeout(60000)
})
