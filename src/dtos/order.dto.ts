import { z } from "zod";

export const CreateOrderSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1)
});

export const UpdateOrderDestSchema = z.object({
  destination: z.string().min(1)
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDestDto = z.infer<typeof UpdateOrderDestSchema>;
