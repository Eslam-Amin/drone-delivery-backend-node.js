import { NextFunction, Request, Response } from "express";
import orderService from "../services/order.service";
import { OrderStatus } from "@prisma/client";
import { GetOrdersQuerySchema } from "../dtos/order.dto";

class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).entity.id;
      const result = await orderService.createOne(userId, req.body);
      res.status(201).json({
        success: true,
        message: "Order Created Successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOneById(+orderId!);
      res.status(200).json({
        success: true,
        message: "Order Fetched Successfully",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetOrdersQuerySchema.parse(req.query);
      const result = await orderService.getAll(query);

      res.status(200).json({
        success: true,
        message: "Orders Fetched Successfully",
        pagnination: {
          page: query.page,
          limit: query.limit,
          count: result.count,
          totalPages: Math.ceil(result.count / query.limit)
        },
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const result = await orderService.updateOneById(+orderId!, req.body);
      res.status(200).json({
        success: true,
        message: "Order Updated Successfully",
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }

  async withdrawOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      await orderService.withdrawOrder(+orderId!, (req as any).entity.id);
      res.status(200).json({
        success: true,
        message: "Order Withdrawn Successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).entity.id;
      const query = GetOrdersQuerySchema.parse(req.query);
      query.userId = userId;
      const result = await orderService.getAll(query);
      res.status(200).json({
        success: true,
        message: "Orders Fetched Successfully",
        pagnination: {
          page: query.page,
          limit: query.limit,
          count: result.count,
          totalPages: Math.ceil(result.count / query.limit)
        },
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  async getDronesOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const droneId = (req as any).entity.id;
      const order = await orderService.getDroneAssignedOrder(droneId);
      res.status(200).json({
        success: true,
        message: "Orders Fetched Successfully",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async markOrderAsDelivered(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      await orderService.updateOrderStatus(+orderId!, OrderStatus.DELIVERED);
      res.status(200).json({
        success: true,
        message: "Order marked as delivered successfully"
      });
    } catch (error) {
      next(error);
    }
  }
  async markOrderAsFailed(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      await orderService.updateOrderStatus(+orderId!, OrderStatus.FAILED);
      res.status(200).json({
        success: true,
        message: "Order marked as failed successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
