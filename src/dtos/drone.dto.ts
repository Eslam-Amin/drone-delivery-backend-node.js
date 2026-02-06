import { z } from "zod";
import { DroneStatus } from "@prisma/client";

export const CreateDroneSchema = z.object({
  battery: z.number().min(0).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const UpdateDroneSchema = z.object({
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(DroneStatus))
    .optional(),
  battery: z.number().min(0).max(100).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional()
});

export const UpdateHeartbeatSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  battery: z.number().min(0).max(100),
  speed: z.number().min(0).max(100)
});

export const UpdateDroneStatusSchema = z.object({
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(DroneStatus))
});

export type CreateDroneDto = z.infer<typeof CreateDroneSchema>;
export type UpdateDroneDto = z.infer<typeof UpdateDroneSchema>;
export type UpdateHeartbeatDto = z.infer<typeof UpdateHeartbeatSchema>;
export type UpdateDroneStatusDto = z.infer<typeof UpdateDroneStatusSchema>;
