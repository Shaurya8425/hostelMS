// src/routes/fee.ts
import { Hono } from "hono";
import prisma from "../db";
import { createFeeSchema, markFeePaidSchema } from "../schemas/feeSchema";

const feeRoute = new Hono();

// POST /payments - Admin adds a fee record
feeRoute.post("/", async (c) => {
  const body = await c.req.json();
  const result = createFeeSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.errors },
      400
    );
  }

  const { studentId, amount, dueDate } = result.data;

  const payment = await prisma.feePayment.create({
    data: {
      studentId,
      amount,
      dueDate: new Date(dueDate),
    },
  });

  return c.json({ success: true, data: payment });
});

// GET /payments - Admin views all payments
feeRoute.get("/", async (c) => {
  const payments = await prisma.feePayment.findMany({
    include: { student: true },
    orderBy: {
      createdAt: "desc",
    },
  });
  return c.json({ success: true, data: payments });
});

// PATCH /payments/:id/pay - Mark a payment as paid
feeRoute.patch("/:id/pay", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = markFeePaidSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.errors },
      400
    );
  }

  const updated = await prisma.feePayment.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(result.data.paidAt),
    },
  });

  return c.json({ success: true, data: updated });
});

// GET /payments/student/:id - Student views their fee history
feeRoute.get("/student/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const payments = await prisma.feePayment.findMany({
    where: { studentId: id },
    orderBy: {
      dueDate: "asc",
    },
  });

  return c.json({ success: true, data: payments });
});

export default feeRoute;
