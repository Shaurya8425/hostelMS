// src/middleware/role.ts
import { MiddlewareHandler } from "hono";

export const allowRole = (
  roles: ("ADMIN" | "STUDENT")[]
): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ error: "Forbidden: Access denied" }, 403);
    }
    await next();
  };
};
