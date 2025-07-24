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

// ✅ Get all Rooms
roomRoute.get("/", async (c) => {
  const rooms = await prisma.room.findMany({
    include: { students: true },
  });
  return c.json(rooms);
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
  const { studentEmail, roomId } = await c.req.json();

  // Check if room exists
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return c.json({ error: "Room not found" }, 404);

  // Check if room is blocked or reserved
  if (room.status === "BLOCKED" || room.status === "RESERVED") {
    return c.json(
      { error: "Cannot assign students to blocked or reserved rooms" },
      400
    );
  }

  // Check capacity using count (more reliable than relation size)
  const currentCount = await prisma.student.count({
    where: { roomId },
  });

  if (currentCount >= room.capacity) {
    return c.json({ error: "Room is full" }, 400);
  }

  // Update student with new roomId using email
  try {
    const updatedStudent = await prisma.student.update({
      where: { email: studentEmail },
      data: { roomId },
    });

    return c.json(updatedStudent);
  } catch (error) {
    return c.json({ error: "Failed to assign room", details: error }, 400);
  }
});

export default roomRoute;
