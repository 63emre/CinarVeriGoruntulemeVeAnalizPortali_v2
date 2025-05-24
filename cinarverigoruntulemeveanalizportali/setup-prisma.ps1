#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Prisma Setup Script
# This script sets up Prisma ORM for the project

# Function for consistent logging
function Write-Log {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor $ForegroundColor
}

# Function to validate yes/no responses
function Get-YesNoResponse {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Prompt
    )
    
    while ($true) {
        $response = Read-Host "$Prompt (e/h)"
        if ($response -eq "e" -or $response -eq "E" -or $response -eq "y" -or $response -eq "Y") {
            return $true
        }
        if ($response -eq "h" -or $response -eq "H" -or $response -eq "n" -or $response -eq "N") {
            return $false
        }
        Write-Host "Lütfen 'e' (evet) veya 'h' (hayır) girin." -ForegroundColor Yellow
    }
}

# Function to check if PostgreSQL is running
function Test-PostgreSQLConnection {
    param (
        [string]$ConnectionString
    )
    
    try {
        # Extract connection details from DATABASE_URL
        if ($ConnectionString -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $username = $matches[1]
            $password = $matches[2]
            $hostname = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            # Test connection using psql if available
            $env:PGPASSWORD = $password
            $testResult = psql -h $hostname -p $port -U $username -d postgres -c "SELECT 1;" 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                return $true
            }
        }
        return $false
    } catch {
        return $false
    }
}

# Main script execution
try {
    Write-Log "Prisma ORM kurulum işlemi başlatılıyor..." "Green"
    Write-Log "=========================================" "Green"
    
    # Step 1: Check if Node.js and npm are installed
    Write-Log "Node.js ve npm kontrol ediliyor..." "Cyan"
    
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js bulunamadı. Lütfen Node.js'i yükleyin: https://nodejs.org/"
    }
    
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "npm bulunamadı. Node.js ile birlikte yüklenmiş olmalıdır."
    }
    
    Write-Log "Node.js: $nodeVersion, npm: $npmVersion" "Green"
    
    # Step 2: Check if package.json exists
    Write-Log "Proje yapısı kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path "package.json")) {
        throw "package.json dosyası bulunamadı. Bu script'i proje kök dizininde çalıştırın."
    }
    
    # Step 3: Install dependencies if needed
    Write-Log "Proje bağımlılıkları kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path "node_modules")) {
        Write-Log "Node.js bağımlılıkları yükleniyor..." "Yellow"
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            throw "Bağımlılıklar yüklenirken hata oluştu."
        }
        
        Write-Log "Bağımlılıklar başarıyla yüklendi." "Green"
    }
    
    # Step 4: Check if Prisma is installed
    Write-Log "Prisma CLI kontrol ediliyor..." "Cyan"
    
    $prismaVersion = npx prisma --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Prisma CLI yükleniyor..." "Yellow"
        npm install prisma @prisma/client
        
        if ($LASTEXITCODE -ne 0) {
            throw "Prisma yüklenirken hata oluştu."
        }
    }
    
    Write-Log "Prisma CLI bulundu." "Green"
    
    # Step 5: Check if .env file exists
    Write-Log "Ortam değişkenleri dosyası kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path ".env")) {
        Write-Log ".env dosyası bulunamadı, oluşturuluyor..." "Yellow"
        
        $defaultDbUrl = "postgresql://postgres:123@localhost:5432/cinar_portal"
        $defaultJwtSecret = "cinar-secret-key-$(Get-Random -Minimum 100000 -Maximum 999999)"
        
        @"
# Database Configuration
DATABASE_URL="$defaultDbUrl"

# JWT Secret for authentication
JWT_SECRET="$defaultJwtSecret"

