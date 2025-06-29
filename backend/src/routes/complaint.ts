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

  const { subject, description, studentId } = result.data;

  const complaint = await prisma.complaint.create({
    data: {
      subject,
      description,
      studentId,
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

// GET /complaints/student/:id - Student views their own complaints
complaintRoute.get("/student/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const complaints = await prisma.complaint.findMany({
    where: { studentId: id },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json({ success: true, data: complaints });
});

export default complaintRoute;
