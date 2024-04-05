import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import { sign, verify } from "jsonwebtoken";
const userRouter = Router();

const prisma = new PrismaClient();
const JWT_SECRET = "somethinghere";

// very important
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = async (
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
        },
      });
      console.log(response, "user found with that jwt");
      req.userId = id;
      next();
    } catch (e) {
      res.json({
        success: false,
      });
      console.log(e);
    }
};

userRouter.post("/signup", async (req, res) => {
  const body: {
    email: string;
    password: string;
    Designation: string;
    Institute: string;
    Province: string;
    Country: string;
    username: string;
  } = req.body;

  try {
    const response = await prisma.user.create({
      data: {
        Country: body.Country,
        Designation: body.Designation,
        email: body.email,
        Institute: body.Institute,
        password: body.password,
        Province: body.Province,
        admin: false,
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

userRouter.post("/login", async (req, res) => {
  const body: {
    email: string;
    password: string;
  } = req.body;
  try {
    const response = await prisma.user.findUniqueOrThrow({
      where: {
        email: body.email,
        password: body.password,
      },
    });
    const jwt = await sign({ id: response.id }, JWT_SECRET);
    res.send({ jwt, success: true, email: response.email });
  } catch (e) {
    console.log(e);
    res.send({ success: false });
  }
});
export default userRouter;
