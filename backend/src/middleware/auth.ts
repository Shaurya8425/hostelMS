// src/middleware/auth.ts
import { verify } from "jsonwebtoken";
import { MiddlewareHandler } from "hono";
import prisma from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: "ADMIN" | "STUDENT";
    };
    // Fetch the latest user from the database
    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { student: true },
    });
    if (!userFromDb) return c.json({ error: "User not found" }, 404);
    c.set("user", userFromDb);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid token" }, 403);
  }
};
