import prisma from "../src/db";

async function checkRooms() {
  // Get all rooms
  const allRooms = await prisma.room.findMany({
    select: {
      id: true,
      roomNumber: true,
      block: true,
      floor: true,
      capacity: true,
      designation: true,
      status: true,
    },
    orderBy: [{ block: "asc" }, { floor: "asc" }, { roomNumber: "asc" }],
  });

  // Group rooms by block and floor
  const roomsByBlockAndFloor = allRooms.reduce((acc, room) => {
    const key = `${room.block}-Floor${room.floor}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(room);
    return acc;
  }, {} as Record<string, typeof allRooms>);

  // Print details for each block and floor
  for (const [key, roomsInSection] of Object.entries(roomsByBlockAndFloor)) {
    console.log(`\n=== ${key} ===`);
    console.log(`Total rooms: ${roomsInSection.length}`);

    // Count room types
    const roomTypes = roomsInSection.reduce((acc, room) => {
      const designation = room.designation || "Regular";
      acc[designation] = (acc[designation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("Room types:");
    for (const [type, count] of Object.entries(roomTypes)) {
      console.log(`  ${type}: ${count}`);
    }

    // Count bed capacity
    const totalBeds = roomsInSection.reduce(
      (sum, room) => sum + (room.capacity || 0),
      0
    );
    console.log(`Total bed capacity: ${totalBeds}`);

    // List rooms in sequence
    console.log("Rooms in sequence:");
    roomsInSection.forEach((room) => {
      console.log(
        `  Room ${room.roomNumber} - Capacity: ${room.capacity}, Designation: ${
          room.designation || "Regular"
        }, Status: ${room.status}`
      );
    });
  }

  // Print overall summary
  const aWingRooms = allRooms.filter((room) => room.block === "A-Wing");
  const bWingRooms = allRooms.filter((room) => room.block === "B-Wing");
  const cWingRooms = allRooms.filter((room) => room.block === "C-Wing");

  const aWingCapacity = aWingRooms.reduce(
    (sum, room) => sum + (room.capacity || 0),
    0
  );
  const bWingCapacity = bWingRooms.reduce(
    (sum, room) => sum + (room.capacity || 0),
    0
  );
  const cWingCapacity = cWingRooms.reduce(
    (sum, room) => sum + (room.capacity || 0),
    0
  );
  const totalCapacity = aWingCapacity + bWingCapacity + cWingCapacity;

  console.log("\n=== Overall Summary ===");
  console.log(
    `A-Wing: ${aWingRooms.length} rooms with total capacity of ${aWingCapacity} beds`
  );
  console.log(
    `B-Wing: ${bWingRooms.length} rooms with total capacity of ${bWingCapacity} beds`
  );
  console.log(
    `C-Wing: ${cWingRooms.length} rooms with total capacity of ${cWingCapacity} beds`
  );
  console.log(`Total: ${allRooms.length} rooms with ${totalCapacity} beds`);

  await prisma.$disconnect();
}

checkRooms().catch((e) => {
  console.error(e);
  process.exit(1);
});
