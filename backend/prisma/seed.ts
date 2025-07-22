import prisma from "../src/db";
import { hash } from "bcryptjs";

async function main() {
  // Add linen inventory for testing
  await prisma.linenInventory.deleteMany();
  await prisma.linenInventory.create({
    data: { bedsheet: 10, pillowCover: 8 },
  });
  // Delete all data first to avoid unique constraint errors
  // removed feePayment deleteMany
  // await prisma.complaint.deleteMany({});
  // await prisma.leave.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.room.deleteMany({});

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
          gender: i % 2 === 0 ? "MALE" : "FEMALE",
          division: i % 2 === 0 ? "A" : "B",
          course: i % 2 === 0 ? "BTech" : "MTech",
          fromDate: new Date(`2025-07-0${i + 1}`),
          toDate: new Date(`2025-12-0${i + 1}`),
          linenIssued: i % 2 === 0 ? "BEDSHEET" : "PILLOW_COVER",
          user: { connect: { id: user.id } },
        },
      })
    )
  );

  // Create all rooms according to the hostel map
  // Define room status type for type safety
  type RoomStatus = "AVAILABLE" | "BLOCKED" | "RESERVED" | "OCCUPIED";

  const roomsData = [
    // Ground Floor (1-21)
    // Workshop Side (1-10)
    ...[1, 3, 4, 6, 7, 8, 9].map((num) => ({
      roomNumber: String(num),
      block: "A-Wing",
      floor: 0,
      designation: null,
      capacity: 3,
      status: "AVAILABLE" as RoomStatus,
    })),
    {
      roomNumber: "2",
      block: "A-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "5",
      block: "A-Wing",
      floor: 0,
      designation: "APO",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "10",
      block: "A-Wing",
      floor: 0,
      designation: "SETHI",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Toilet at the end of Workshop Side
    {
      roomNumber: "T-G-1",
      block: "A-Wing",
      floor: 0,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // STC Side (11-21)
    ...[11, 12, 13, 14, 15, 16, 17, 18, 19, 21].map((num) => ({
      roomNumber: String(num),
      block: "A-Wing",
      floor: 0,
      designation: null,
      capacity: 3,
      status: "AVAILABLE" as RoomStatus,
    })),
    {
      roomNumber: "20",
      block: "A-Wing",
      floor: 0,
      designation: "Nasir",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Bathroom at the end of STC Side
    {
      roomNumber: "B-G-1",
      block: "A-Wing",
      floor: 0,
      designation: "bathroom",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // First Floor (22-43)
    ...[22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32].map((num) => ({
      roomNumber: String(num),
      block: "A-Wing",
      floor: 1,
      designation: null,
      capacity: 3,
      status: "AVAILABLE" as RoomStatus,
    })),
    // Toilet on First Floor
    {
      roomNumber: "T-F-1",
      block: "A-Wing",
      floor: 1,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Store room and other rooms on First Floor
    {
      roomNumber: "33",
      block: "A-Wing",
      floor: 1,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    ...[34, 35, 36, 37, 38, 39, 40, 41, 42, 43].map((num) => ({
      roomNumber: String(num),
      block: "A-Wing",
      floor: 1,
      designation: null,
      capacity: 3,
      status: "AVAILABLE" as RoomStatus,
    })),
    // Bathroom on First Floor
    {
      roomNumber: "B-F-1",
      block: "A-Wing",
      floor: 1,
      designation: "bathroom",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
  ];

  const rooms = await Promise.all(
    roomsData.map((room) => prisma.room.create({ data: room }))
  );

  // Get available rooms (not blocked or reserved)
  const availableRooms = rooms.filter(
    (room) => room.status !== "BLOCKED" && room.status !== "RESERVED"
  );

  // Assign students to available rooms only
  for (let i = 0; i < students.length; i++) {
    // Only assign if there are available rooms
    if (availableRooms.length > 0) {
      await prisma.student.update({
        where: { id: students[i].id },
        data: { roomId: availableRooms[i % availableRooms.length].id },
      });
    }
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
  // removed fee payments creation

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
