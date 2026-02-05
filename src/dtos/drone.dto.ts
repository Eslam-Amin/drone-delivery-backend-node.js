import { z } from "zod";

export const UpdateHeartbeatSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export type UpdateHeartbeatDto = z.infer<typeof UpdateHeartbeatSchema>;
