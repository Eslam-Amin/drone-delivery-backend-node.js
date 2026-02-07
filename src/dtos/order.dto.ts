import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const PointStringSchema = z
  .string()
  .min(1, "Origin cannot be empty")
  .refine((val) => {
    const parts = val.split(",");
    if (parts.length !== 2) return false;
    const [lat, lng] = parts.map(Number);
    return (
      lat &&
      lng &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }, 'Origin must be in "lat,lng" format with valid coordinates');

export const CreateOrderSchema = z.object({
  origin: PointStringSchema,
  destination: PointStringSchema
});

export const UpdateOrderSchema = CreateOrderSchema.partial();

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus)
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
