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

// ✅ Check if email already exists in users table
studentRoute.get(
  "/check-email",
  authMiddleware,
  async (c, next) => {
    const user = c.get("user");
    if (user.role !== "ADMIN") {
      return c.json({ error: "Only admins can check email availability" }, 403);
    }
    await next();
  },
  async (c) => {
    const email = c.req.query("email");
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Check if the email already exists in the user table
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    return c.json({
      exists: !!existingUser,
      email,
    });
  }
);

// ✅ Admin-only: Create student + linked user (default password)
studentRoute.post(
  "/",
  authMiddleware,
  async (c, next) => {
    const user = c.get("user");
    if (user.role !== "ADMIN") {
      return c.json({ error: "Only admins can create students" }, 403);
    }
    await next();
  },
  zValidator("json", studentSchema),
  async (c) => {
    const body = c.req.valid("json");

    const {
      name,
      email,
      phone,
      gender,
      division,
      course,
      fromDate,
      toDate,
      bedsheetCount = 0,
      pillowCount = 0,
      blanketCount = 0,
    } = body;

    // Get or create linen inventory with both in-hand and active tracking
    let inventory = await prisma.linenInventory.findFirst();
    if (!inventory) {
      inventory = await prisma.linenInventory.create({
        data: {
          bedsheet: 0,
          bedsheetActive: 0,
          bedsheetInHand: 0,
          pillowCover: 0,
          pillowActive: 0,
          pillowInHand: 0,
          blanket: 0,
          blanketActive: 0,
          blanketInHand: 0,
        },
      });
    }

    // Check if we have enough linen for the new student
    if (
      inventory.bedsheetInHand < bedsheetCount ||
      inventory.pillowInHand < pillowCount ||
      inventory.blanketInHand < blanketCount
    ) {
      return c.json(
        {
          error: "Not enough linen available",
          required: {
            bedsheets: bedsheetCount,
            pillowCovers: pillowCount,
            blankets: blanketCount,
          },
          available: {
            bedsheets: inventory.bedsheetInHand,
            pillowCovers: inventory.pillowInHand,
            blankets: inventory.blanketInHand,
          },
        },
        400
      );
    }

    // Update linen inventory in a transaction - only move items between InHand and Active
    await prisma.$transaction(async (tx) => {
      await tx.linenInventory.update({
        where: { id: inventory!.id },
        data: {
          // Move requested bedsheets from InHand to Active
          bedsheetInHand: { decrement: bedsheetCount },
          bedsheetActive: { increment: bedsheetCount },

          // Move requested pillows from InHand to Active
          pillowInHand: { decrement: pillowCount },
          pillowActive: { increment: pillowCount },

          // Move requested blankets from InHand to Active
          blanketInHand: { decrement: blanketCount },
          blanketActive: { increment: blanketCount },
        },
      });
    });

    try {
      // Check if a user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return c.json(
          {
            error: "A user with this email already exists",
          },
          400
        );
      }

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
          bedsheetCount,
          pillowCount,
          blanketCount,
          linenIssuedDate: new Date(),
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

      // Check for Prisma-specific errors
      if (error.code === "P2002") {
        return c.json(
          {
            error: "A user with this email already exists",
            details: "The email address is already registered in our system",
          },
          400
        );
      }

      return c.json(
        {
          error: "Failed to create student and user",
          details: error instanceof Error ? error.message : String(error),
          stack:
            process.env.NODE_ENV !== "production"
              ? error instanceof Error
                ? error.stack
                : undefined
              : undefined,
        },
        400
      );
    }
  }
);

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
      blanketRequired: z.boolean().default(false),
    })
  ),
  async (c) => {
    const user = c.get("user");

    if (user.role !== "STUDENT")
      return c.json({ error: "Only students can create profile" }, 403);

    if (user.studentId) return c.json({ error: "Profile already exists" }, 400);

    const data = c.req.valid("json");

    try {
      // Get or create linen inventory with count tracking
      let inventory = await prisma.linenInventory.findFirst();
      if (!inventory) {
        inventory = await prisma.linenInventory.create({
          data: {
            bedsheet: 0,
            bedsheetActive: 0,
            bedsheetInHand: 0,
            pillowCover: 0,
            pillowActive: 0,
            pillowInHand: 0,
            blanket: 0,
            blanketActive: 0,
            blanketInHand: 0,
          },
        });
      }

      // Default allocation: 1 bedsheet and 2 pillows
      const bedsheetCount = 1;
      const pillowCount = 2;
      const blanketCount = data.blanketRequired ? 1 : 0;

      // Check if we have enough linen for the new student
      if (
        inventory.bedsheetInHand < bedsheetCount ||
        inventory.pillowInHand < pillowCount ||
        (data.blanketRequired && inventory.blanketInHand < blanketCount)
      ) {
        return c.json(
          {
            error: "Not enough linen available",
            required: {
              bedsheets: bedsheetCount,
              pillowCovers: pillowCount,
              blankets: blanketCount,
            },
            available: {
              bedsheets: inventory.bedsheetInHand,
              pillowCovers: inventory.pillowInHand,
              blankets: inventory.blanketInHand,
            },
          },
          400
        );
      }

      // Update linen inventory in a transaction - move items from InHand to Active
      await prisma.linenInventory.update({
        where: { id: inventory.id },
        data: {
          // Move bedsheets from InHand to Active
          bedsheetInHand: { decrement: bedsheetCount },
          bedsheetActive: { increment: bedsheetCount },
          // Move pillows from InHand to Active
          pillowInHand: { decrement: pillowCount },
          pillowActive: { increment: pillowCount },
          // Move blankets from InHand to Active if requested
          ...(data.blanketRequired
            ? {
                blanketInHand: { decrement: blanketCount },
                blanketActive: { increment: blanketCount },
              }
            : {}),
        },
      });

      const student = await prisma.student.create({
        data: {
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          division: data.division,
          course: data.course,
          fromDate: data.fromDate,
          toDate: data.toDate,
          bedsheetCount: bedsheetCount, // One bedsheet
          pillowCount: pillowCount, // Two pillows
          blanketCount: blanketCount, // One blanket if requested
          linenIssuedDate: new Date(),
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

  const [students, total, inventory] = await prisma.$transaction([
    prisma.student.findMany({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" as const } }],
      },
      skip,
      take: limit,
      select: {
        // Basic student fields
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        division: true,
        course: true,
        fromDate: true,
        toDate: true,
        createdAt: true,
        updatedAt: true,
        roomId: true,
        // Linen-related fields
        bedsheetCount: true,
        pillowCount: true,
        blanketCount: true,
        linenIssuedDate: true,
        // Relations
        room: true,
        complaints: {
          select: {
            id: true,
            subject: true,
            description: true,
            status: true,
            createdAt: true,
          },
        },
        leaves: {
          select: {
            id: true,
            fromDate: true,
            toDate: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.student.count({
      where: {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      },
    }),
    prisma.linenInventory.findFirst(),
  ]);

  return c.json({
    success: true,
    data: students,
    meta: {
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      inventory: inventory
        ? {
            bedsheets: {
              total: inventory.bedsheet,
              inUse: inventory.bedsheetActive,
              available: inventory.bedsheetInHand,
            },
            pillowCovers: {
              total: inventory.pillowCover,
              inUse: inventory.pillowActive,
              available: inventory.pillowInHand,
            },
            blankets: {
              total: inventory.blanket,
              inUse: inventory.blanketActive,
              available: inventory.blanketInHand,
            },
          }
        : null,
    },
  });
});

// ✅ Get single student
studentRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  // Get student with all related data
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      room: true,
      complaints: {
        select: {
          id: true,
          subject: true,
          description: true,
          status: true,
          createdAt: true,
        },
      },
      leaves: {
        select: {
          id: true,
          fromDate: true,
          toDate: true,
          reason: true,
          status: true,
          createdAt: true,
        },
      },
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }

  // Get current linen inventory status
  const inventory = await prisma.linenInventory.findFirst();

  // Return student with enhanced linen information
  return c.json({
    ...student,
    linenInfo: {
      bedsheetCount: student.bedsheetCount,
      pillowCount: student.pillowCount,
      blanketCount: student.blanketCount,
      issuedDate: student.linenIssuedDate,
    },
    inventoryStatus: inventory
      ? {
          bedsheets: {
            total: inventory.bedsheet,
            inUse: inventory.bedsheetActive,
            available: inventory.bedsheetInHand,
          },
          pillowCovers: {
            total: inventory.pillowCover,
            inUse: inventory.pillowActive,
            available: inventory.pillowInHand,
          },
          blankets: {
            total: inventory.blanket,
            inUse: inventory.blanketActive,
            available: inventory.blanketInHand,
          },
        }
      : null,
  });
});

// ✅ Update student
studentRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  try {
    // Validate body to ensure only valid Prisma fields are included
    // Extract only the fields that exist in the Prisma schema
    const validData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      division: body.division,
      course: body.course,
      fromDate: body.fromDate,
      toDate: body.toDate,
      bedsheetCount: body.bedsheetCount,
      pillowCount: body.pillowCount,
      blanketCount: body.blanketCount,
      linenIssuedDate: body.linenIssuedDate,
      roomId:
        typeof body.roomId === "string" ? Number(body.roomId) : body.roomId,
    };

    // Remove undefined fields to avoid Prisma validation errors
    const cleanData = Object.fromEntries(
      Object.entries(validData).filter(([_, v]) => v !== undefined)
    );

    console.log("Student update with cleaned data:", cleanData);

    const updated = await prisma.student.update({
      where: { id },
      data: cleanData,
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
