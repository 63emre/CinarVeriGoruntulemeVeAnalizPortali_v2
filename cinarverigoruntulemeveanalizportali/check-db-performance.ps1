#!/usr/bin/env pwsh
# Database Performance Check Script

Write-Host "Running Database Performance Check..." -ForegroundColor Cyan

# Set environment variables if not already set
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "postgresql://postgres:123@localhost:5432/cinar_portal"
    Write-Host "DATABASE_URL environment variable not set, using default value." -ForegroundColor Yellow
}

# Create a temporary TypeScript file to check database performance
$tempFile = "temp-db-perf-check.ts"

@"
import { PrismaClient } from '@prisma/client';

async function checkDatabasePerformance() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  console.log('\n======= Database Performance Check =======\n');

  try {
    // Connect to the database
    await prisma.\$connect();
    console.log('\x1b[32m%s\x1b[0m', '✓ Database connection successful!');
    
    // Get database counts
    console.log('\nTable Counts:');
    const userCount = await prisma.user.count();
    const workspaceCount = await prisma.workspace.count();
    const tableCount = await prisma.dataTable.count();
    const formulaCount = await prisma.formula.count();
    
    console.log(`- Users: ${userCount}`);
    console.log(`- Workspaces: ${workspaceCount}`);
    console.log(`- Data Tables: ${tableCount}`);
    console.log(`- Formulas: ${formulaCount}`);
    
    // Check table sizes (if tables are large)
    if (tableCount > 0) {
      console.log('\nChecking potential performance issues:');
      
      // Check for large tables
      const largeTableCheck = await prisma.dataTable.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              data: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 5
      });
      
      console.log('\nLargest Tables:');
      largeTableCheck.forEach(table => {
        const dataSize = JSON.stringify(table).length;
        console.log(`- ${table.name}: approx. ${Math.round(dataSize / 1024)} KB`);
        
        // Warn about potential performance issues
        if (dataSize > 1024 * 1024) { // More than 1MB
          console.log('\x1b[33m%s\x1b[0m', `  ⚠️ Large table detected: ${table.name} (${Math.round(dataSize / 1024 / 1024)} MB)`);
          console.log('\x1b[33m%s\x1b[0m', '  Consider implementing pagination for better performance.');
        }
      });
    }
    
    // Check relationships and indexes
    console.log('\nChecking database relationships:');
    const workspaceUsers = await prisma.workspaceUser.count();
    console.log(`- Workspace User Relationships: ${workspaceUsers}`);
    
    if (workspaceUsers > 1000) {
      console.log('\x1b[33m%s\x1b[0m', '  ⚠️ Large number of workspace user relationships detected.');
      console.log('\x1b[33m%s\x1b[0m', '  Consider optimizing queries that use these relationships.');
    }
    
    // Perform a simple query benchmark
    console.log('\nRunning Simple Query Benchmark:');
    
    const startTime = Date.now();
    await prisma.workspace.findMany({
      include: {
        users: true,
        tables: true,
      },
      take: 5,
    });
    const duration = Date.now() - startTime;
    
    console.log(`- Workspace query with relationships: ${duration}ms`);
    
    if (duration > 500) {
      console.log('\x1b[33m%s\x1b[0m', '  ⚠️ Slow query detected. Consider optimizing by limiting included relations or adding indexes.');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '  ✓ Query performance is acceptable.');
    }
    
    console.log('\n======= Performance Check Complete =======\n');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Database performance check failed!');
    console.error(`Error details: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

checkDatabasePerformance();
"@ | Out-File -Encoding utf8 $tempFile

# Run the check with ts-node
Write-Host "Running database performance test..." -ForegroundColor Yellow
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" $tempFile
$dbPerfCheckResult = $LASTEXITCODE

# Clean up
Remove-Item $tempFile

if ($dbPerfCheckResult -ne 0) {
    Write-Host "Database performance check failed. Please review the error messages above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Database performance check completed successfully." -ForegroundColor Green
}

# Provide guidance on performance optimization
Write-Host "`nPerformance Optimization Tips:" -ForegroundColor Cyan
Write-Host "1. Add indexes for frequently queried fields."
Write-Host "2. Use pagination for large tables."
Write-Host "3. Limit the use of include/join operations in queries."
Write-Host "4. Monitor slow queries and optimize them."
Write-Host "5. Consider using query caching for frequently accessed data."

exit 0 