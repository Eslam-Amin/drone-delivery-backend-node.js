import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import {
  CreateOrderSchema,
  GetOrdersQuerySchema,
  UpdateOrderSchema
} from "../dtos/order.dto";
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
  .get(
    auth([Role.ADMIN]),
    validate(GetOrdersQuerySchema, "query"),
    orderController.listOrders
  );

router.get("/me", auth([Role.ENDUSER]), orderController.getUsersOrders);
router.get("/current", auth([Role.DRONE]), orderController.getDronesOrder);

router
  .route("/:orderId")
  .get(auth([Role.ADMIN]), orderController.getOrder)
  .patch(
    auth([Role.ADMIN]),
    validate(UpdateOrderSchema),
    orderController.updateOrder
  );

router.patch(
  "/:orderId/withdraw",
  auth([Role.ENDUSER]),
  orderController.withdrawOrder
);

router.patch(
  "/:orderId/delivered",
  auth([Role.DRONE]),
  orderController.markOrderAsDelivered
);

router.patch(
  "/:orderId/failed",
  auth([Role.DRONE]),
  orderController.markOrderAsFailed
);

export default router;
