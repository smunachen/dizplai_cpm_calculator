#!/bin/bash

# Dizplai CPM Calculator - Database Setup Script
# This script initializes the PostgreSQL database with schema and seed data

echo "================================="
echo "Dizplai CPM Calculator Setup"
echo "================================="
echo ""

# Database configuration
DB_NAME="dizplai_cpm_calculator"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "Database Configuration:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if ! psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c '\q' 2>/dev/null; then
    echo "❌ Error: Cannot connect to PostgreSQL"
    echo "   Make sure PostgreSQL is running and credentials are correct"
    exit 1
fi
echo "✓ PostgreSQL is running"
echo ""

# Create database if it doesn't exist
echo "Creating database '$DB_NAME'..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME"
echo "✓ Database ready"
echo ""

# Run schema
echo "Loading database schema..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f ./database/schema.sql
if [ $? -eq 0 ]; then
    echo "✓ Schema loaded successfully"
else
    echo "❌ Error loading schema"
    exit 1
fi
echo ""

# Run seed data
echo "Loading seed data..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f ./database/seed.sql
if [ $? -eq 0 ]; then
    echo "✓ Seed data loaded successfully"
else
    echo "❌ Error loading seed data"
    exit 1
fi
echo ""

# Verify data
echo "Verifying installation..."
INDUSTRY_COUNT=$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM industries")
MULTIPLIER_COUNT=$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM multipliers")

echo "  Industries loaded: $(echo $INDUSTRY_COUNT | xargs)"
echo "  Multipliers loaded: $(echo $MULTIPLIER_COUNT | xargs)"

if [ "$(echo $INDUSTRY_COUNT | xargs)" = "6" ] && [ "$(echo $MULTIPLIER_COUNT | xargs)" = "4" ]; then
    echo "✓ Verification successful"
else
    echo "⚠️  Warning: Expected 6 industries and 4 multipliers"
fi
echo ""

echo "================================="
echo "✓ Setup Complete!"
echo "================================="
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Update database credentials in .env"
echo "  3. Install dependencies: npm install"
echo "  4. Start server: npm run dev"
echo ""
