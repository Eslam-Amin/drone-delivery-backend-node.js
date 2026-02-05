import { OrderStatus, PrismaClient } from "@prisma/client";
import { CreateOrderDto } from "../dtos/order.dto";
const prisma = new PrismaClient();

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
  getOneById(orderId: number) {
    const order = prisma.order.findUnique({
      where: { id: orderId },
      include: { drone: true }
    });
    if (!order) throw new Error("Order not found");
    return order;
  }

  // Admin Bulk Get
  async getAll() {
    return prisma.order.findMany();
  }
}

export default new OrderService();
