import express from "express";

import initialVersionRouter from "./v1/routes/index.js";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import https from "node:https"
import fs from "node:fs"
import path from "node:path"
import gql from "graphql-tag";
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { expressMiddleware } from '@apollo/server/express4';
import resolvers from "./graphql/resolvers.js";
import { readFileSync } from "fs";
const prisma = new PrismaClient();
const app = express()

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://dit2dtt5nci8z.cloudfront.net/  ');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });
const __dirname = new URL('.', import.meta.url).pathname;
const typeDefs = gql(
  readFileSync(path.join(__dirname, "..","schema.graphql"), {
    encoding: "utf-8",
  })
);

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
await server.start();


app.use(cors())
app.use(express.json({
  limit: "50mb"
}))

app.use(
  '/graphql',

  expressMiddleware(server),
);



app.use("/api/v1", initialVersionRouter);

app.get("/",(req, res) => {
  console.log("it works")
  res.send("hello")
})

app.listen(8080, () => {
  console.log("listening on port 8080");
})
