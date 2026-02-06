import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import { CreateOrderSchema } from "../dtos/order.dto";
import { validate } from "../middlewares/validator.middleware";
import orderController from "../controllers/order.controller";

const router = Router();

// Enduser: Submit Order
router
  .route("/")
  .post(
    auth([Role.ENDUSER]),
    validate(CreateOrderSchema),
    orderController.createOrder
  )
  .get(auth([Role.ADMIN]), orderController.listOrders);

router.patch("/:orderId", auth([Role.ADMIN]), orderController.updateOrder);

router.patch(
  "/:orderId/withdraw",
  auth([Role.ENDUSER]),
  orderController.withdrawOrder
);

export default router;
