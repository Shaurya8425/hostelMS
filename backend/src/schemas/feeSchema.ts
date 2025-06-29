// src/schemas/feeSchema.ts
import { z } from "zod";

export const createFeeSchema = z.object({
  studentId: z.number(),
  amount: z.number().min(1),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid due date",
  }),
});

export const markFeePaidSchema = z.object({
  paidAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid paidAt date",
  }),
});
