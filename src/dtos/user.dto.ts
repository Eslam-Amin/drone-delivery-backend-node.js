import { UserRole } from "@prisma/client";
import { z } from "zod";

export const GetUsersQuerySchema = z.object({
  role: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(UserRole))
    .optional()
});

export type GetUsersQueryDto = z.infer<typeof GetUsersQuerySchema>;
