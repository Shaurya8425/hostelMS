// src/schemas/studentSchema.ts
import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  branch: z.string().min(1),
  year: z.number().int().min(1).max(5),
  rollNumber: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
});