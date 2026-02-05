import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";

const router = Router();

// Endpoint to get JWT
router.post("/token", AuthController.generateToken);

export default router;
