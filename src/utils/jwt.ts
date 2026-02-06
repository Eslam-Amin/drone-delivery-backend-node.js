import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import { config } from "../config/env.config";

export const signToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as StringValue
  });
};

export const signAccessToken = (payload: object): string => {
  return jwt.sign({ ...payload, type: "access" }, config.jwt.access.secret, {
    expiresIn: config.jwt.access.expiresIn as StringValue
  });
};

export const signRefreshToken = (payload: object): string => {
  return jwt.sign({ ...payload, type: "refresh" }, config.jwt.access.secret, {
    expiresIn: config.jwt.refresh.expiresIn as StringValue
  });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, config.jwt.access.secret);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwt.refresh.secret);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};
