#!/usr/bin/env pwsh
# Prisma Database Initialization Script

Write-Host "Starting database initialization process..." -ForegroundColor Green

# Check if prisma CLI is installed
Write-Host "Checking for Prisma CLI..." -ForegroundColor Cyan
npx prisma -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma CLI not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Reset the database (if needed)
$resetDb = Read-Host "Do you want to reset the database? This will delete all data. (y/n)"
if ($resetDb -eq "y") {
    Write-Host "Resetting database..." -ForegroundColor Yellow
    npx prisma migrate reset --force
} else {
    # Apply migrations
    Write-Host "Applying migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    
    # Run seed script if requested
    $runSeed = Read-Host "Do you want to seed the database with initial data? (y/n)"
    if ($runSeed -eq "y") {
        Write-Host "Running seed script..." -ForegroundColor Cyan
        npm run prisma:seed
    }
}

Write-Host "Database initialization complete!" -ForegroundColor Green 