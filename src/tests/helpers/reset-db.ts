import { prisma } from "../../config/database";

export const resetDB = async () => {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.drone.deleteMany(),
    prisma.user.deleteMany()
  ]);
};
export const disconnectDB = async () => await prisma.$disconnect();
export default prisma;
