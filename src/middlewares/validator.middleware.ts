import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        return { path: issue.path[0], message: issue.message };
      });
      return res.status(400).json({
        message: "Validation failed",
        errors
      });
    }

    req.body = result.data;
    next();
  };
};
