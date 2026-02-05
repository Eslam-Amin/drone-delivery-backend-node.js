import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod",
  dbUrl: process.env.DATABASE_URL
};

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: No JWT_SECRET set. Using unsafe default.");
}
