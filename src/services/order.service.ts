import { OrderStatus } from "@prisma/client";
import { CreateOrderDto } from "../dtos/order.dto";
import { prisma } from "../config/database";

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
    if (!order) throw new Error("Order not found");
    return order;
  }

  // Enduser Withdraws Order
  async withdrawOrder(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("unauthorized");
    if (order.status !== OrderStatus.PENDING)
      throw new Error("Cannot withdraw order already in progress");

    return prisma.order.delete({ where: { id: orderId } });
  }

  // Admin Bulk Get
  async getAll() {
    return prisma.order.findMany();
  }
}

export default new OrderService();
