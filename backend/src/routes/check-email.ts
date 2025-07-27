import { Hono } from "hono";
import prisma from "../db";
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

// Add an endpoint to check if an email already exists in users table
// This will be used before attempting to create a student

const checkEmailRoute = new Hono<UserContext>();

checkEmailRoute.get(
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

export default checkEmailRoute;
