# Set environment variables
$env:DATABASE_URL = "postgresql://postgres:123@localhost:5432/cinar_portal"
$env:JWT_SECRET = "cinar-secret-key-123456789"
$env:NODE_ENV = "development"

# Function to write log with timestamp
function Write-Log {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

# Check if database is configured
Write-Log "Checking database configuration..." -Color Cyan
try {
    # Try to connect to the database using npx prisma
    $dbCheck = npx prisma validate 2>&1
    if ($?) {
        Write-Log "Database connection verified." -Color Green
        
        # Optionally run performance check
        $runPerf = Read-Host "Would you like to run a database performance check? (y/n)"
        if ($runPerf -eq "y") {
            if (Test-Path -Path .\check-db-performance.ps1) {
                & .\check-db-performance.ps1
            } else {
                Write-Log "Performance check script not found. Skipping performance check." -Color Yellow
            }
        }
    } else {
        Write-Log "Database configuration issue detected. Please run init-db.ps1 first." -Color Yellow
        $runInit = Read-Host "Would you like to run the database initialization script now? (y/n)"
        if ($runInit -eq "y") {
            & .\init-db.ps1
        }
    }
} catch {
    Write-Log "Error checking database: $_" -Color Red
}

# Check for missing API endpoints
Write-Log "Checking API endpoints..." -Color Cyan
$apiDirs = @(
    "src/app/api/user",
    "src/app/api/users",
    "src/app/api/workspaces",
    "src/app/api/formulas",
    "src/app/api/tables",
    "src/app/api/auth"
)

$missingApis = $false
foreach ($dir in $apiDirs) {
    if (-not (Test-Path -Path $dir)) {
        Write-Log "Warning: API endpoint directory missing: $dir" -Color Yellow
        $missingApis = $true
    }
}

if ($missingApis) {
    Write-Log "Some API endpoint directories are missing, this may cause 404 errors." -Color Yellow
} else {
    Write-Log "All required API endpoint directories are present." -Color Green
}

# Start the application with monitoring
Write-Log "Starting Next.js application with monitoring..." -Color Green

# Create a simple memory monitoring function
$monitoringScript = {
    param ($ProcessId)
    
    # Run monitoring in a separate window
    Start-Process powershell -ArgumentList "-Command", {
        param ($ProcessId)
        Add-Type -AssemblyName PresentationFramework
        
        function Get-ProcessMemory {
            param ($ProcessId)
            $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
            if ($process) {
                $memoryMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
                return $memoryMB
            }
            return 0
        }
        
        Write-Host "Monitoring Next.js app (PID: $ProcessId)" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
        
        while ($true) {
            $memoryMB = Get-ProcessMemory -ProcessId $ProcessId
            if ($memoryMB -eq 0) {
                Write-Host "Application process not found or terminated." -ForegroundColor Red
                break
            }
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Memory usage: $memoryMB MB" -ForegroundColor Green
            
            if ($memoryMB -gt 1000) {
                Write-Host "Warning: High memory usage detected!" -ForegroundColor Red
                [System.Windows.MessageBox]::Show("Warning: Memory usage is high ($memoryMB MB)", "App Monitoring", "OK", "Warning")
            }
            
            Start-Sleep -Seconds 30
        }
    } -ArgumentList $ProcessId
}

# Run the application
npm run dev