import { z } from "zod";

export const createComplaintSchema = z.object({
  subject: z.string().min(3),
  description: z.string().min(5),
  studentEmail: z.string().email(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
});
