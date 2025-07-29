// Script to delete a room by room number
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function deleteRoom(roomNumber) {
  try {
    // First, find the room to make sure it exists
    const room = await prisma.room.findUnique({
      where: { roomNumber },
      include: { students: true }
    });

    if (!room) {
      console.error(`Room with number ${roomNumber} not found!`);
      return;
    }

    // Check if room has students
    if (room.students && room.students.length > 0) {
      console.log(`Warning: Room ${roomNumber} has ${room.students.length} students assigned to it.`);
      console.log('Students in this room:');
      room.students.forEach(student => {
        console.log(`- ${student.name} (${student.email})`);
      });
      console.log('Cannot delete a room with assigned students. Please reassign students first.');
      return;
    }

    // Delete the room if no students are assigned
    const deletedRoom = await prisma.room.delete({
      where: { roomNumber }
    });

    console.log(`Successfully deleted room: ${deletedRoom.roomNumber} (${deletedRoom.block}, Floor ${deletedRoom.floor})`);
  } catch (error) {
    console.error('Error deleting room:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get room number from command line arguments
const roomNumber = process.argv[2];

if (!roomNumber) {
  console.error('Please provide a room number as an argument');
  console.log('Example: node scripts/delete-room.js "115"');
  process.exit(1);
}

// Execute the delete function
deleteRoom(roomNumber)
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
