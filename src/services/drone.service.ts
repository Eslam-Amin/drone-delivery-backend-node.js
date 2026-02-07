import { Drone, DroneStatus, Order, OrderStatus, Prisma } from "@prisma/client";
import {
  CreateDroneDto,
  UpdateDroneDto,
  UpdateHeartbeatDto
} from "../dtos/drone.dto";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";

type ActionResult =
  | { ok: false; message: string }
  | { ok: true; type: "ORDER"; order: Order }
  | { ok: true; type: "DRONE"; drone: Drone };

class DroneService {
  // Create a drone (for Admin)
  async createOne(data: CreateDroneDto) {
    return prisma.drone.create({ data });
  }

  // List all drones (for Admin)
  async getAll(query: {
    page: number;
    limit: number;
    status?: DroneStatus | undefined;
  }) {
    const filter = query.status ? { status: query.status } : {};
    const dronesCount = await prisma.drone.count({
      where: filter
    });

    return {
      data: await prisma.drone.findMany({
        where: filter,
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      count: dronesCount
    };
  }

  // Find a specific drone
  async getOneById(droneId: number, options?: any): Promise<Drone> {
    const drone = await prisma.drone.findUnique({
      where: { id: droneId },
      ...options
    });
    if (!drone) throw ApiError.NotFound("Drone not found");
    return drone;
  }

  async updateOneById(droneId: number, dto: UpdateDroneDto) {
    const drone = await this.getOneById(droneId);
    if (dto.status === DroneStatus.BROKEN) {
      if (drone.status === DroneStatus.BROKEN)
        throw ApiError.BadRequest("Drone is already reported as broken");
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
  async reserveJob(droneId: number): Promise<ActionResult> {
    // Find a PENDING order
    const order = await prisma.order.findFirst({
      where: { status: OrderStatus.PENDING, onTheWay: false },
      orderBy: { createdAt: "asc" } // earliest orders first
    });

    if (!order) return { ok: false, message: "No pending jobs available" };

    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.IN_PROGRESS }
    });

    // Assign it
    return {
      ok: true,
      drone: await prisma.drone.update({
        where: { id: droneId },
        data: {
          status: DroneStatus.RESERVED,
          currentOrder: { connect: { id: order.id } }
        },
        include: { currentOrder: true }
      }),
      type: "DRONE"
    };
  }

  // The "Rescue" Logic
  async reportBroken(droneId: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch Drone
      const drone = await tx.drone.findUnique({ where: { id: droneId } });
      if (!drone) throw ApiError.NotFound("Drone not found");

      // 2. Find active order assigned to this drone
      const activeOrder = await tx.order.findUnique({
        where: { droneId: droneId }
      });

      // 3. Update Drone Status
      await tx.drone.update({
        where: { id: droneId },
        data: { status: "BROKEN", currentOrder: { disconnect: true } }
      });

      // 4. Rescue Order if exists
      if (activeOrder) {
        await tx.order.update({
          where: { id: activeOrder.id },
          data: {
            status: "PENDING",
            droneId: null,
            // Requirement: Origin becomes the broken drone's location
            origin: `${drone.lat},${drone.lng}`
          }
        });
        return {
          message: "Drone marked BROKEN. Order requeued from rescue location."
        };
      }

      return { message: "Drone marked BROKEN. No active order." };
    });
  }

  async grabOrder(droneId: number): Promise<ActionResult> {
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
  ): Promise<ActionResult> {
    return prisma.$transaction(async (tx) => {
      const brokenDroneOrder = await tx.order.findFirst({
        where: { status: OrderStatus.PENDING, onTheWay: true },
        include: { drone: true },
        orderBy: { createdAt: "asc" }
      });

      if (!brokenDroneOrder) {
        return { ok: false, message: "No pending jobs available" };
      }

      const [lat, lng] = brokenDroneOrder.origin.split(",").map(Number) as [
        number,
        number
      ];

      await tx.drone.update({
        where: { id: droneId },
        data: {
          status: DroneStatus.DELIVERING,
          lat,
          lng,
          currentOrder: { connect: { id: brokenDroneOrder.id } }
        }
      });

      const order = await tx.order.update({
        where: { id: brokenDroneOrder.id },
        data: {
          droneId,
          status: OrderStatus.PICKED_UP,
          onTheWay: true
        }
      });

      return {
        ok: true,
        type: "ORDER",
        order
      };
    });
  }

  private async grabOrderFromOrigin(droneId: number): Promise<ActionResult> {
    return prisma.$transaction(async (tx) => {
      const drone = await tx.drone.findUnique({
        where: { id: droneId },
        include: { currentOrder: true }
      });

      if (!drone || !drone.currentOrder) {
        return { ok: false, message: "No order to grab" };
      }

      const orderId = drone.currentOrder.id;

      // Parse origin safely and assert correctness
      const [lat, lng] = drone.currentOrder.origin.split(",").map(Number) as [
        number,
        number
      ];

      await tx.drone.update({
        where: { id: droneId },
        data: {
          status: DroneStatus.DELIVERING,
          currentOrder: { connect: { id: orderId } },
          lat,
          lng
        }
      });

      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          droneId: drone.id,
          status: OrderStatus.PICKED_UP,
          onTheWay: true
        }
      });

      return {
        ok: true,
        type: "ORDER",
        order
      };
    });
  }
}

export default new DroneService();
