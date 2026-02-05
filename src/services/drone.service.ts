import { PrismaClient, DroneStatus, OrderStatus } from "@prisma/client";
import { UpdateHeartbeatDto } from "../dtos/drone.dto";
const prisma = new PrismaClient();

class DroneService {
  // List all drones (for Admin)
  async findAll() {
    return prisma.drone.findMany();
  }
  // Update Location & Battery
  async updateHeartbeat(droneId: number, data: UpdateHeartbeatDto) {
    return prisma.drone.update({
      where: { id: droneId },
      data
    });
  }

  // Drone "Grabs" an order
  async reserveJob(droneId: number) {
    // Find a PENDING order
    const order = await prisma.order.findFirst({
      where: { status: OrderStatus.PENDING },
      orderBy: { createdAt: "asc" } // earliest orders first
    });

    if (!order) throw new Error("No pending jobs available");

    // Assign it
    return prisma.drone.update({
      where: { id: droneId },
      data: {
        status: DroneStatus.DELIVERING,
        currentOrder: { connect: { id: order.id } }
      },
      include: { currentOrder: true }
    });
  }
}

export default new DroneService();
