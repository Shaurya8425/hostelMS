import { Hono } from "hono";
import { serve } from "@hono/node-server";
import prisma from "./db";
import "dotenv/config";

const app = new Hono();

app.get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

serve({ fetch: app.fetch, port: 3000 });
