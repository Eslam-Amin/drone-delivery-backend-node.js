import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import { config } from "../config/env.config";

export const signToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as StringValue
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};
