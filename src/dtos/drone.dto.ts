import { z } from "zod";
import { DroneStatus } from "@prisma/client";

export const UpdateHeartbeatSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  battery: z.number().min(0).max(100)
});

export const UpdateDroneStatusSchema = z.object({
  status: z.enum(DroneStatus)
});

export type UpdateHeartbeatDto = z.infer<typeof UpdateHeartbeatSchema>;
export type UpdateDroneStatusDto = z.infer<typeof UpdateDroneStatusSchema>;
