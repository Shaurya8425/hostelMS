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

  const { fromDate, toDate, reason, studentEmail } = result.data;

  // Find student by email
  const student = await prisma.student.findUnique({
    where: { email: studentEmail },
  });
  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }

  const leave = await prisma.leave.create({
    data: {
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      studentId: student.id,
    },
  });

  return c.json({ success: true, data: leave });
});

// GET /leaves - Admin views all leave applications with pagination
leaveRoute.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const search = c.req.query("search") || "";
  const status = c.req.query("status") || "";

  const skip = (page - 1) * limit;

  // Build where clause for search and filter
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { reason: { contains: search, mode: "insensitive" as const } },
      { student: { name: { contains: search, mode: "insensitive" as const } } },
      {
        student: { email: { contains: search, mode: "insensitive" as const } },
      },
    ];
  }

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where: whereClause,
      include: {
        student: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.leave.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return c.json({
    success: true,
    data: leaves,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
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

// GET /leaves/student/:email - Student views their leaves
leaveRoute.get("/student/:email", async (c) => {
  const email = c.req.param("email");
  // Find student by email
  const student = await prisma.student.findUnique({
    where: { email },
  });
  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }
  const leaves = await prisma.leave.findMany({
    where: { studentId: student.id },
    orderBy: {
      fromDate: "desc",
    },
  });
  return c.json({ success: true, data: leaves });
});

export default leaveRoute;
