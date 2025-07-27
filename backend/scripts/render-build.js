/**
 * Simple Render build script
 */

const { execSync } = require('child_process');

// Set environment variables for Prisma
process.env.PRISMA_CLIENT_ENGINE_ENGINE_PROTOCOL = 'binary';
process.env.PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = '300000';
process.env.PRISMA_MIGRATION_ADVISORY_LOCK_TIMEOUT = '300000';
process.env.PRISMA_QUERY_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = '300000';

// Execute commands in sequence
console.log('📦 Installing dependencies...');
execSync('npm install --include=dev', { stdio: 'inherit' });

console.log('🔧 Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('🔄 Syncing database schema...');
try {
    // Try db push first
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ DB push failed, attempting reset...');
    try {
        execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    } catch (resetError) {
        console.error('❌ Database setup failed:', resetError.message);
        process.exit(1);
    }
}

console.log('🏗️ Building application...');
execSync('npm run build', { stdio: 'inherit' });

console.log('✅ Build completed successfully!');
