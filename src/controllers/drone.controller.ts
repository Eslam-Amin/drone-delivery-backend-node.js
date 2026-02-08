import { NextFunction, Request, Response } from "express";
import droneService from "../services/drone.service";
import { GetDronesQuerySchema } from "../dtos/drone.dto";
import { Drone } from "@prisma/client";

class DroneController {
  async createDrone(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await droneService.createOne(req.body);
      res.status(201).json({
        success: true,
        message: "Drone Created Successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllDrones(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetDronesQuerySchema.parse(req.query);
      const result = await droneService.getAll(query);

      res.status(200).json({
        success: true,
        message: "Drones fetched successfully",
        pagnination: {
          page: query.page,
          limit: query.limit,
          count: result.count,
          totalPages: Math.ceil(result.count / query.limit)
        },
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }
  async getOneDrone(req: Request, res: Response, next: NextFunction) {
    try {
      const { droneId } = req.params;
      const result = await droneService.getOneById(+droneId!);
      res.status(200).json({
        success: true,
        message: "Drone fetched successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDrone(req: Request, res: Response, next: NextFunction) {
    try {
      const { droneId } = req.params;
      const result = (await droneService.updateOneById(
        +droneId!,
        req.body
      )) as {
        message: string;
        data: Drone;
      };
      res.status(200).json({
        success: true,
        message: result.message ? result.message : "Drone updated successfully",
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHeartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      const droneId = (req as any).entity.id;

      const result = await droneService.updateHeartbeat(droneId, req.body);
      res.status(200).json({
        success: true,
        message: "Heartbeat updated successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async reportBroken(req: Request, res: Response, next: NextFunction) {
    try {
      const { droneId } = req.body;
      const result = await droneService.reportBroken(droneId);
      res.status(200).json({
        success: true,
        message: result.message || "Drone reported as broken successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  async reserveJob(req: Request, res: Response, next: NextFunction) {
    try {
      const droneId = (req as any).entity.id;
      const result = await droneService.reserveJob(droneId);
      res.status(200).json({
        success: true,
        message: result.ok ? "Drone reserved successfully" : result.message,
        data: result.ok && result.type === "DRONE" ? result.drone : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  async grabOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const droneId = (req as any).entity.id;
      const result = await droneService.grabOrder(droneId);

      res.status(200).json({
        success: true,
        message: result.ok
          ? "Drone grabbed order successfully"
          : result.message,
        data: result.ok && result.type === "ORDER" ? result.order : undefined
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DroneController();
