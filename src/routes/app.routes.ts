import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import droneRoutes from "./drone.routes";
import orderRoutes from "./order.routes";

const appRoutes = Router();

// Routes
appRoutes.use("/auth", authRoutes);
appRoutes.use("/users", userRoutes);
appRoutes.use("/drones", droneRoutes);
appRoutes.use("/orders", orderRoutes);

// Health Check
appRoutes.get("/health", (_req, res) => {
  res.json({ status: "Penny Software Drone Backend is Active" });
});

export default appRoutes;
