// src/routes/leave.ts
import { Hono } from "hono";
import prisma from "../db";
import {
  createLeaveSchema,
  updateLeaveStatusSchema,
} from "../schemas/leaveSchema";

const leaveRoute = new Hono();

// POST /leaves - Apply for leave
leaveRoute.post("/", async (c) => {
  const body = await c.req.json();
  const result = createLeaveSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.errors },
      400
    );
  }

  const { fromDate, toDate, reason, studentId } = result.data;

  const leave = await prisma.leave.create({
    data: {
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      studentId,
    },
  });

  return c.json({ success: true, data: leave });
});

// GET /leaves - Admin views all leave applications
leaveRoute.get("/", async (c) => {
  const leaves = await prisma.leave.findMany({
    include: {
      student: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return c.json({ success: true, data: leaves });
});

// GET /leaves/:id - View one leave
leaveRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const leave = await prisma.leave.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!leave) return c.json({ error: "Leave not found" }, 404);
  return c.json({ success: true, data: leave });
});

// PATCH /leaves/:id/status - Approve/Reject leave
leaveRoute.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = updateLeaveStatusSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.errors },
      400
    );
  }

  const leave = await prisma.leave.update({
    where: { id },
    data: {
      status: result.data.status,
    },
  });

  return c.json({ success: true, data: leave });
});

// GET /leaves/student/:id - Student views their leaves
leaveRoute.get("/student/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const leaves = await prisma.leave.findMany({
    where: { studentId: id },
    orderBy: {
      fromDate: "desc",
    },
  });

  return c.json({ success: true, data: leaves });
});

export default leaveRoute;
