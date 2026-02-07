import dotenv from "dotenv";
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || "dev_secret_do_not_use_in_prod",
      expiresIn: "1h"
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || "dev_secret_do_not_use_in_prod",
      expiresIn: "7d"
    },
    secret: process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod",
    expiresIn: "15d"
  },
  dbUrl: process.env.DATABASE_URL
};

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn("WARNING: No JWT secrets set. Using unsafe default.");
}
