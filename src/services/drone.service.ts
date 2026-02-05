import { PrismaClient } from "@prisma/client";
import { UpdateHeartbeatDto } from "../dtos/drone.dto";
const prisma = new PrismaClient();

class DroneService {
  // Update Location & Battery
  async updateHeartbeat(droneId: number, data: UpdateHeartbeatDto) {
    return prisma.drone.update({
      where: { id: droneId },
      data
    });
  }

  // List all drones (for Admin)
  async findAll() {
    return prisma.drone.findMany();
  }
}

export default new DroneService();
