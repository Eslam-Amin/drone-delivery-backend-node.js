import { Drone, DroneStatus, Order, OrderStatus, Prisma } from "@prisma/client";
import {
  CreateDroneDto,
  UpdateDroneDto,
  UpdateHeartbeatDto
} from "../dtos/drone.dto";
import { prisma } from "../config/database";

type GrabOrderResult =
  | { ok: false; message: string }
  | { ok: true; order: Order };

class DroneService {
  // Create a drone (for Admin)
  async createOne(data: CreateDroneDto) {
    return prisma.drone.create({ data });
  }

  // List all drones (for Admin)
  async getAll(query: { status?: DroneStatus }) {
    return prisma.drone.findMany({
      where: query
    });
  }

  // Find a specific drone
  async getOneById(droneId: number, options?: any): Promise<Drone> {
    const drone = await prisma.drone.findUnique({
      where: { id: droneId },
      ...options
    });
    if (!drone) throw new Error("Drone not found");
    return drone;
  }

  async updateOneById(droneId: number, dto: UpdateDroneDto) {
    const drone = await this.getOneById(droneId);
    if (dto.status === DroneStatus.BROKEN) {
      if (drone.status === DroneStatus.BROKEN)
        throw new Error("Drone is already reported as broken");
      return this.reportBroken(droneId);
    }

    const data: Prisma.DroneUpdateInput = {
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.battery !== undefined && { battery: dto.battery }),
      ...(dto.lat !== undefined && { lat: dto.lat }),
      ...(dto.lng !== undefined && { lng: dto.lng })
    };

    return prisma.drone.update({
      where: { id: droneId },
      data
    });
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
      where: { status: OrderStatus.PENDING, onTheWay: false },
      orderBy: { createdAt: "asc" } // earliest orders first
    });

    if (!order) throw new Error("No pending jobs available");

    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.IN_PROGRESS }
    });

    // Assign it
    return prisma.drone.update({
      where: { id: droneId },
      data: {
        status: DroneStatus.RESERVED,
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
    const droneStatus = drone?.status;
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
          origin: `${drone.lat},${drone.lng}`,
          onTheWay: droneStatus === DroneStatus.DELIVERING // if it was delivering, it's on the way
        }
      });

      return {
        message: "Drone marked BROKEN. Order requeued from rescue location."
      };
    }

    return { message: "Drone marked BROKEN. No active order." };
  }

  async grabOrder(droneId: number): Promise<GrabOrderResult> {
    const drone = await this.getOneById(droneId);
    if (drone.status === DroneStatus.RESERVED) {
      return this.grabOrderFromOrigin(droneId);
    } else if (drone.status === DroneStatus.IDLE) {
      return this.grabOrderFromBrokenDrone(droneId);
    }
    return { ok: false, message: "Drone is not available" };
  }

  private async grabOrderFromBrokenDrone(
    droneId: number
  ): Promise<GrabOrderResult> {
    const brokenDroneOrder = await prisma.order.findFirst({
      where: { status: OrderStatus.PENDING, onTheWay: true },
      include: { drone: true },
      orderBy: { createdAt: "asc" }
    });

    if (!brokenDroneOrder)
      return { ok: false, message: "No pending jobs available" };
    const { id: orderId } = brokenDroneOrder;
    await prisma.drone.update({
      where: { id: droneId },
      data: {
        status: DroneStatus.DELIVERING,
        lat: parseFloat(brokenDroneOrder.origin.split(",")[0]!),
        lng: parseFloat(brokenDroneOrder.origin.split(",")[1]!),
        currentOrder: { connect: { id: orderId } }
      }
    });
    return {
      order: await prisma.order.update({
        where: { id: orderId },
        data: { droneId, status: OrderStatus.IN_PROGRESS, onTheWay: true }
      }),
      ok: true
    };
  }

  private async grabOrderFromOrigin(droneId: number): Promise<GrabOrderResult> {
    const drone = await prisma.drone.findUnique({
      where: { id: droneId },
      include: { currentOrder: true }
    });
    if (drone && drone.currentOrder) {
      const orderId = drone.currentOrder.id;
      await prisma.drone.update({
        where: { id: droneId },
        data: {
          status: DroneStatus.DELIVERING,
          currentOrder: { connect: { id: orderId } },
          lat: parseFloat(drone.currentOrder.origin.split(",")[0]!),
          lng: parseFloat(drone.currentOrder.origin.split(",")[1]!)
        }
      });

      return {
        ok: true,
        order: await prisma.order.update({
          where: { id: orderId },
          data: {
            droneId: drone.id,
            status: OrderStatus.IN_PROGRESS,
            onTheWay: true
          }
        })
      };
    }
    return { ok: false, message: "No order to grab" };
  }
}

export default new DroneService();
