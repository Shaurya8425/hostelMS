import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { allowRole } from "../middleware/role";
import prisma from "../db";

const app = new Hono();

// Calculate bed days occupancy with time filter
app.get("/", authMiddleware, allowRole(["ADMIN"]), async (c) => {
  try {
    const { startDate, endDate } = c.req.query();

    if (!startDate || !endDate) {
      return c.json(
        {
          error: "Both startDate and endDate are required",
        },
        400
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return c.json(
        {
          error: "Start date must be before end date",
        },
        400
      );
    }

    // Get all rooms to calculate total bed capacity
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        roomNumber: true,
        block: true,
        capacity: true,
      },
    });

    const totalBeds = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const totalPossibleBedDays =
      totalBeds *
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Get current students with overlapping dates
    const currentStudents = await prisma.student.findMany({
      where: {
        OR: [
          {
            AND: [{ fromDate: { lte: end } }, { toDate: { gte: start } }],
          },
          {
            AND: [{ fromDate: { lte: end } }, { toDate: null }],
          },
          {
            AND: [{ fromDate: null }, { toDate: { gte: start } }],
          },
          {
            AND: [{ fromDate: null }, { toDate: null }],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        fromDate: true,
        toDate: true,
        room: {
          select: {
            roomNumber: true,
            block: true,
          },
        },
      },
    });

    // Get archived students with overlapping dates
    const archivedStudents = await prisma.archivedStudent.findMany({
      where: {
        OR: [
          {
            AND: [{ fromDate: { lte: end } }, { toDate: { gte: start } }],
          },
          {
            AND: [{ fromDate: { lte: end } }, { toDate: null }],
          },
          {
            AND: [{ fromDate: null }, { toDate: { gte: start } }],
          },
          {
            AND: [{ fromDate: null }, { toDate: null }],
          },
        ],
        deletedAt: { gte: start }, // Only include students deleted after the start date
      },
      select: {
        id: true,
        name: true,
        fromDate: true,
        toDate: true,
        roomNumber: true,
        deletedAt: true,
      },
    });

    // Calculate bed days for current students
    let totalOccupiedBedDays = 0;
    const studentOccupancy: Array<{
      studentId: number;
      studentName: string;
      room: string;
      bedDays: number;
      fromDate: string;
      toDate: string;
      type: "current" | "archived";
    }> = [];

    // Process current students
    currentStudents.forEach((student) => {
      const studentStart = student.fromDate
        ? new Date(student.fromDate)
        : start;
      const studentEnd = student.toDate ? new Date(student.toDate) : end;

      // Calculate overlap with the requested date range
      const overlapStart = new Date(
        Math.max(studentStart.getTime(), start.getTime())
      );
      const overlapEnd = new Date(
        Math.min(studentEnd.getTime(), end.getTime())
      );

      if (overlapStart <= overlapEnd) {
        const bedDays =
          Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;
        totalOccupiedBedDays += bedDays;

        studentOccupancy.push({
          studentId: student.id,
          studentName: student.name,
          room: student.room
            ? `${student.room.roomNumber} (${student.room.block})`
            : "No Room",
          bedDays,
          fromDate: overlapStart.toISOString().split("T")[0],
          toDate: overlapEnd.toISOString().split("T")[0],
          type: "current",
        });
      }
    });

    // Process archived students
    archivedStudents.forEach((student) => {
      const studentStart = student.fromDate
        ? new Date(student.fromDate)
        : start;
      const studentEnd = student.toDate
        ? new Date(student.toDate)
        : new Date(student.deletedAt);

      // Calculate overlap with the requested date range
      const overlapStart = new Date(
        Math.max(studentStart.getTime(), start.getTime())
      );
      const overlapEnd = new Date(
        Math.min(studentEnd.getTime(), end.getTime())
      );

      if (overlapStart <= overlapEnd) {
        const bedDays =
          Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;
        totalOccupiedBedDays += bedDays;

        studentOccupancy.push({
          studentId: student.id,
          studentName: student.name,
          room: student.roomNumber || "No Room",
          bedDays,
          fromDate: overlapStart.toISOString().split("T")[0],
          toDate: overlapEnd.toISOString().split("T")[0],
          type: "archived",
        });
      }
    });

    // Calculate occupancy percentage
    const occupancyPercentage =
      totalPossibleBedDays > 0
        ? (totalOccupiedBedDays / totalPossibleBedDays) * 100
        : 0;

    // Calculate wing-wise statistics
    const wingStats: {
      [key: string]: {
        totalBeds: number;
        occupiedBedDays: number;
        totalPossibleBedDays: number;
        occupancyPercentage: number;
      };
    } = {};

    rooms.forEach((room) => {
      if (!wingStats[room.block]) {
        wingStats[room.block] = {
          totalBeds: 0,
          occupiedBedDays: 0,
          totalPossibleBedDays: 0,
          occupancyPercentage: 0,
        };
      }
      wingStats[room.block].totalBeds += room.capacity;
      wingStats[room.block].totalPossibleBedDays +=
        room.capacity *
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });

    // Calculate occupied bed days per wing
    studentOccupancy.forEach((occupancy) => {
      const wingMatch = occupancy.room.match(/\(([^)]+)\)/);
      const wing = wingMatch ? wingMatch[1] : "Unknown";
      if (wingStats[wing]) {
        wingStats[wing].occupiedBedDays += occupancy.bedDays;
      }
    });

    // Calculate occupancy percentage for each wing
    Object.keys(wingStats).forEach((wing) => {
      wingStats[wing].occupancyPercentage =
        wingStats[wing].totalPossibleBedDays > 0
          ? (wingStats[wing].occupiedBedDays /
              wingStats[wing].totalPossibleBedDays) *
            100
          : 0;
    });

    return c.json({
      dateRange: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        totalDays: Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      summary: {
        totalBeds,
        totalPossibleBedDays,
        totalOccupiedBedDays,
        occupancyPercentage: parseFloat(occupancyPercentage.toFixed(2)),
        availableBedDays: totalPossibleBedDays - totalOccupiedBedDays,
      },
      wingStats,
      studentOccupancy: studentOccupancy.sort((a, b) => b.bedDays - a.bedDays),
    });
  } catch (error) {
    console.error("Error calculating bed days occupancy:", error);
    return c.json(
      {
        error: "Failed to calculate bed days occupancy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default app;
