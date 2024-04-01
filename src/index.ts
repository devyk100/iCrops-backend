import express from "express";

import initialVersionRouter from "./v1";

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

