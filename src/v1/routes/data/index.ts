import { Router } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()
const dataRouter = Router();

dataRouter.post("/", async (req, res) => {
    const response = await prisma.data.findMany({
        take: 10,
        include: {
            cropInformation: {
                take: 10
            },
            CCEdata: {
                take: 10
            },
            images: {
                take: 10
            },
            
        }
    });
    res.json(response)
})

dataRouter.post("/:id", async (req, res) => {
    console.log(req.params.id);
    const response = await prisma.data.findFirst({
        // take:10,
        where: {
            id: parseInt(req.params.id)
        },
        include: {
            cropInformation: {
                take: 10
            },
            CCEdata: {
                take: 10
            },
            images: {
                take: 10
            },
        }
    })

    res.json(response);
})

dataRouter.get("/", async (req, res) => {
    res.send("hello")
})


// dataRouter.post("/cce/:id", async (req, res) => {
//     console.log(req.params.id)
// })

export default dataRouter