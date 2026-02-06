import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import droneController from "../controllers/drone.controller";
import { Role } from "@prisma/client";
import { validate } from "../middlewares/validator.middleware";
import { UpdateHeartbeatSchema } from "../dtos/drone.dto";

const router = Router();

router
  .route("/")
  .get(auth([Role.ADMIN]), droneController.getAllDrones)
  .post(auth([Role.ADMIN]), droneController.createDrone);

// Drones only endpoints
router.post(
  "/heartbeat",
  auth([Role.DRONE]),
  validate(UpdateHeartbeatSchema),
  droneController.updateHeartbeat
);
router.post("/broken", auth([Role.DRONE]), droneController.reportBroken);

export default router;
