#!/bin/bash

# Generate Prisma client
echo "Generating Prisma Client..."
npx prisma generate

# Attempt to run migrations
echo "Attempting to run migrations..."
npx prisma migrate deploy

# Check if migrations failed
if [ $? -ne 0 ]; then
    echo "Migration failed. Attempting to fix..."
    
    # Create a fix migration if needed
    echo "CREATE MIGRATION"
    
    # Try migrations again
    echo "Retrying migrations..."
    npx prisma migrate deploy --skip-generate
    
    if [ $? -ne 0 ]; then
        echo "Migration still failing. Please check your database manually."
        exit 1
    else
        echo "Migration fixed and applied successfully!"
    fi
fi

# Continue with build
echo "Migrations successful!"
exit 0
