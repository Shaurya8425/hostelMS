// src/routes/student.ts
import { Hono } from "hono";
import prisma from "../db";
import { studentSchema } from "../schemas/studentSchema";
import { hash } from "bcryptjs";

const studentRoute = new Hono();

// ✅ Create student + linked user
studentRoute.post("/", async (c) => {
  const body = await c.req.json();

  const result = studentSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.flatten() },
      400
    );
  }

  const { name, email, phone, branch, year, rollNumber, gender } = result.data;

  try {
    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        branch,
        year,
        rollNumber,
        gender,
        user: {
          create: {
            email,
            password: await hash("default123", 10), // Default password
            role: "STUDENT",
          },
        },
      },
      include: { user: true },
    });

    return c.json(student, 201);
  } catch (error: any) {
    console.error("Failed to create student and user:", error);
    return c.json(
      {
        error: "Failed to create student and user",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      400
    );
  }
});

studentRoute.get("/", async (c) => {
  const search = c.req.query("search") || "";
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const skip = (page - 1) * limit;

  const [students, total] = await prisma.$transaction([
    prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { rollNumber: { contains: search, mode: "insensitive" as const } },
        ],
      },
      skip,
      take: limit,
      include: {
        room: true,
        complaints: true,
        leaves: true,
        payments: true,
      },
    }),
    prisma.student.count({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { rollNumber: { contains: search, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  return c.json({
    data: students,
    page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  });
});

// ✅ Get a single student
studentRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      room: true,
      complaints: true,
      leaves: true,
      payments: true,
    },
  });

  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }

  return c.json(student);
});

// ✅ Update student
studentRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  try {
    const updated = await prisma.student.update({
      where: { id },
      data: body,
    });
    return c.json(updated);
  } catch (error) {
    console.error("Update student error:", error);
    return c.json(
      {
        error: "Failed to update student",
        details: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      400
    );
  }
});

// ✅ Delete student
studentRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    await prisma.student.delete({ where: { id } });
    return c.json({ message: "Student deleted" });
  } catch (error) {
    console.error("Delete student error:", error);
    return c.json(
      {
        error: "Failed to delete student",
        details: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      400
    );
  }
});

export default studentRoute;
