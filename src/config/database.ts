import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/env.config";

// 1. Initialize the connection pool
const pool = new Pool({
  connectionString: config.dbUrl
});

// 2. Initialize the adapter
const adapter = new PrismaPg(pool);

// 3. Instantiate the client with the adapter
export const prisma = new PrismaClient({ adapter });

// Optional: Graceful shutdown helper
export const disconnectDb = async () => {
  await prisma.$disconnect();
  await pool.end();
};
