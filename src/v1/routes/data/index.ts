import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { adminAuthMiddleware } from "../admin";

const prisma = new PrismaClient();
const dataRouter = Router();

dataRouter.post("", adminAuthMiddleware, async (req, res) => {
  // @ts-ignore
  const query: {
    pageNo: string;
    entries: string;
  } = req.query;
  const pageNo = query.pageNo;
  const entries = query.entries;
  const response = await prisma.data.findMany({
    skip: (parseInt(pageNo) - 1) * parseInt(entries),
    take: parseInt(entries),
    include: {
      cropInformation: {
        take: 10,
      },
      CCEdata: {
        take: 10,
      },
      images: {
        take: 10,
      },
      user: {
        include: {
          _count: true,
        },
      },
    },
  });
  res.json(response);
});

dataRouter.post("/:id", adminAuthMiddleware, async (req, res) => {
  console.log(req.params.id);
  let id = parseInt(req.params.id);
  if (!id) {
    id = 16;
  }
  const response = await prisma.data.findFirst({
    // take:10,
    where: {
      id: id,
    },
    include: {
      cropInformation: {
        take: 10,
      },
      CCEdata: {
        take: 10,
      },
      images: {
        take: 10,
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  res.json(response);
});

dataRouter.get("/", async (req, res) => {
  res.send("hello");
});

dataRouter.get("/image/:filename", (req, res) => {
  const imagePath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "savedImages",
    req.params.filename
  );
  // const image = fs.readFileSync(imagePath);
  res.sendFile(imagePath);
});

// dataRouter.post("/cce/:id", async (req, res) => {
//     console.log(req.params.id)
// })

export default dataRouter;
