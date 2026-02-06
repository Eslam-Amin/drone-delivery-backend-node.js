import { Request, Response } from "express";
import droneService from "../services/drone.service";

class DroneController {
  async createDrone(req: Request, res: Response) {
    try {
      const result = await droneService.createOne(req.body);
      res.status(201).json({
        success: true,
        message: "Drone Created Successfully",
        data: result
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  async getAllDrones(req: Request, res: Response) {
    try {
      const result = await droneService.getAll(req.query);

      res.status(200).json({
        success: true,
        message: "Drones fetched successfully",
        data: result
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
  async updateHeartbeat(req: Request, res: Response) {
    try {
      const droneId = (req as any).entity.id;

      const result = await droneService.updateHeartbeat(droneId, req.body);
      res.status(200).json({
        success: true,
        message: "Heartbeat updated successfully",
        data: result
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  async reportBroken(req: Request, res: Response) {
    try {
      const { droneId } = req.body;
      const result = await droneService.reportBroken(droneId);
      res.status(200).json({
        success: true,
        message: "Drone reported as broken successfully",
        data: result
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to report broken status" });
    }
  }
}

export default new DroneController();
