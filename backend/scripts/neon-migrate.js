#!/usr/bin/env node

/**
 * Custom migration script for Neon PostgreSQL
 * Handles longer timeouts and retry logic specific to serverless Postgres
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 10000;
const TIMEOUT_SECONDS = 120;

// Set environment variables for Prisma
process.env.PRISMA_QUERY_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = `${TIMEOUT_SECONDS}000`;
process.env.PRISMA_MIGRATION_ADVISORY_LOCK_TIMEOUT = `${TIMEOUT_SECONDS}000`;
process.env.PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT = `${TIMEOUT_SECONDS}000`;
process.env.PRISMA_ENGINE_PROTOCOL = "binary"; // Optimize for binary protocol

console.log('⏱️  Using extended timeouts for Neon PostgreSQL:', TIMEOUT_SECONDS, 'seconds');

// Helper function to run a command with retries
async function runWithRetry(command, description) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`\n🔄 ${description} (Attempt ${attempt}/${MAX_RETRIES}):`);
            execSync(command, { stdio: 'inherit' });
            console.log(`✅ ${description} succeeded!`);
            return true;
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed`);

            if (attempt < MAX_RETRIES) {
                console.log(`⏳ Waiting ${RETRY_DELAY_MS / 1000} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                console.error('❌ All retry attempts failed');
                return false;
            }
        }
    }
}

// Main function
async function main() {
    // Step 1: Generate Prisma Client
    console.log('\n🔨 Step 1: Generating Prisma Client...');
    await runWithRetry('npx prisma generate', 'Prisma Client generation');

    // Step 2: Try a clean migration deploy first
    console.log('\n🔨 Step 2: Attempting standard migration deploy...');
    const deploySuccess = await runWithRetry(`npx prisma migrate deploy`, 'Migration deploy');

    if (deploySuccess) {
        console.log('\n🎉 Migrations completed successfully!');
        return;
    }

    // Step 3: If deploy failed, try reset as fallback
    console.log('\n⚠️ Deploy failed, attempting migration reset as fallback...');
    console.log('⚠️ WARNING: This will clear all data in the database!');

    const resetSuccess = await runWithRetry(`npx prisma migrate reset --force`, 'Migration reset');

    if (resetSuccess) {
        console.log('\n🎉 Migration reset completed successfully!');

        // Optionally run seed after reset
        console.log('\n🔨 Running seed script...');
        await runWithRetry('npm run seed', 'Database seed');
    } else {
        console.error('\n❌ All migration attempts failed');
        process.exit(1);
    }
}

// Run the script
main().catch(e => {
    console.error('Migration script failed:', e);
    process.exit(1);
});
