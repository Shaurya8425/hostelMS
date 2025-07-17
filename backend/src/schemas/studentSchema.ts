// src/schemas/studentSchema.ts
import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  division: z.string().optional().nullable(),
  course: z.string().optional().nullable(),
  fromDate: z.coerce.date().optional().nullable(),
  toDate: z.coerce.date().optional().nullable(),
  linenIssued: z.enum(["BEDSHEET", "PILLOW_COVER", "NA"]).optional(),
});
