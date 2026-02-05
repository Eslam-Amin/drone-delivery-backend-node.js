import express from "express";
import cors from "cors";
import appRouter from "./routes/app.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", appRouter);

export default app;
