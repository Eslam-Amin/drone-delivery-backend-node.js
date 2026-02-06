import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";

export const auth = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "Missing Authorization header" });

    const bearerToken = header.split(" ");
    if (bearerToken[0] !== "Bearer")
      return res.status(401).json({ error: "Invalid Authorization header" });
    if (!bearerToken[1])
      return res.status(401).json({ error: "Missing token" });
    try {
      const decoded = verifyToken(bearerToken[1]);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "Access Forbidden" });
      }
      (req as any).entity = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: err });
    }
  };
};
