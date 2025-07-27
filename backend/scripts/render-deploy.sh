#!/bin/bash
# render-deploy.sh - Specialized deployment script for Render with Neon PostgreSQL

# Exit on error
set -e

# Set extremely long timeouts for Neon
export PRISMA_CLIENT_ENGINE_ENGINE_PROTOCOL=binary
export PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT=300000
export PRISMA_MIGRATION_ADVISORY_LOCK_TIMEOUT=300000
export PRISMA_QUERY_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT=300000

echo "==== DEPLOYMENT STARTED ===="

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install --include=dev --prefer-offline

# Step 2: Initialize the database (using our specialized script)
echo "🔧 Initializing database..."
node scripts/db-init.js

# Step 3: Build the application
echo "🏗️ Building application..."
npm run build

# Step 4: If we get here, we succeeded!
echo "✅ Deployment completed successfully!"
exit 0
