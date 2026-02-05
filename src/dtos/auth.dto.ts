import { z } from "zod";
import { Role } from "@prisma/client";

export const AuthTokenSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(Role)
});

export type AuthTokenDto = z.infer<typeof AuthTokenSchema>;
