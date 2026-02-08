import { DroneStatus, OrderStatus, Prisma } from "@prisma/client";
import { CreateOrderDto, UpdateOrderDto } from "../dtos/order.dto";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import droneService from "./drone.service";

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

  async getDroneAssignedOrder(droneId: number) {
    return prisma.order.findFirst({
      where: { droneId, status: OrderStatus.PENDING }
    });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.getOneById(orderId);
    if (status === OrderStatus.DELIVERED)
      await droneService.updateOneById(order.droneId!, {
        status: DroneStatus.RETURNING
      });
    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}

export default new OrderService();
