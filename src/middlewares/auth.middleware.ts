import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";

export const auth = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "Missing Authorization header" });

    const token = header.split(" ");
    if (token[0] !== "Bearer")
      return res.status(401).json({ error: "Invalid Authorization header" });
    if (!token[1]) return res.status(401).json({ error: "Missing token" });
    try {
      const decoded = verifyToken(token[1]);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "Access Forbidden" });
      }
      (req as any).entity = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or Expired Token" });
    }
  };
};
