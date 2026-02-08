import { Router } from "express";
import userController from "../controllers/user.controller";
import { validate } from "../middlewares/validator.middleware";
import { GetUsersQuerySchema } from "../dtos/user.dto";

const router = Router();

router.get("/", validate(GetUsersQuerySchema, "query"), userController.getAll);

export default router;
