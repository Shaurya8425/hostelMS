/**
 * Script to check database connection and schema
 */

const { PrismaClient } = require('@prisma/client');

// Set longer timeouts for Neon PostgreSQL
process.env.PRISMA_CLIENT_ENGINE_ENGINE_PROTOCOL = 'binary';
process.env.PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = '300000';
process.env.PRISMA_MIGRATION_ADVISORY_LOCK_TIMEOUT = '300000';
process.env.PRISMA_QUERY_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = '300000';

async function main() {
  console.log('🔍 Checking database connection...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Check room count
    const roomCount = await prisma.room.count();
    console.log(`📊 Found ${roomCount} rooms in database`);
    
    // Check student count
    const studentCount = await prisma.student.count();
    console.log(`👨‍🎓 Found ${studentCount} students in database`);
    
    // Check if any models are missing
    try {
      await prisma.$queryRaw`SELECT * FROM "Room" LIMIT 1`;
      console.log('✅ Room model exists');
    } catch (e) {
      console.error('❌ Room model missing or has issues');
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Student" LIMIT 1`;
      console.log('✅ Student model exists');
    } catch (e) {
      console.error('❌ Student model missing or has issues');
    }
    
    console.log('✅ Database check completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error('Script error:', e);
    process.exit(1);
  });
