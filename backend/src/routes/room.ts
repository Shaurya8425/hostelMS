// src/routes/room.ts
import { Hono } from "hono";
import prisma from "../db";
import { roomSchema } from "../schemas/roomSchema";

const roomRoute = new Hono();

// ✅ Create Room
roomRoute.post("/", async (c) => {
  const body = await c.req.json();
  const result = roomSchema.safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.flatten() },
      400
    );
  }

  try {
    const room = await prisma.room.create({ data: result.data });
    return c.json(room, 201);
  } catch (error) {
    return c.json({ error: "Room creation failed", details: error }, 400);
  }
});

// ✅ Assign student to room
roomRoute.put("/assign", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received request body:", body);

    const { studentId, roomId } = body;

    // Basic input validation
    if (!studentId || !roomId) {
      console.log("Missing required fields:", { studentId, roomId });
      return c.json({ error: "Student ID and Room ID are required" }, 400);
    }

    // Ensure we have numeric values
    const parsedStudentId =
      typeof studentId === "string" ? parseInt(studentId) : studentId;
    const parsedRoomId = typeof roomId === "string" ? parseInt(roomId) : roomId;

    console.log("Parsed values:", {
      original: { studentId, roomId },
      parsed: { parsedStudentId, parsedRoomId },
      types: {
        original: { studentId: typeof studentId, roomId: typeof roomId },
        parsed: {
          parsedStudentId: typeof parsedStudentId,
          parsedRoomId: typeof parsedRoomId,
        },
      },
    });

    // Validation checks
    if (
      typeof parsedStudentId !== "number" ||
      typeof parsedRoomId !== "number"
    ) {
      console.log("Type validation failed:", {
        parsedStudentId: {
          value: parsedStudentId,
          type: typeof parsedStudentId,
        },
        parsedRoomId: { value: parsedRoomId, type: typeof parsedRoomId },
      });
      return c.json(
        {
          error: "Invalid ID types",
          details: {
            expected: { studentId: "number", roomId: "number" },
            received: {
              studentId: { value: studentId, type: typeof studentId },
              roomId: { value: roomId, type: typeof roomId },
            },
          },
        },
        400
      );
    }

    if (isNaN(parsedStudentId) || isNaN(parsedRoomId)) {
      console.log("NaN check failed:", {
        parsedStudentId: {
          value: parsedStudentId,
          isNaN: isNaN(parsedStudentId),
        },
        parsedRoomId: { value: parsedRoomId, isNaN: isNaN(parsedRoomId) },
      });
      return c.json(
        {
          error: "Invalid Student ID or Room ID",
          details: {
            studentId: { original: studentId, parsed: parsedStudentId },
            roomId: { original: roomId, parsed: parsedRoomId },
          },
        },
        400
      );
    }

    if (parsedStudentId <= 0 || parsedRoomId <= 0) {
      console.log("Invalid ID values:", { parsedStudentId, parsedRoomId });
      return c.json(
        {
          error: "Invalid ID values",
          details: {
            studentId: parsedStudentId,
            roomId: parsedRoomId,
            message: "IDs must be positive numbers",
          },
        },
        400
      );
    }

    // Run all checks in parallel for better performance
    const [student, room, existingAssignment] = await Promise.all([
      // Check if student exists
      prisma.student.findUnique({
        where: { id: parsedStudentId },
        include: { room: true },
      }),
      // Check if room exists and get its details
      prisma.room.findUnique({
        where: { id: parsedRoomId },
        include: {
          _count: {
            select: { students: true },
          },
        },
      }),
      // Check if student is already assigned to a room
      prisma.student.findFirst({
        where: {
          id: parsedStudentId,
          roomId: { not: null },
        },
      }),
    ]);

    // Validate all conditions
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    if (room.status === "BLOCKED" || room.status === "RESERVED") {
      return c.json(
        {
          error: "Cannot assign student to this room",
          reason: `Room is ${room.status.toLowerCase()}`,
        },
        400
      );
    }

    // Check capacity unless it's the same room
    if (
      existingAssignment?.roomId !== parsedRoomId &&
      room._count.students >= room.capacity
    ) {
      return c.json(
        {
          error: "Room is full",
          capacity: room.capacity,
          current: room._count.students,
        },
        400
      );
    }

    // Perform the assignment in a transaction
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // If student is currently assigned to a room
      if (existingAssignment?.roomId) {
        // Get current student count in the old room
        const oldRoomStudentCount = await tx.student.count({
          where: { roomId: existingAssignment.roomId },
        });

        // If this was the last student in the old room, mark it as available
        if (oldRoomStudentCount === 1) {
          await tx.room.update({
            where: { id: existingAssignment.roomId },
            data: { status: "AVAILABLE" },
          });
        }
      }

      // Assign student to new room
      const updated = await tx.student.update({
        where: { id: parsedStudentId },
        data: { roomId: parsedRoomId },
        include: { room: true },
      });

      // Update new room status to occupied
      await tx.room.update({
        where: { id: parsedRoomId },
        data: { status: "OCCUPIED" },
      });

      return updated;
    });

    return c.json({
      message: "Student successfully assigned to room",
      data: {
        student: {
          id: updatedStudent.id,
          name: updatedStudent.name,
          email: updatedStudent.email,
        },
        room: updatedStudent.room,
      },
    });
  } catch (error) {
    console.error("Room assignment error:", error);
    return c.json(
      {
        error: "Failed to assign room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// ✅ Get all Rooms with pagination
roomRoute.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const search = c.req.query("search") || "";

  const skip = (page - 1) * limit;

  // Build where clause for search
  const whereClause = search
    ? {
        OR: [
          { roomNumber: { contains: search, mode: "insensitive" as const } },
          { block: { contains: search, mode: "insensitive" as const } },
          { designation: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where: whereClause,
      include: {
        students: true,
        _count: {
          select: { students: true },
        },
      },
      skip,
      take: limit,
      orderBy: [{ block: "asc" }, { roomNumber: "asc" }],
    }),
    prisma.room.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return c.json({
    data: rooms,
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

// ✅ Get Room by ID
roomRoute.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid room ID" }, 400);
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    return c.json(room);
  } catch (error) {
    return c.json({ error: "Failed to fetch room details" }, 500);
  }
});

// ✅ Update Room
roomRoute.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid room ID" }, 400);
  }

  const body = await c.req.json();
  const result = roomSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { error: "Validation failed", details: result.error.flatten() },
      400
    );
  }

  try {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    // If room is occupied, don't allow reducing capacity below current occupancy
    if (result.data.capacity < room.capacity) {
      const currentOccupancy = await prisma.student.count({
        where: { roomId: id },
      });

      if (currentOccupancy > result.data.capacity) {
        return c.json(
          {
            error: "Cannot reduce capacity below current occupancy",
          },
          400
        );
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: result.data,
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return c.json(updatedRoom);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return c.json({ error: "Room number already exists" }, 400);
    }
    return c.json({ error: "Failed to update room" }, 500);
  }
});

