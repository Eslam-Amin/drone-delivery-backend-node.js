import { DroneStatus, OrderStatus, Prisma, Order } from "@prisma/client";
import {
  CreateOrderDto,
  GetOrdersQueryDto,
  GetUsersOrdersQueryDto,
  UpdateOrderDto
} from "../dtos/order.dto";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import { computeEta } from "../utils/eta";

type ActionResult = { ok: false; message: string } | { ok: true; data: Order };

class OrderService {
  // Submit Order
  async createOne(userId: number, data: CreateOrderDto) {
    return prisma.order.create({
      data: {
        origin: data.origin,
        destination: data.destination,
        userId,
        status: OrderStatus.PENDING
      }
    });
  }

  // Get Order details
  async getOneById(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { drone: true }
    });
    if (!order) throw ApiError.NotFound("Order not found");
    return order;
  }

  // Admin Bulk Get
  async getAll(query: GetOrdersQueryDto) {
    const filter = {
      ...(query.userId && { userId: query.userId }),
      ...(query.droneId && { droneId: query.droneId }),
      ...(query.status && { status: query.status })
    };

    const ordersCount = await prisma.order.count({
      where: filter
    });

    return {
      data: await prisma.order.findMany({
        where: filter,
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      count: ordersCount
    };
  }

  async updateOneById(orderId: number, dto: UpdateOrderDto) {
    const data: Prisma.OrderUpdateInput = {
      ...(dto.destination !== undefined && { destination: dto.destination }),
      ...(dto.origin !== undefined && { origin: dto.origin })
    };
    await this.getOneById(orderId);

    return prisma.order.update({
      where: { id: orderId },
      data
    });
  }

  // Enduser Withdraws Order
  async withdrawOrder(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) throw ApiError.NotFound("Order not found");
    if (order.userId !== userId) throw ApiError.Unauthorized();
    if (order.status !== OrderStatus.PENDING)
      throw ApiError.BadRequest("Cannot withdraw order already in progress");

    return prisma.order.delete({ where: { id: orderId } });
  }

  async getAllByUser(query: GetUsersOrdersQueryDto) {
    const filter = {
      userId: query.userId!,
      ...(query.status && { status: query.status })
    };
    let orders = await prisma.order.findMany({
      where: filter,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { drone: true }
    });

    orders = orders.map((order) => ({
      ...order,
      eta: computeEta(order)
    }));

    const ordersCount = await prisma.order.count({ where: filter });

    return { data: orders, count: ordersCount };
  }

  async getDroneAssignedOrder(droneId: number): Promise<ActionResult> {
    const order = await prisma.order.findFirst({
      where: {
        droneId,
        status: {
          in: [OrderStatus.IN_PROGRESS, OrderStatus.PICKED_UP]
        }
      }
    });
    if (!order)
      return { ok: false, message: "No order assigned to this drone" };
    return { ok: true, data: order };
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.getOneById(orderId);
    if (order.status !== OrderStatus.PICKED_UP)
      throw ApiError.BadRequest("Order is not picked up yet");
    return await prisma.$transaction(async (tx) => {
      // If delivered, update the drone status
      if (status === OrderStatus.DELIVERED && order.droneId) {
        await tx.drone.update({
          where: { id: order.droneId },
          data: { status: DroneStatus.RETURNING }
        });
      }

      // Update the order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      return updatedOrder;
    });
  }
}

export default new OrderService();
