// src/schemas/roomSchema.ts
import { z } from "zod";

export const roomSchema = z.object({
  roomNumber: z.string().min(1),
  block: z.string().min(1),
  floor: z.number().int().min(0),
  designation: z.string().optional().nullable(),
  capacity: z.number().int().min(0),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED", "BLOCKED"]).optional(),
});
