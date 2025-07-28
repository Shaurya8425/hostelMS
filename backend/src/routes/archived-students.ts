import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { allowRole } from "../middleware/role";
import prisma from "../db";

const app = new Hono();

// Get all archived students with pagination and search
app.get("/", authMiddleware, allowRole(["ADMIN"]), async (c) => {
  try {
    const { search = "", page = "1", limit = "10" } = c.req.query();

    const searchQuery = search as string;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { email: { contains: searchQuery, mode: "insensitive" as const } },
            { phone: { contains: searchQuery, mode: "insensitive" as const } },
            {
              designation: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              ticketNumber: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [archivedStudents, totalCount] = await Promise.all([
      prisma.archivedStudent.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { deletedAt: "desc" },
      }),
      prisma.archivedStudent.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return c.json({
      data: archivedStudents,
      currentPage: pageNum,
      totalPages,
      totalCount,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    console.error("Error fetching archived students:", error);
    return c.json(
      {
        error: "Failed to fetch archived students",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Get a specific archived student by ID
app.get("/:id", authMiddleware, allowRole(["ADMIN"]), async (c) => {
  try {
    const id = c.req.param("id");

    const archivedStudent = await prisma.archivedStudent.findUnique({
      where: { id: parseInt(id) },
    });

    if (!archivedStudent) {
      return c.json({ error: "Archived student not found" }, 404);
    }

    return c.json(archivedStudent);
  } catch (error) {
    console.error("Error fetching archived student:", error);
    return c.json(
      {
        error: "Failed to fetch archived student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Search archived students by original student ID
app.get(
  "/original/:originalId",
  authMiddleware,
  allowRole(["ADMIN"]),
  async (c) => {
    try {
      const originalId = c.req.param("originalId");

      const archivedStudent = await prisma.archivedStudent.findFirst({
        where: { originalId: parseInt(originalId) },
      });

      if (!archivedStudent) {
        return c.json({ error: "Archived student not found" }, 404);
      }

      return c.json(archivedStudent);
    } catch (error) {
      console.error("Error fetching archived student by original ID:", error);
      return c.json(
        {
          error: "Failed to fetch archived student",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }
);

// Permanently delete an archived student (admin only)
app.delete("/:id", authMiddleware, allowRole(["ADMIN"]), async (c) => {
  try {
    const id = c.req.param("id");

    const archivedStudent = await prisma.archivedStudent.findUnique({
      where: { id: parseInt(id) },
    });

    if (!archivedStudent) {
      return c.json({ error: "Archived student not found" }, 404);
    }

    await prisma.archivedStudent.delete({
      where: { id: parseInt(id) },
    });

    return c.json({ message: "Archived student permanently deleted" });
  } catch (error) {
    console.error("Error deleting archived student:", error);
    return c.json(
      {
        error: "Failed to delete archived student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default app;
