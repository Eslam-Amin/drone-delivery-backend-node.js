import express from "express";
import cors from "cors";
import helmet from "helmet";
import appRouter from "./routes/app.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();
// Middlewares

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", appRouter);

app.use(globalErrorHandler);
export default app;
