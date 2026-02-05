import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import { CreateOrderSchema } from "../dtos/order.dto";
import { validate } from "../middlewares/validator.middleware";
import orderController from "../controllers/order.controller";

const router = Router();

// Enduser: Submit Order
router.post(
  "/",
  auth([Role.ENDUSER]),
  validate(CreateOrderSchema),
  orderController.createOrder
);

// Admin: Get All Orders
router.get("/", auth([Role.ADMIN]), orderController.listOrders);

export default router;
