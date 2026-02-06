import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const generateToken = (req: Request, res: Response) => {
  const token = authService.generateToken(req.body);
  res
    .status(200)
    .json({
      success: true,
      message: "Token Generated Successfully",
      data: token
    });
};
