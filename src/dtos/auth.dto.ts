import { z } from "zod";

export const AuthTokenSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["ADMIN", "ENDUSER", "DRONE"])
});

export type AuthTokenDto = z.infer<typeof AuthTokenSchema>;
