import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await authService.generateToken(req.body);
    res.status(200).json({
      success: true,
      message: "Token Generated Successfully",
      data: token
    });
  } catch (error) {
    next(error);
  }
};
