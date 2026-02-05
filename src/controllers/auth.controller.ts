import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthTokenSchema } from "../dtos/auth.dto";

const authService = new AuthService();

export const generateToken = (req: Request, res: Response) => {
  const validation = AuthTokenSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const token = authService.generateToken(validation.data);
  res.json(token);
};
