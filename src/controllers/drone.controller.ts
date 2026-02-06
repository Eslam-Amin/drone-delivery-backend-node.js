import { Request, Response } from "express";
import droneService from "../services/drone.service";

class DroneController {
  async updateHeartbeat(req: Request, res: Response) {
    try {
      const droneId = (req as any).entity.id;

      const result = await droneService.updateHeartbeat(droneId, req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  async reportBroken(req: Request, res: Response) {
    try {
      const { droneId } = req.body;
      const result = await droneService.reportBroken(droneId);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to report broken status" });
    }
  }
}

export default new DroneController();
