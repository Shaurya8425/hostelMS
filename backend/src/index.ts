import dotenv from "dotenv";
dotenv.config();

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import prisma from "./db";
import auth from "./routes/auth";
import studentRoute from "./routes/student";
import roomRoute from "./routes/room";
import leaveRoute from "./routes/leave";
import complaintRoute from "./routes/complaint";
import feeRoute from "./routes/fee";

const app = new Hono();
app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // or '*' for all origins
    credentials: true,
  })
);

app.route("/auth", auth);
app.route("/students", studentRoute);
app.route("/rooms", roomRoute);
app.route("/leaves", leaveRoute);
app.route("/complaints", complaintRoute);
app.route("/payments", feeRoute);

app.get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 3000 });
