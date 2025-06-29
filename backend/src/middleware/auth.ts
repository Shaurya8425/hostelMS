// src/middleware/auth.ts
import { verify } from "jsonwebtoken";
import { MiddlewareHandler } from "hono";

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
    c.set("user", decoded); // store user in context
    await next();
  } catch (err) {
    return c.json({ error: "Invalid token" }, 403);
  }
};
