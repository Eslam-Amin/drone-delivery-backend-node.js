import { NextFunction, Request, Response } from "express";
import userService from "../services/user.service";
import { GetUsersQuerySchema } from "../dtos/user.dto";

class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetUsersQuerySchema.parse(req.query);
      const users = await userService.getAll(query);
      res.status(200).json({
        success: true,
        message: "Users Fetched Successfully",
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
