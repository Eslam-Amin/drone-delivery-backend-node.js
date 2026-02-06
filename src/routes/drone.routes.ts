import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import droneController from "../controllers/drone.controller";
import { Role } from "@prisma/client";
import { validate } from "../middlewares/validator.middleware";
import {
  CreateDroneSchema,
  UpdateDroneSchema,
  UpdateHeartbeatSchema
} from "../dtos/drone.dto";

const router = Router();

router
  .route("/")
  .get(auth([Role.ADMIN]), droneController.getAllDrones)
  .post(
    auth([Role.ADMIN]),
    validate(CreateDroneSchema),
    droneController.createDrone
  );

router
  .route("/:droneId")
  .patch(
    auth([Role.ADMIN]),
    validate(UpdateDroneSchema),
    droneController.updateDrone
  )
  .get(auth([Role.ADMIN]), droneController.getOneDrone);

// Drones only endpoints
router.post(
  "/heartbeat",
  auth([Role.DRONE]),
  validate(UpdateHeartbeatSchema),
  droneController.updateHeartbeat
);
router.post("/broken", auth([Role.DRONE]), droneController.reportBroken);
router.post("/reserve-job", auth([Role.DRONE]), droneController.reserveJob);

export default router;
