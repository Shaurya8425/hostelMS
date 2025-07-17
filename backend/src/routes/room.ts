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

// ✅ Assign student to room
roomRoute.put("/assign", async (c) => {
  const { studentEmail, roomId } = await c.req.json();

  // Check if room exists
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return c.json({ error: "Room not found" }, 404);

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
