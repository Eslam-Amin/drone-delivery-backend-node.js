import { OrderStatus, Prisma } from "@prisma/client";
import { CreateOrderDto, UpdateOrderDto } from "../dtos/order.dto";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";

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
  async getAll() {
    return prisma.order.findMany();
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

  async getAllByUser(userId: number) {
    return prisma.order.findMany({ where: { userId } });
  }

  async getDroneAssignedOrder(droneId: number) {
    return prisma.order.findFirst({
      where: { droneId, status: OrderStatus.PENDING }
    });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}

export default new OrderService();
