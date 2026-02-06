import { Request, Response } from "express";
import orderService from "../services/order.service";

class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const userId = (req as any).entity.id;
      const result = await orderService.createOne(userId, req.body);
      res.status(201).json({
        success: true,
        message: "Order Created Successfully",
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOneById(+orderId!);
      res.status(200).json({
        success: true,
        message: "Order Fetched Successfully",
        data: order
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  }

  async listOrders(_req: Request, res: Response) {
    try {
      const orders = await orderService.getAll();
      res.status(200).json({
        success: true,
        message: "Orders Fetched Successfully",
        data: orders
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const result = await orderService.updateOneById(+orderId!, req.body);
      res.status(200).json({
        success: true,
        message: "Order Updated Successfully",
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  }

  async withdrawOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      await orderService.withdrawOrder(+orderId!, (req as any).entity.id);
      res.status(200).json({
        success: true,
        message: "Order Withdrawn Successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to withdraw order" });
    }
  }

  async getUsersOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).entity.id;
      const orders = await orderService.getAllByUser(userId);
      res.status(200).json({
        success: true,
        message: "Orders Fetched Successfully",
        data: orders
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }
}

export default new OrderController();
