import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class DroneService {
  // List all drones (for Admin)
  async findAll() {
    return prisma.drone.findMany();
  }
}

export default new DroneService();
