import { Hono } from "hono";
import prisma from "../db";
import { studentSchema } from "../schemas/studentSchema";
import { hash } from "bcryptjs";
import { authMiddleware } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type UserContext = {
  Variables: {
    user: {
      id: number;
      email: string;
      role: string;
      studentId: number | null;
    };
  };
};

const studentRoute = new Hono<UserContext>();

// ✅ Admin-only: Create student + linked user (default password)
studentRoute.post("/", async (c) => {
  const body = await c.req.json();

  const result = studentSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.flatten() },
      400
    );
  }

  const {
    name,
    email,
    phone,
    gender,
    division,
    course,
    fromDate,
    toDate,
    linenIssued,
  } = result.data;

  try {
    // Only send valid fields to Prisma
    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        gender,
        division,
        course,
        fromDate,
        toDate,
        linenIssued,
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

// ✅ Student self-complete profile (requires login, links to existing user)
studentRoute.post(
  "/profile",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      name: z.string(),
      phone: z.string(),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]),
      division: z.string().optional().nullable(),
      course: z.string().optional().nullable(),
      fromDate: z.coerce.date().optional().nullable(),
      toDate: z.coerce.date().optional().nullable(),
      linenIssued: z.enum(["BEDSHEET", "PILLOW_COVER", "NA"]).optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");

    if (user.role !== "STUDENT")
      return c.json({ error: "Only students can create profile" }, 403);

    if (user.studentId) return c.json({ error: "Profile already exists" }, 400);

    const data = c.req.valid("json");

    try {
      const student = await prisma.student.create({
        data: {
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          division: data.division,
          course: data.course,
          fromDate: data.fromDate,
          toDate: data.toDate,
          linenIssued: data.linenIssued,
          email: user.email,
          user: { connect: { id: user.id } },
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { studentId: student.id },
      });

      return c.json({ message: "Profile created", student });
    } catch (err) {
      console.error("Profile creation error:", err);
      return c.json({ error: "Failed to create student profile" }, 500);
    }
  }
);

// ✅ Paginated + filtered student list
studentRoute.get("/", async (c) => {
  const search = c.req.query("search") || "";
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const skip = (page - 1) * limit;

  const [students, total] = await prisma.$transaction([
    prisma.student.findMany({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" as const } }],
      },
      skip,
      take: limit,
      include: {
        room: true,
        complaints: true,
        leaves: true,
      },
    }),
    prisma.student.count({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
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

// ✅ Get single student
studentRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      room: true,
      complaints: true,
      leaves: true,
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
