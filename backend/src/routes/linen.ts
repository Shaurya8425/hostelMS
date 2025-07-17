import { Hono } from "hono";
import prisma from "../db";

const linenRoute = new Hono();

// Get linen inventory counts
linenRoute.get("/inventory", async (c) => {
  let inventory = await prisma.linenInventory.findFirst();
  if (!inventory) {
    // Initialize if not present
    inventory = await prisma.linenInventory.create({
      data: { bedsheet: 0, pillowCover: 0 },
    });
  }
  return c.json({
    bedsheet: inventory.bedsheet,
    pillowCover: inventory.pillowCover,
  });
});

// Update linen inventory counts (admin only, simple version)
linenRoute.put("/inventory", async (c) => {
  const { bedsheet, pillowCover } = await c.req.json();
  let inventory = await prisma.linenInventory.findFirst();
  if (!inventory) {
    inventory = await prisma.linenInventory.create({
      data: { bedsheet: bedsheet || 0, pillowCover: pillowCover || 0 },
    });
  } else {
    inventory = await prisma.linenInventory.update({
      where: { id: inventory.id },
      data: { bedsheet, pillowCover },
    });
  }
  return c.json({
    bedsheet: inventory.bedsheet,
    pillowCover: inventory.pillowCover,
  });
});

export default linenRoute;
