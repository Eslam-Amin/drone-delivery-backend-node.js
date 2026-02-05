import { Request, Response } from "express";
import orderService from "../services/order.service";

class OrderController {
  createOrder = async (req: Request, res: Response) => {
    const userId = (req as any).entity.id;
    const result = await orderService.createOne(userId, req.body);
    res.json(result);
  };

  getOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await orderService.getOneById(+orderId!);
    res.json(order);
  };

  listOrders = async (req: Request, res: Response) => {
    const orders = await orderService.getAll();
    res.json(orders);
  };
}

export default new OrderController();
