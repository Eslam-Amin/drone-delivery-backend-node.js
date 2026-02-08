import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export const auth = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) throw ApiError.Unauthorized("Missing Authorization header");

    const bearerToken = header.split(" ");
    if (bearerToken[0] !== "Bearer")
      throw ApiError.Unauthorized("Invalid Authorization header");
    if (!bearerToken[1]) throw ApiError.Unauthorized("Missing token");
    try {
      const decoded = verifyToken(bearerToken[1]);
      if (!allowedRoles.includes(decoded.role)) {
        throw ApiError.Forbidden("Access Forbidden");
      }
      (req as any).entity = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };
};
