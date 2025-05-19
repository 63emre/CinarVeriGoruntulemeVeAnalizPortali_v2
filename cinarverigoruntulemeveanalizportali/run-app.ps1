# Set environment variables
$env:DATABASE_URL = "postgresql://postgres:123@localhost:5432/cinar_portal"
$env:JWT_SECRET = "cinar-secret-key-123456789"
$env:NODE_ENV = "development"

# Run the application
Write-Host "Starting Next.js application..." -ForegroundColor Green
npm run dev 