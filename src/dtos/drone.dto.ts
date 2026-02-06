import { z } from "zod";
import { DroneStatus } from "@prisma/client";

export const CreateDroneSchema = z.object({
  battery: z.number().min(0).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const UpdateDroneSchema = z.object({
  status: z.enum(DroneStatus),
  battery: z.number().min(0).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const UpdateHeartbeatSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  battery: z.number().min(0).max(100)
});

export const UpdateDroneStatusSchema = z.object({
  status: z.enum(DroneStatus)
});

export type CreateDroneDto = z.infer<typeof CreateDroneSchema>;
export type UpdateDroneDto = z.infer<typeof UpdateDroneSchema>;
export type UpdateHeartbeatDto = z.infer<typeof UpdateHeartbeatSchema>;
export type UpdateDroneStatusDto = z.infer<typeof UpdateDroneStatusSchema>;
