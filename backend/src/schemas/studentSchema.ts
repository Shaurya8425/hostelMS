// src/schemas/studentSchema.ts
import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  designation: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  mobile: z.string().min(10).max(15).optional().nullable(),
  ticketNumber: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  course: z.string().optional().nullable(),
  fromDate: z.coerce.date().optional().nullable(),
  toDate: z.coerce.date().optional().nullable(),
  bedsheetCount: z.number().min(0).max(5).default(0),
  pillowCount: z.number().min(0).max(5).default(0),
  blanketCount: z.number().min(0).max(5).default(0),
});
