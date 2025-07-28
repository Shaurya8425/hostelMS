import prisma from "../src/db";
import { hash } from "bcryptjs";

async function main() {
  // Add linen inventory for testing with realistic numbers for medium-sized sample
  await prisma.linenInventory.deleteMany();
  await prisma.linenInventory.create({
    data: {
      bedsheet: 200, // Total bedsheets available
      bedsheetActive: 35, // In use by students (15 students + some extras)
      bedsheetInHand: 165, // Available in store
      bedsheetUsed: 25, // Used/dirty bedsheets
      pillowCover: 250, // Total pillow covers
      pillowActive: 20, // In use
      pillowInHand: 200, // Available
      pillowUsed: 30, // Used/dirty
      blanket: 150, // Total blankets
      blanketActive: 18, // In use
      blanketInHand: 120, // Available
      blanketUsed: 12, // Used/dirty
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

  // Create 15 student users for medium-sized sample data
  const studentUsers = await Promise.all(
    Array.from({ length: 15 }).map(async (_, i) =>
      prisma.user.create({
        data: {
          email: `student${i + 1}@hostel.com`,
          password: await hash("student123", 10),
          role: "STUDENT",
        },
      })
    )
  );

  // Sample data arrays for variety
  const designations = [
    "Student",
    "Research Scholar",
    "Project Trainee",
    "Intern",
    "Exchange Student",
  ];
  const guardianNames = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Amit Patel",
    "Sunita Singh",
    "Vikram Gupta",
    "Meera Joshi",
    "Arjun Reddy",
    "Kavya Iyer",
    "Rohit Agarwal",
    "Sneha Das",
    "Manoj Verma",
    "Pooja Nair",
    "Suresh Yadav",
    "Anita Bhatt",
    "Ravi Chandra",
  ];
  const divisions = ["A", "B", "C", "D"];
  const courses = [
    "BTech CSE",
    "BTech ECE",
    "BTech ME",
    "MTech CSE",
    "MTech ECE",
    "MBA",
    "MCA",
    "PhD CSE",
    "PhD ECE",
  ];
  const mobileNumbers = [
    "9876543210",
    "9876543211",
    "9876543212",
    "9876543213",
    "9876543214",
    "9876543215",
    "9876543216",
    "9876543217",
    "9876543218",
    "9876543219",
    "9876543220",
    "9876543221",
    "9876543222",
    "9876543223",
    "9876543224",
  ];

  // Create 15 students with comprehensive sample data
  const students = await Promise.all(
    studentUsers.map((user, i) =>
      prisma.student.create({
        data: {
          name: `Student ${String(i + 1).padStart(2, "0")}`,
          email: user.email,
          phone: `123456789${i}`,
          mobile: mobileNumbers[i],
          gender: i % 2 === 0 ? "MALE" : "FEMALE",
          designation: designations[i % designations.length],
          guardianName: guardianNames[i],
          ticketNumber: `TKT${String(i + 1).padStart(4, "0")}`,
          division: divisions[i % divisions.length],
          course: courses[i % courses.length],
          fromDate: new Date(
            `2025-07-${String((i % 20) + 1).padStart(2, "0")}`
          ),
          toDate: new Date(`2025-12-${String((i % 20) + 1).padStart(2, "0")}`),
          bedsheetCount: Math.floor(Math.random() * 3) + 1, // 1-3 bedsheets
          pillowCount: Math.floor(Math.random() * 2) + 1, // 1-2 pillows
          blanketCount: Math.floor(Math.random() * 2) + 1, // 1-2 blankets
          linenIssuedDate: new Date(
            `2025-07-${String((i % 20) + 1).padStart(2, "0")}`
          ),
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

  // Create 20 complaints (more than students to show some students have multiple complaints)
  const complaintSubjects = [
    "Room AC not working",
    "Mess food quality",
    "Water leakage in bathroom",
    "WiFi connectivity issues",
    "Noise from neighboring room",
    "Broken furniture",
    "Power outage frequently",
    "Dirty common areas",
    "Hot water not available",
    "Room door lock problem",
    "Pest control needed",
    "Laundry service delay",
    "Library timing issues",
    "Gym equipment broken",
    "Canteen overpricing",
    "Parking space shortage",
    "Security concerns",
    "Maintenance delay",
    "Room cleaning service",
    "Internet speed slow",
  ];

  const complaintDescriptions = [
    "The air conditioning unit in my room has not been working for the past 3 days.",
    "The quality of food served in the mess has deteriorated significantly.",
    "There is constant water leakage in the bathroom ceiling causing inconvenience.",
    "WiFi connection keeps dropping frequently affecting my studies and work.",
    "The students in the adjacent room play loud music till late night.",
    "The study table in my room has a broken leg and needs immediate replacement.",
    "Power cuts happen multiple times a day disrupting daily activities.",
    "Common areas including corridors and lounges are not cleaned regularly.",
    "Hot water is not available during morning hours when needed most.",
    "The door lock of my room is jammed and I'm unable to lock it properly.",
    "There are insects and pests in the room that need professional pest control.",
    "Laundry service takes too long and clothes are often returned damaged.",
    "Library closes too early and doesn't cater to our study schedule needs.",
    "Most of the gym equipment is broken and has not been repaired for months.",
    "Canteen prices are too high compared to the quality and quantity of food.",
    "There's insufficient parking space for students' vehicles causing daily hassles.",
    "Security guards are often absent from their posts creating safety concerns.",
    "Maintenance requests are taking weeks to be addressed by the staff.",
    "Room cleaning service is irregular and not up to the expected standards.",
    "Internet speed is very slow making it difficult to attend online classes.",
  ];

  await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.complaint.create({
        data: {
          subject: complaintSubjects[i],
          description: complaintDescriptions[i],
          studentId: students[i % students.length].id,
          status:
            i % 4 === 0
              ? "RESOLVED"
              : i % 4 === 1
              ? "REJECTED"
              : i % 4 === 2
              ? "IN_PROGRESS"
              : "PENDING",
        },
      })
    )
  );

  // Create 25 leaves (some students may have multiple leave applications)
  const leaveReasons = [
    "Medical emergency at home",
    "Wedding ceremony in family",
    "Festival celebration",
    "Job interview",
    "Medical checkup",
    "Family vacation",
    "Academic conference",
    "Personal work",
    "Sick leave",
    "Emergency travel",
    "Religious ceremony",
    "Cultural event participation",
    "Sports competition",
    "Project submission",
    "Family function",
    "Health issues",
    "Official work",
    "Research work",
    "Examination preparation",
    "Training program",
    "Workshop attendance",
    "Seminar participation",
    "Cultural fest",
    "Technical symposium",
    "Personal emergency",
  ];

  await Promise.all(
    Array.from({ length: 25 }).map((_, i) => {
      const startDay = Math.min(10 + i, 28); // Ensure we don't exceed July days
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 days leave
      const endDay = Math.min(startDay + duration, 31); // Ensure we don't exceed month days
      return prisma.leave.create({
        data: {
          fromDate: new Date(`2025-07-${String(startDay).padStart(2, "0")}`),
          toDate: new Date(`2025-07-${String(endDay).padStart(2, "0")}`),
          reason: leaveReasons[i],
          studentId: students[i % students.length].id,
          status:
            i % 3 === 0 ? "PENDING" : i % 3 === 1 ? "APPROVED" : "REJECTED",
        },
      });
    })
  );

  // Create 5 fee payments
  // removed fee payments creation

  // Create some archived students for testing bed occupancy calculations
  const archivedStudentData = [
    {
      originalId: 1001,
      name: "Archived Student 01",
      email: "archived1@hostel.com",
      phone: "9876543300",
      mobile: "9876543301",
      gender: "MALE" as const,
      designation: "Former Student",
      guardianName: "Parent Name 1",
      ticketNumber: "TKT1001",
      division: "A",
      course: "BTech CSE",
      fromDate: new Date("2025-06-01"),
      toDate: new Date("2025-07-15"),
      bedsheetCount: 2,
      pillowCount: 1,
      blanketCount: 1,
      linenIssuedDate: new Date("2025-06-01"),
      roomNumber: "45",
      deletedAt: new Date("2025-07-15"),
      deletedBy: "admin1@hostel.com",
      originalCreatedAt: new Date("2025-06-01"),
      originalUpdatedAt: new Date("2025-07-15"),
    },
    {
      originalId: 1002,
      name: "Archived Student 02",
      email: "archived2@hostel.com",
      phone: "9876543302",
      mobile: "9876543303",
      gender: "FEMALE" as const,
      designation: "Former Student",
      guardianName: "Parent Name 2",
      ticketNumber: "TKT1002",
      division: "B",
      course: "MTech ECE",
      fromDate: new Date("2025-05-15"),
      toDate: new Date("2025-07-20"),
      bedsheetCount: 2,
      pillowCount: 1,
      blanketCount: 2,
      linenIssuedDate: new Date("2025-05-15"),
      roomNumber: "101",
      deletedAt: new Date("2025-07-20"),
      deletedBy: "admin2@hostel.com",
      originalCreatedAt: new Date("2025-05-15"),
      originalUpdatedAt: new Date("2025-07-20"),
    },
    {
      originalId: 1003,
      name: "Archived Student 03",
      email: "archived3@hostel.com",
      phone: "9876543304",
      mobile: "9876543305",
      gender: "MALE" as const,
      designation: "Former Research Scholar",
      guardianName: "Parent Name 3",
      ticketNumber: "TKT1003",
      division: "C",
      course: "PhD CSE",
      fromDate: new Date("2025-04-01"),
      toDate: new Date("2025-07-10"),
      bedsheetCount: 3,
      pillowCount: 2,
      blanketCount: 2,
      linenIssuedDate: new Date("2025-04-01"),
      roomNumber: "87",
      deletedAt: new Date("2025-07-10"),
      deletedBy: "admin1@hostel.com",
      originalCreatedAt: new Date("2025-04-01"),
      originalUpdatedAt: new Date("2025-07-10"),
    },
    {
      originalId: 1004,
      name: "Archived Student 04",
      email: "archived4@hostel.com",
      phone: "9876543306",
      mobile: "9876543307",
      gender: "FEMALE" as const,
      designation: "Former Intern",
      guardianName: "Parent Name 4",
      ticketNumber: "TKT1004",
      division: "D",
      course: "MCA",
      fromDate: new Date("2025-06-15"),
      toDate: new Date("2025-07-25"),
      bedsheetCount: 1,
      pillowCount: 1,
      blanketCount: 1,
      linenIssuedDate: new Date("2025-06-15"),
      roomNumber: "63",
      deletedAt: new Date("2025-07-25"),
      deletedBy: "admin2@hostel.com",
      originalCreatedAt: new Date("2025-06-15"),
      originalUpdatedAt: new Date("2025-07-25"),
    },
    {
      originalId: 1005,
      name: "Archived Student 05",
      email: "archived5@hostel.com",
      phone: "9876543308",
      mobile: "9876543309",
      gender: "MALE" as const,
      designation: "Former Exchange Student",
      guardianName: "Parent Name 5",
      ticketNumber: "TKT1005",
      division: "A",
      course: "BTech ME",
      fromDate: new Date("2025-05-01"),
      toDate: new Date("2025-07-05"),
      bedsheetCount: 2,
      pillowCount: 1,
      blanketCount: 1,
      linenIssuedDate: new Date("2025-05-01"),
      roomNumber: "99",
      deletedAt: new Date("2025-07-05"),
      deletedBy: "admin1@hostel.com",
      originalCreatedAt: new Date("2025-05-01"),
      originalUpdatedAt: new Date("2025-07-05"),
    },
  ];

  await Promise.all(
    archivedStudentData.map((data) => prisma.archivedStudent.create({ data }))
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
