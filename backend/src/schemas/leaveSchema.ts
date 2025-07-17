// src/schemas/leaveSchema.ts
import { z } from "zod";

export const createLeaveSchema = z.object({
  fromDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid fromDate" }),
  toDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid toDate" }),
  reason: z.string().min(3),
  studentEmail: z.string().email(),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
