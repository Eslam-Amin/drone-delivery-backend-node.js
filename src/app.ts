import express from "express";
import cors from "cors";
import helmet from "helmet";
import appRouter from "./routes/app.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const app = express();
// Middlewares

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger UI - serve api-docs.json and interactive UI
const apiDocsPath = path.resolve(process.cwd(), "api-docs.json");
let apiDocs = {};
try {
  const raw = fs.readFileSync(apiDocsPath, "utf-8");
  apiDocs = JSON.parse(raw);
} catch (e) {
  console.warn("api-docs.json not found or invalid JSON; Swagger UI disabled.");
}

if (apiDocs && Object.keys(apiDocs).length > 0) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocs));
  app.get("/api-docs.json", (_req, res) => res.json(apiDocs));
}

app.use("/api/v1", appRouter);

app.use(globalErrorHandler);
export default app;
