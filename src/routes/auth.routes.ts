import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { validate } from "../middlewares/validator.middleware";
import { AuthTokenSchema } from "../dtos/auth.dto";

const router = Router();

// Endpoint to get JWT
router.post("/token", validate(AuthTokenSchema), AuthController.generateToken);

export default router;
