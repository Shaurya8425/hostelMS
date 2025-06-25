import dotenv from "dotenv";
dotenv.config();

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import prisma from "./db";
import auth from "./routes/auth";

const app = new Hono();

app.route('auth', auth);

app.get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

serve({ fetch: app.fetch, port: 3000 });
