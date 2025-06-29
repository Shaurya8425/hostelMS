// src/schemas/roomSchema.ts
import { z } from "zod";

export const roomSchema = z.object({
  roomNumber: z.string().min(1),
  block: z.string().min(1),
  capacity: z.number().int().min(1),
});
