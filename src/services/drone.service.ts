import { DroneStatus, OrderStatus } from "@prisma/client";
import { UpdateHeartbeatDto } from "../dtos/drone.dto";
import { prisma } from "../config/database";

class DroneService {
  // List all drones (for Admin)
  async getAll(query: { status?: DroneStatus }) {
    return prisma.drone.findMany({
      where: query
    });
  }

  // Find a specific drone
  async getOneById(droneId: number) {
    const drone = await prisma.drone.findUnique({ where: { id: droneId } });
    if (!drone) throw new Error("Drone not found");
    return drone;
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

  // The "Rescue" Logic
  async reportBroken(droneId: number) {
    // 1. Fetch Drone
    const drone = await prisma.drone.findUnique({
      where: { id: droneId }
    });

    if (!drone) {
      throw new Error("Drone not found");
    }

    // 2. Find active order assigned to this drone
    const activeOrder = await prisma.order.findUnique({
      where: { droneId: droneId }
    });

    // 3. Update Drone Status
    await prisma.drone.update({
      where: { id: droneId },
      data: {
        status: DroneStatus.BROKEN,
        currentOrder: { disconnect: true }
      }
    });

    // 4. Rescue Order if exists
    if (activeOrder) {
      await prisma.order.update({
        where: { id: activeOrder.id },
        data: {
          status: OrderStatus.PENDING,
          droneId: null,
          // Origin becomes the broken drone's location
          origin: `${drone.lat},${drone.lng}`
        }
      });

      return {
        message: "Drone marked BROKEN. Order requeued from rescue location."
      };
    }

    return { message: "Drone marked BROKEN. No active order." };
  }
}

export default new DroneService();