// ✅ Assign student to room
roomRoute.put("/assign", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received request body:", body);

    const { studentId, roomId } = body;

    // Basic input validation
    if (!studentId || !roomId) {
      console.log("Missing required fields:", { studentId, roomId });
      return c.json({ error: "Student ID and Room ID are required" }, 400);
    }

    // Ensure we have numeric values
    const parsedStudentId =
      typeof studentId === "string" ? parseInt(studentId) : studentId;
    const parsedRoomId = typeof roomId === "string" ? parseInt(roomId) : roomId;

    console.log("Parsed values:", {
      original: { studentId, roomId },
      parsed: { parsedStudentId, parsedRoomId },
      types: {
        original: { studentId: typeof studentId, roomId: typeof roomId },
        parsed: {
          parsedStudentId: typeof parsedStudentId,
          parsedRoomId: typeof parsedRoomId,
        },
      },
    });

    // Validation checks
    if (
      typeof parsedStudentId !== "number" ||
      typeof parsedRoomId !== "number"
    ) {
      console.log("Type validation failed:", {
        parsedStudentId: {
          value: parsedStudentId,
          type: typeof parsedStudentId,
        },
        parsedRoomId: { value: parsedRoomId, type: typeof parsedRoomId },
      });
      return c.json(
        {
          error: "Invalid ID types",
          details: {
            expected: { studentId: "number", roomId: "number" },
            received: {
              studentId: { value: studentId, type: typeof studentId },
              roomId: { value: roomId, type: typeof roomId },
            },
          },
        },
        400
      );
    }

    if (isNaN(parsedStudentId) || isNaN(parsedRoomId)) {
      console.log("NaN check failed:", {
        parsedStudentId: {
          value: parsedStudentId,
          isNaN: isNaN(parsedStudentId),
        },
        parsedRoomId: { value: parsedRoomId, isNaN: isNaN(parsedRoomId) },
      });
      return c.json(
        {
          error: "Invalid Student ID or Room ID",
          details: {
            studentId: { original: studentId, parsed: parsedStudentId },
            roomId: { original: roomId, parsed: parsedRoomId },
          },
        },
        400
      );
    }

    if (parsedStudentId <= 0 || parsedRoomId <= 0) {
      console.log("Invalid ID values:", { parsedStudentId, parsedRoomId });
      return c.json(
        {
          error: "Invalid ID values",
          details: {
            studentId: parsedStudentId,
            roomId: parsedRoomId,
            message: "IDs must be positive numbers",
          },
        },
        400
      );
    }

    // Run all checks in parallel for better performance
    const [student, room, existingAssignment] = await Promise.all([
      // Check if student exists
      prisma.student.findUnique({
        where: { id: parsedStudentId },
        include: { room: true },
      }),
      // Check if room exists and get its details
      prisma.room.findUnique({
        where: { id: parsedRoomId },
        include: {
          _count: {
            select: { students: true },
          },
        },
      }),
      // Check if student is already assigned to a room
      prisma.student.findFirst({
        where: {
          id: parsedStudentId,
          roomId: { not: null },
        },
      }),
    ]);

    // Validate all conditions
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    if (existingAssignment) {
      return c.json(
        {
          error: "Student is already assigned to a room",
          currentRoom: existingAssignment.roomId,
        },
        400
      );
    }

    if (room.status === "BLOCKED" || room.status === "RESERVED") {
      return c.json(
        {
          error: "Cannot assign student to this room",
          reason: `Room is ${room.status.toLowerCase()}`,
        },
        400
      );
    }

    if (room._count.students >= room.capacity) {
      return c.json(
        {
          error: "Room is full",
          capacity: room.capacity,
          current: room._count.students,
        },
        400
      );
    }

    // Perform the assignment in a transaction
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // Assign student to room
      const updated = await tx.student.update({
        where: { id: parsedStudentId },
        data: { roomId: parsedRoomId },
        include: { room: true },
      });

      // Update room status if it's the first student
      const roomOccupancy = await tx.student.count({
        where: { roomId: parsedRoomId },
      });

      if (roomOccupancy > 0) {
        await tx.room.update({
          where: { id: parsedRoomId },
          data: { status: "OCCUPIED" },
        });
      }

      return updated;
    });

    return c.json({
      message: "Student successfully assigned to room",
      data: {
        student: {
          id: updatedStudent.id,
          name: updatedStudent.name,
          email: updatedStudent.email,
        },
        room: updatedStudent.room,
      },
    });
  } catch (error) {
    console.error("Room assignment error:", error);
    return c.json(
      {
        error: "Failed to assign room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default roomRoute;
