#!/usr/bin/env node

/**
 * Simple script to initialize the database schema without using migrations
 * This is more reliable for the initial Render deployment with Neon PostgreSQL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set extremely long timeouts
process.env.PRISMA_QUERY_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = '300000';
process.env.PRISMA_MIGRATION_ADVISORY_LOCK_TIMEOUT = '300000';
process.env.PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = '300000';

// Use Render-optimized schema if available
const renderSchemaPath = path.join(__dirname, '../prisma/schema.prisma.render');
const normalSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const backupSchemaPath = path.join(__dirname, '../prisma/schema.prisma.backup');

// Function to run command with better error handling
function runCommand(command) {
    try {
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Command failed: ${command}`);
        console.error(error.message);
        return false;
    }
}

async function main() {
    console.log('🔄 Initializing database for Render deployment');

    // Backup original schema
    if (fs.existsSync(renderSchemaPath)) {
        console.log('📄 Using Render-optimized schema');
        fs.copyFileSync(normalSchemaPath, backupSchemaPath);
        fs.copyFileSync(renderSchemaPath, normalSchemaPath);
    }

    try {
        // Generate client
        console.log('🔨 Generating Prisma client');
        runCommand('npx prisma generate');

        // Try db push first (direct schema sync)
        console.log('🔄 Pushing schema to database (bypassing migrations)');
        const pushSuccess = runCommand('npx prisma db push --accept-data-loss --skip-generate');

        if (pushSuccess) {
            console.log('✅ Schema push successful');

            // Seed the database if this is the initial setup
            console.log('🌱 Seeding the database');
            runCommand('npm run seed');

            console.log('🎉 Database setup complete!');
            return;
        }

        // If push fails, try reset
        console.log('⚠️ Schema push failed, attempting database reset');
        const resetSuccess = runCommand('npx prisma migrate reset --force');

        if (resetSuccess) {
            console.log('✅ Database reset successful');
        } else {
            console.error('❌ Database initialization failed');
            process.exit(1);
        }
    } finally {
        // Restore original schema if we used the Render version
        if (fs.existsSync(backupSchemaPath)) {
            fs.copyFileSync(backupSchemaPath, normalSchemaPath);
            fs.unlinkSync(backupSchemaPath);
        }
    }
}

main().catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
});
