import { Hono } from "hono";
import prisma from "../db";

const linenRoute = new Hono();

// Get linen inventory counts with detailed status
linenRoute.get("/inventory", async (c) => {
  let inventory = await prisma.linenInventory.findFirst();
  if (!inventory) {
    // Initialize if not present
    inventory = await prisma.linenInventory.create({
      data: {
        bedsheet: 0,
        bedsheetActive: 0,
        bedsheetInHand: 0,
        pillowCover: 0,
        pillowActive: 0,
        pillowInHand: 0,
        blanket: 0,
        blanketActive: 0,
        blanketInHand: 0,
      },
    });
  }
  return c.json(inventory);
});

// Get detailed linen statistics
linenRoute.get("/stats", async (c) => {
  const inventory = await prisma.linenInventory.findFirst();
  const issuedStats = await prisma.student.aggregate({
    _count: {
      _all: true,
    },
    where: {
      OR: [
        { bedsheetCount: { gt: 0 } },
        { pillowCount: { gt: 0 } },
        { blanketCount: { gt: 0 } },
      ],
    },
  });

  const recentIssues = await prisma.student.findMany({
    where: {
      OR: [
        { bedsheetCount: { gt: 0 } },
        { pillowCount: { gt: 0 } },
        { blanketCount: { gt: 0 } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      bedsheetCount: true,
      pillowCount: true,
      blanketCount: true,
      linenIssuedDate: true,
    },
    orderBy: {
      linenIssuedDate: "desc",
    },
    take: 10,
  });

  return c.json({
    inventory,
    issuedStats,
    recentIssues,
  });
});

// Update linen inventory
linenRoute.put("/inventory", async (c) => {
  const updates = await c.req.json();
  let inventory = await prisma.linenInventory.findFirst();

  if (!inventory) {
    inventory = await prisma.linenInventory.create({
      data: updates,
    });
  } else {
    inventory = await prisma.linenInventory.update({
      where: { id: inventory.id },
      data: updates,
    });
  }

  return c.json(inventory);
});

// Issue linen items to a student
linenRoute.post("/issue/:studentId", async (c) => {
  const studentId = parseInt(c.req.param("studentId"));
  const { blanket = false } = await c.req.json();

  // Start a transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Get current inventory
    const inventory = await tx.linenInventory.findFirst();
    if (!inventory) throw new Error("Inventory not initialized");

    // Check if we have enough items
    if (inventory.bedsheetInHand < 1 || inventory.pillowInHand < 2) {
      throw new Error("Insufficient items in inventory");
    }

    if (blanket && inventory.blanketInHand < 1) {
      throw new Error("Insufficient blankets in inventory");
    }

    // Update student
    const student = await tx.student.update({
      where: { id: studentId },
      data: {
        bedsheetCount: 1,
        pillowCount: 2,
        blanketCount: blanket ? 1 : 0,
        linenIssuedDate: new Date(),
      },
    });

    // Update inventory counts
    await tx.linenInventory.update({
      where: { id: inventory.id },
      data: {
        bedsheetInHand: inventory.bedsheetInHand - 1,
        bedsheetActive: inventory.bedsheetActive + 1,
        pillowInHand: inventory.pillowInHand - 2,
        pillowActive: inventory.pillowActive + 2,
        ...(blanket
          ? {
              blanketInHand: inventory.blanketInHand - 1,
              blanketActive: inventory.blanketActive + 1,
            }
          : {}),
      },
    });

    return student;
  });

  return c.json(result);
});

export default linenRoute;
