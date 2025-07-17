// src/routes/complaint.ts
import { Hono } from "hono";
import prisma from "../db";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "../schemas/complaintSchema";

const complaintRoute = new Hono();

// POST /complaints - Student files a complaint
complaintRoute.post("/", async (c) => {
  const body = await c.req.json();
  const result = createComplaintSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.errors },
      400
    );
  }

  const { subject, description, studentEmail } = result.data;

  // Find student by email
  const student = await prisma.student.findUnique({
    where: { email: studentEmail },
  });
  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }
  const complaint = await prisma.complaint.create({
    data: {
      subject,
      description,
      studentId: student.id,
    },
  });

  return c.json({ success: true, data: complaint });
});

// GET /complaints - Admin views all complaints
complaintRoute.get("/", async (c) => {
  const complaints = await prisma.complaint.findMany({
    include: {
      student: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return c.json({ success: true, data: complaints });
});

// GET /complaints/:id - View one complaint
complaintRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!complaint) return c.json({ error: "Complaint not found" }, 404);
  return c.json({ success: true, data: complaint });
});

// PATCH /complaints/:id/status - Update complaint status
complaintRoute.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = updateComplaintStatusSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.errors },
      400
    );
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      status: result.data.status,
    },
  });

  return c.json({ success: true, data: updated });
});

// GET /complaints/student/:email - Student views their own complaints
complaintRoute.get("/student/:email", async (c) => {
  const email = c.req.param("email");
  // Find student by email
  const student = await prisma.student.findUnique({
    where: { email },
  });
  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }
  const complaints = await prisma.complaint.findMany({
    where: { studentId: student.id },
    orderBy: {
      createdAt: "desc",
    },
  });
  return c.json({ success: true, data: complaints });
});

export default complaintRoute;