# Application Environment
NODE_ENV="development"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$defaultJwtSecret"
"@ | Out-File -Encoding utf8 ".env"
        
        Write-Log ".env dosyası oluşturuldu." "Green"
        Write-Log "Varsayılan veritabanı URL'si: $defaultDbUrl" "Yellow"
        Write-Log "Gerekirse .env dosyasını düzenleyin." "Yellow"
    } else {
        Write-Log ".env dosyası bulundu." "Green"
    }
    
    # Step 6: Load environment variables
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.+)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim('"'), "Process")
            }
        }
    }
    
    # Step 7: Check PostgreSQL connection
    Write-Log "PostgreSQL bağlantısı kontrol ediliyor..." "Cyan"
    
    $databaseUrl = $env:DATABASE_URL
    if (-not $databaseUrl) {
        throw "DATABASE_URL ortam değişkeni bulunamadı."
    }
    
    $pgConnected = Test-PostgreSQLConnection -ConnectionString $databaseUrl
    if (-not $pgConnected) {
        Write-Log "PostgreSQL bağlantısı kurulamadı." "Yellow"
        Write-Log "PostgreSQL'in çalıştığından ve bağlantı bilgilerinin doğru olduğundan emin olun." "Yellow"
        
        $continueAnyway = Get-YesNoResponse "Yine de devam etmek istiyor musunuz?"
        if (-not $continueAnyway) {
            throw "PostgreSQL bağlantısı gerekli."
        }
    } else {
        Write-Log "PostgreSQL bağlantısı başarılı." "Green"
    }
    
    # Step 8: Check if prisma directory exists
    Write-Log "Prisma yapılandırması kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path "prisma")) {
        Write-Log "Prisma dizini bulunamadı, Prisma başlatılıyor..." "Yellow"
        npx prisma init
        
        if ($LASTEXITCODE -ne 0) {
            throw "Prisma başlatılırken hata oluştu."
        }
        
        Write-Log "Prisma başarıyla başlatıldı." "Green"
    }
    
    # Step 9: Validate Prisma schema
    Write-Log "Prisma şeması doğrulanıyor..." "Cyan"
    
    npx prisma validate
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Prisma şeması geçersiz. Şema dosyasını kontrol edin." "Red"
        
        $fixSchema = Get-YesNoResponse "Şema dosyasını düzeltmeye çalışmak istiyor musunuz?"
        if ($fixSchema) {
            npx prisma format
            npx prisma validate
            
            if ($LASTEXITCODE -ne 0) {
                throw "Prisma şeması hala geçersiz."
            }
        } else {
            throw "Geçersiz Prisma şeması."
        }
    }
    
    Write-Log "Prisma şeması geçerli." "Green"
    
    # Step 10: Generate Prisma client
    Write-Log "Prisma client oluşturuluyor..." "Cyan"
    
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma client oluşturulurken hata oluştu."
    }
    
    Write-Log "Prisma client başarıyla oluşturuldu." "Green"
    
    # Step 11: Ask about database migration
    $runMigration = Get-YesNoResponse "Veritabanı migrasyonlarını çalıştırmak istiyor musunuz?"
    
    if ($runMigration) {
        Write-Log "Veritabanı migrasyonları uygulanıyor..." "Cyan"
        
        npx prisma migrate dev --name init
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Migrasyon başarısız oldu, deploy modunu deneniyor..." "Yellow"
            npx prisma migrate deploy
            
            if ($LASTEXITCODE -ne 0) {
                throw "Veritabanı migrasyonları uygulanamadı."
            }
        }
        
        Write-Log "Veritabanı migrasyonları başarıyla uygulandı." "Green"
    }
    
    # Step 12: Ask about seeding
    $runSeed = Get-YesNoResponse "Veritabanına başlangıç verilerini eklemek istiyor musunuz?"
    
    if ($runSeed) {
        Write-Log "Başlangıç verileri ekleniyor..." "Cyan"
        
        if (Test-Path "prisma/seed.ts" -or Test-Path "prisma/seed.js") {
            npm run prisma:seed
            
            if ($LASTEXITCODE -ne 0) {
                Write-Log "Başlangıç verileri eklenirken hata oluştu." "Yellow"
            } else {
                Write-Log "Başlangıç verileri başarıyla eklendi." "Green"
            }
        } else {
            Write-Log "Seed dosyası bulunamadı (prisma/seed.ts veya prisma/seed.js)." "Yellow"
        }
    }
    
    # Step 13: Final summary
    Write-Log "=========================================" "Green"
    Write-Log "Prisma kurulumu tamamlandı!" "Green"
    Write-Log "=========================================" "Green"
    Write-Log "Kullanılabilir komutlar:" "Cyan"
    Write-Log "  npx prisma studio          - Veritabanı yönetim arayüzü" "White"
    Write-Log "  npx prisma migrate dev     - Yeni migrasyon oluştur" "White"
    Write-Log "  npx prisma migrate deploy  - Migrasyonları uygula" "White"
    Write-Log "  npx prisma generate        - Client'ı yeniden oluştur" "White"
    Write-Log "  npx prisma db seed         - Başlangıç verilerini ekle" "White"
    Write-Log "=========================================" "Green"
    
} catch {
    Write-Log "HATA: $_" "Red"
    Write-Log "Prisma kurulumu başarısız oldu." "Red"
    exit 1
}
