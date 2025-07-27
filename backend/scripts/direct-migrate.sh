#!/bin/bash
# direct-migrate.sh - A direct migration script for Render deployments
# Use this when the Node.js version encounters issues

# Set extremely long timeouts for Neon
export PRISMA_QUERY_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT=180000
export PRISMA_MIGRATION_ADVISORY_LOCK_TIMEOUT=180000
export PRISMA_CLIENT_ENGINE_LIBRARY_ADVISORY_LOCK_TIMEOUT=180000

# Try to generate client first
echo "Generating Prisma client..."
prisma generate

# Try direct deployment first
echo "Attempting direct migration deploy..."
prisma migrate deploy

# If deployment fails, try reset
if [ $? -ne 0 ]; then
  echo "Migration deploy failed. Attempting reset..."
  prisma migrate reset --force
  
  # Run seed if reset was successful
  if [ $? -eq 0 ]; then
    echo "Reset successful, running seed..."
    npm run seed
  else
    echo "Reset failed! Exiting..."
    exit 1
  fi
fi

echo "Migration process completed"
exit 0
