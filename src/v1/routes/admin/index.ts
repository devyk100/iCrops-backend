import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import pkg from "jsonwebtoken";
import { JWT_SECRET } from "../user";
const { sign, verify } = pkg;
const adminRouter = Router()
// @ts-ignore
const ADMIN_SECRET:string = process.env.ADMIN_SECRET;
const prisma = new PrismaClient()

declare global {
    namespace Express {
      interface Request {
        adminId?: number;
      }
    }
  }

export const adminAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader: string | undefined = req.headers.authorization;
    const jwt = authHeader?.split(" ")[1];
    if (jwt)
      try {
        const data = await verify(jwt, JWT_SECRET);
        // @ts-ignore
        const id = data.id;
        console.log(data, "user id");
        // next();
        const response = await prisma.user.findUniqueOrThrow({
          where: {
            id: id,
            admin: true
          },
        });
        console.log(response, "admin found with that jwt");
        req.adminId = id;
        next();
      } catch (e) {
        res.json({
          success: false,
        });
        console.log(e);
      }
  };

adminRouter.post("/login", async (req, res) => {
    const body: {
        email: string;
        password: string;
      } = req.body;
      try {
        const response = await prisma.user.findUniqueOrThrow({
          where: {
            email: body.email,
            password: body.password,
            admin: true
          },
        });
        console.log(response, " FROM THE DB");
        const jwt = await sign({ id: response.id }, JWT_SECRET);
        res.send({ jwt, success: true, email: response.email });
      } catch (e) {
        console.log(e);
        res.send({ success: false });
      }
})

adminRouter.post("/signup", async (req, res) => {
    const body: {
      email: string;
      password: string;
      Designation: string;
      Institute: string;
      Province: string;
      Country: string;
      username: string;
      secret: string;
    } = req.body;
  
    try {
      if(body.secret != ADMIN_SECRET) throw Error();
      const response = await prisma.user.create({
        data: {
          Country: body.Country,
          Designation: body.Designation,
          email: body.email,
          Institute: body.Institute,
          password: body.password,
          Province: body.Province,
          admin: true,
          synced: 0
        },
      });
      console.log(response);
      res.json({
        success: true,
      });
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
      });
    }
  });


export default adminRouter;