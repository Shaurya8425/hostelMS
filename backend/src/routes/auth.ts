import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db";

// Add type declaration for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
    }
  }
}

const auth = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

// Signup
auth.post(
  "/signup",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["ADMIN", "USER"]).optional(),
    })
  ),
  async (c) => {
    const { name, email, password, role = "USER" } = c.req.valid("json");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return c.json({ error: "Email already registered" }, 400);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    return c.json({
      message: "Signup successful",
      user: { id: user.id, email: user.email },
    });
  }
);

// Login
auth.post(
  "/login",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return c.json({ error: "Invalid credentials" }, 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({ message: "Login successful", token });
  }
);

export default auth;
