import express from "express";
import cors from "cors";
import appRouter from "./routes/app.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", appRouter);

app.use(globalErrorHandler);
export default app;
