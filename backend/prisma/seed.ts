import prisma from "../src/db";
import { hash } from "bcryptjs";

async function main() {
  // Add linen inventory for testing
  await prisma.linenInventory.deleteMany();
  await prisma.linenInventory.create({
    data: {
      bedsheet: 100,
      bedsheetActive: 20,
      bedsheetInHand: 80,
      pillowCover: 150,
      pillowActive: 30,
      pillowInHand: 120,
      blanket: 75,
      blanketActive: 15,
      blanketInHand: 60,
    },
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
          user: { connect: { id: user.id } },
        },
      })
    )
  );

  // Create all rooms according to the hostel map
  // Define room status type for type safety
  type RoomStatus = "AVAILABLE" | "BLOCKED" | "RESERVED" | "OCCUPIED";

  const roomsData = [
    // A-Wing Rooms
    // Ground Floor (1-21)
    // Workshop Side (1-10)
    ...[1, 3, 4, 6, 7, 8, 9].map((num) => ({
      roomNumber: String(num),
      block: "A-Wing",
      floor: 0,
      designation: null,
      capacity: 1,
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
      capacity: 1,
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
      capacity: 1,
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
      capacity: 1,
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

    // B-Wing Rooms based on the floor plan
    // B-Wing Ground Floor (44-62)
    // Regular rooms on Ground Floor (4 beds each)
    ...[45, 46, 47, 48, 50, 51, 52, 55, 57, 58, 59, 60, 61].map((num) => ({
      roomNumber: String(num),
      block: "B-Wing",
      floor: 0,
      designation: null,
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    })),
    // Special purpose rooms on Ground Floor
    {
      roomNumber: "44",
      block: "B-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "49",
      block: "B-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "53",
      block: "B-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "54",
      block: "B-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "56",
      block: "B-Wing",
      floor: 0,
      designation: "GYM",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "62",
      block: "B-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Toilets and Bathrooms on Ground Floor
    {
      roomNumber: "B-G-2",
      block: "B-Wing",
      floor: 0,
      designation: "bathroom",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "B-G-3",
      block: "B-Wing",
      floor: 0,
      designation: "bathroom",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "T-G-2",
      block: "B-Wing",
      floor: 0,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "T-G-3",
      block: "B-Wing",
      floor: 0,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Common Room
    {
      roomNumber: "CR-1",
      block: "B-Wing",
      floor: 0,
      designation: "Common Room",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // B-Wing First Floor (63-86)
    // Regular rooms on First Floor (4 beds each) - corrected sequence based on floor plan
    ...[
      // Bathroom side rooms
      63, 64, 65, 66, 67, 68,
      // Electric store area
      69, 70, 71, 72, 73,
      // Store room side (in sequence)
      75, 76, 77, 78, 79, 80,
      // Toilet side rooms (in reverse sequence for proper layout)
      // These will be overridden by individual room definitions below
      // 86, 85, 84,
    ].map((num) => ({
      roomNumber: String(num),
      block: "B-Wing",
      floor: 1,
      designation: null,
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    })),
    // Special purpose rooms on First Floor
    {
      roomNumber: "74",
      block: "B-Wing",
      floor: 1,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Dormitory rooms (same 4-bed capacity as regular rooms) - in sequence based on floor plan
    {
      roomNumber: "83",
      block: "B-Wing",
      floor: 1,
      designation: "Dormitory",
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    },
    {
      roomNumber: "82",
      block: "B-Wing",
      floor: 1,
      designation: "Dormitory",
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    },
    {
      roomNumber: "81",
      block: "B-Wing",
      floor: 1,
      designation: "Dormitory",
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    },
    // Electric Store
    {
      roomNumber: "ES-1",
      block: "B-Wing",
      floor: 1,
      designation: "Electric store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    // Special purpose rooms - in reverse sequence for proper layout
    {
      roomNumber: "86",
      block: "B-Wing",
      floor: 1,
      designation: "Staff",
      capacity: 1,
      status: "AVAILABLE" as RoomStatus,
    },
    {
      roomNumber: "85",
      block: "B-Wing",
      floor: 1,
      designation: "Warden",
      capacity: 1,
      status: "AVAILABLE" as RoomStatus,
    },
    {
      roomNumber: "84",
      block: "B-Wing",
      floor: 1,
      designation: "Guest",
      capacity: 2,
      status: "AVAILABLE" as RoomStatus,
    },
    // Toilets and Bathrooms on First Floor
    {
      roomNumber: "B-F-2",
      block: "B-Wing",
      floor: 1,
      designation: "bathroom",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "B-F-3",
      block: "B-Wing",
      floor: 1,
      designation: "bathroom",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "T-F-2",
      block: "B-Wing",
      floor: 1,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "T-F-3",
      block: "B-Wing",
      floor: 1,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // C-Wing Rooms based on the floor plan
    // C-Wing Ground Floor (87-98 plus special rooms)
    // Workshop Side (87-92) - in sequence
    ...[87, 88, 89, 90, 91, 92].map((num) => ({
      roomNumber: String(num),
      block: "C-Wing",
      floor: 0,
      designation: null,
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    })),

    // Stairs
    {
      roomNumber: "C-S-G",
      block: "C-Wing",
      floor: 0,
      designation: "stairs",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // Store
    {
      roomNumber: "C-ST-G",
      block: "C-Wing",
      floor: 0,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // STC Side (93-98) - in sequence
    ...[93, 94, 95, 96, 97, 98].map((num) => ({
      roomNumber: String(num),
      block: "C-Wing",
      floor: 0,
      designation: null,
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    })),

    // Toilets on Ground Floor
    {
      roomNumber: "C-T-G-1",
      block: "C-Wing",
      floor: 0,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "C-T-G-2",
      block: "C-Wing",
      floor: 0,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // VIP Rooms on Ground Floor
    {
      roomNumber: "99",
      block: "C-Wing",
      floor: 0,
      designation: "VIP",
      capacity: 2,
      status: "AVAILABLE" as RoomStatus,
    },
    {
      roomNumber: "100",
      block: "C-Wing",
      floor: 0,
      designation: "VIP",
      capacity: 2,
      status: "AVAILABLE" as RoomStatus,
    },

    // C-Wing First Floor (101-114 plus special rooms)
    // Workshop Side (101-106) - in sequence
    // Note: Rooms 101-105 are part of Ladies Wing
    ...[101, 102, 103, 104, 105, 106].map((num) => ({
      roomNumber: String(num),
      block: "C-Wing",
      floor: 1,
      designation: "Ladies wing",
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    })),

    // Stairs on First Floor
    {
      roomNumber: "C-S-F",
      block: "C-Wing",
      floor: 1,
      designation: "stairs",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // Store on First Floor
    {
      roomNumber: "C-ST-F",
      block: "C-Wing",
      floor: 1,
      designation: "store",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // STC Side (107-112) - in sequence
    ...[107, 108, 109, 110, 111, 112].map((num) => ({
      roomNumber: String(num),
      block: "C-Wing",
      floor: 1,
      designation: null,
      capacity: 4,
      status: "AVAILABLE" as RoomStatus,
    })),

    // Toilets on First Floor
    {
      roomNumber: "C-T-F-1",
      block: "C-Wing",
      floor: 1,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },
    {
      roomNumber: "C-T-F-2",
      block: "C-Wing",
      floor: 1,
      designation: "toilet",
      capacity: 0,
      status: "BLOCKED" as RoomStatus,
    },

    // VIP Rooms on First Floor
    {
      roomNumber: "113",
      block: "C-Wing",
      floor: 1,
      designation: "VIP",
      capacity: 2,
      status: "AVAILABLE" as RoomStatus,
    },
    {
      roomNumber: "114",
      block: "C-Wing",
      floor: 1,
      designation: "VIP",
      capacity: 2,
      status: "AVAILABLE" as RoomStatus,
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
