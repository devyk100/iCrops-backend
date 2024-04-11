import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const resolvers = {
  Query: {
    async data() {
      const pageNo = "1";
      const entries = "10";
      try {
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
        return response
      } catch (error) {
        console.log(error);
      }
    },
  },
};
export default resolvers;
