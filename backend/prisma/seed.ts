import prisma from "../src/db";
import { hash } from "bcryptjs";

async function main() {
  // Create 2 admins
  const admins = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin1@hostel.com",
        password: await hash("admin123", 10),
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        email: "admin2@hostel.com",
        password: await hash("admin123", 10),
        role: "ADMIN",
      },
    }),
  ]);

  // Create 5 student users
  const studentUsers = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) =>
      prisma.user.create({
        data: {
          email: `student${i + 1}@hostel.com`,
          password: await hash("student123", 10),
          role: "STUDENT",
        },
      })
    )
  );

  // Create 5 students
  const students = await Promise.all(
    studentUsers.map((user, i) =>
      prisma.student.create({
        data: {
          name: `Student ${i + 1}`,
          email: user.email,
          phone: `123456789${i}`,
          branch: i % 2 === 0 ? "CSE" : "ECE",
          year: (i % 4) + 1,
          rollNumber: `BR${i + 1}2023`,
          gender: i % 2 === 0 ? "MALE" : "FEMALE",
          user: { connect: { id: user.id } },
        },
      })
    )
  );

  // Create 10 rooms with floor, designation, block, status
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        roomNumber: "1",
        block: "A-Wing",
        floor: 0,
        designation: null,
        capacity: 3,
        status: "AVAILABLE",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "2",
        block: "A-Wing",
        floor: 0,
        designation: "store",
        capacity: 0,
        status: "BLOCKED",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "5",
        block: "A-Wing",
        floor: 0,
        designation: "APO",
        capacity: 1,
        status: "BLOCKED",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "10",
        block: "A-Wing",
        floor: 0,
        designation: "SETHI",
        capacity: 1,
        status: "BLOCKED",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "20",
        block: "A-Wing",
        floor: 0,
        designation: "Nasir",
        capacity: 1,
        status: "BLOCKED",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "14",
        block: "A-Wing",
        floor: 0,
        designation: null,
        capacity: 3,
        status: "AVAILABLE",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "21",
        block: "A-Wing",
        floor: 0,
        designation: null,
        capacity: 3,
        status: "AVAILABLE",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "22",
        block: "A-Wing",
        floor: 1,
        designation: null,
        capacity: 3,
        status: "AVAILABLE",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "43",
        block: "A-Wing",
        floor: 1,
        designation: "store",
        capacity: 0,
        status: "BLOCKED",
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: "33",
        block: "A-Wing",
        floor: 1,
        designation: null,
        capacity: 3,
        status: "AVAILABLE",
      },
    }),
  ]);

  // Assign students to rooms (1 per room, rest unassigned)
  for (let i = 0; i < students.length; i++) {
    await prisma.student.update({
      where: { id: students[i].id },
      data: { roomId: rooms[i % rooms.length].id },
    });
  }

  // Create 5 complaints
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.complaint.create({
        data: {
          subject: `Complaint ${i + 1}`,
          description: `Description for complaint ${i + 1}`,
          studentId: students[i].id,
          status:
            i % 3 === 0 ? "RESOLVED" : i % 3 === 1 ? "REJECTED" : "PENDING",
        },
      })
    )
  );

  // Create 5 leaves
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.leave.create({
        data: {
          fromDate: new Date(`2025-07-${10 + i}`),
          toDate: new Date(`2025-07-${11 + i}`),
          reason: `Leave reason ${i + 1}`,
          studentId: students[i].id,
          status: i % 2 === 0 ? "PENDING" : "APPROVED",
        },
      })
    )
  );

  // Create 5 fee payments
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.feePayment.create({
        data: {
          studentId: students[i].id,
          amount: 5000 + i * 1000,
          dueDate: new Date(`2025-08-0${i + 1}`),
          status: i % 2 === 0 ? "PENDING" : "PAID",
        },
      })
    )
  );

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
