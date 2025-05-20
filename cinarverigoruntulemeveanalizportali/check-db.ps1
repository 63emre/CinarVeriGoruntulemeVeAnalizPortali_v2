#!/usr/bin/env pwsh
# Database Connection Check Script

Write-Host "Checking database connection..." -ForegroundColor Cyan

# Create a temporary TypeScript file to check database connection
$tempFile = "temp-db-check.ts"

@"
import { PrismaClient } from '@prisma/client';

async function checkConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Try to connect to the database
    await prisma.`$connect();
    console.log('\x1b[32m%s\x1b[0m', '✓ Database connection successful!');
    
    // Get database stats
    const userCount = await prisma.user.count();
    const workspaceCount = await prisma.workspace.count();
    const tableCount = await prisma.dataTable.count();
    const formulaCount = await prisma.formula.count();
    
    console.log('\nDatabase Statistics:');
    console.log(`Users: ${userCount}`);
    console.log(`Workspaces: ${workspaceCount}`);
    console.log(`Data Tables: ${tableCount}`);
    console.log(`Formulas: ${formulaCount}`);
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Database connection failed!');
    console.error(`Error details: ${error.message}`);
  } finally {
    await prisma.`$disconnect();
  }
}

checkConnection();
"@ | Out-File -Encoding utf8 $tempFile

# Run the check with ts-node
Write-Host "Running database connection test..." -ForegroundColor Yellow
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" $tempFile

# Clean up
Remove-Item $tempFile
Write-Host "Check completed." -ForegroundColor Green 