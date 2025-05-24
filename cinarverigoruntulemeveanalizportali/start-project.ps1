#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Enhanced Startup Script
# Comprehensive project initialization and startup with health checks

# Function for logging with timestamps and colors
function Write-Log {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor $ForegroundColor
}

# Function to get yes/no input with validation
function Get-YesNo {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Question
    )
    
    while ($true) {
        $response = Read-Host "$Question (e/h)"
        if ($response -eq "e" -or $response -eq "E" -or $response -eq "y" -or $response -eq "Y") {
            return $true
        }
        if ($response -eq "h" -or $response -eq "H" -or $response -eq "n" -or $response -eq "N") {
            return $false
        }
        Write-Host "Lütfen 'e' (evet) veya 'h' (hayır) olarak cevap verin." -ForegroundColor Yellow
    }
}

# Function to check system requirements
function Test-SystemRequirements {
    Write-Log "Sistem gereksinimleri kontrol ediliyor..." "Cyan"
    
    # Check Node.js version
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Node.js bulunamadı"
        }
        
        # Extract version number and check if it's >= 18
        $versionNumber = $nodeVersion -replace 'v', ''
        $majorVersion = [int]($versionNumber.Split('.')[0])
        
        if ($majorVersion -lt 18) {
            Write-Log "Uyarı: Node.js $nodeVersion tespit edildi. En az v18 önerilir." "Yellow"
        } else {
            Write-Log "Node.js $nodeVersion - Uygun" "Green"
        }
    } catch {
        Write-Log "HATA: Node.js bulunamadı. Lütfen Node.js v18+ yükleyin: https://nodejs.org/" "Red"
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "npm bulunamadı"
        }
        Write-Log "npm $npmVersion - Uygun" "Green"
    } catch {
        Write-Log "HATA: npm bulunamadı." "Red"
        return $false
    }
    
    # Check available disk space
    try {
        $drive = Get-PSDrive -Name C
        $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
        
        if ($freeSpaceGB -lt 1) {
            Write-Log "Uyarı: Düşük disk alanı ($freeSpaceGB GB). En az 1GB boş alan önerilir." "Yellow"
        } else {
            Write-Log "Disk alanı: $freeSpaceGB GB - Yeterli" "Green"
        }
    } catch {
        Write-Log "Disk alanı kontrol edilemedi." "Yellow"
    }
    
    return $true
}

# Function to check and install dependencies
function Install-Dependencies {
    Write-Log "Proje bağımlılıkları kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path "package.json")) {
        Write-Log "HATA: package.json bulunamadı. Bu script'i proje kök dizininde çalıştırın." "Red"
        return $false
    }
    
    if (-not (Test-Path "node_modules")) {
        Write-Log "node_modules bulunamadı, bağımlılıklar yükleniyor..." "Yellow"
        
        # Show progress
        Write-Log "Bu işlem birkaç dakika sürebilir..." "Yellow"
        
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "HATA: Bağımlılıklar yüklenirken hata oluştu!" "Red"
            Write-Log "Çözüm önerileri:" "Yellow"
            Write-Log "  1. İnternet bağlantınızı kontrol edin" "White"
            Write-Log "  2. npm cache'i temizleyin: npm cache clean --force" "White"
            Write-Log "  3. node_modules'ü silin ve tekrar deneyin" "White"
            return $false
        }
        
        Write-Log "Bağımlılıklar başarıyla yüklendi." "Green"
    } else {
        Write-Log "node_modules bulundu, bağımlılık kontrolü yapılıyor..." "Yellow"
        
        # Check if package-lock.json is newer than node_modules
        $packageLockTime = (Get-Item "package-lock.json" -ErrorAction SilentlyContinue).LastWriteTime
        $nodeModulesTime = (Get-Item "node_modules" -ErrorAction SilentlyContinue).LastWriteTime
        
        if ($packageLockTime -gt $nodeModulesTime) {
            Write-Log "package-lock.json güncellenmiş, bağımlılıklar güncelleniyor..." "Yellow"
            npm install
            
            if ($LASTEXITCODE -ne 0) {
                Write-Log "Bağımlılık güncellemesi başarısız, devam ediliyor..." "Yellow"
            }
        }
        
        Write-Log "Bağımlılıklar hazır." "Green"
    }
    
    return $true
}

# Function to setup environment
function Initialize-Environment {
    Write-Log "Ortam yapılandırması kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path ".env")) {
        Write-Log ".env dosyası bulunamadı, oluşturuluyor..." "Yellow"
        
        $defaultDbUrl = "postgresql://postgres:123@localhost:5432/cinar_portal"
        $jwtSecret = "cinar-secret-key-$(Get-Random -Minimum 100000 -Maximum 999999)"
        
        @"
# Database Configuration
DATABASE_URL="$defaultDbUrl"

# JWT Secret for authentication
JWT_SECRET="$jwtSecret"

# Application Environment
NODE_ENV="development"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$jwtSecret"

# Application Settings
APP_NAME="Çınar Veri Görüntüleme ve Analiz Portalı"
APP_VERSION="2.0.0"
"@ | Out-File -Encoding utf8 ".env"
        
        Write-Log ".env dosyası başarıyla oluşturuldu." "Green"
        Write-Log "Varsayılan veritabanı URL'si: $defaultDbUrl" "Yellow"
        Write-Log "Gerekirse .env dosyasını düzenleyebilirsiniz." "Yellow"
    } else {
        Write-Log ".env dosyası bulundu." "Green"
        
        # Validate .env file
        $envContent = Get-Content ".env" -Raw
        if (-not ($envContent -match "DATABASE_URL")) {
            Write-Log "Uyarı: .env dosyasında DATABASE_URL bulunamadı." "Yellow"
        }
        if (-not ($envContent -match "JWT_SECRET")) {
            Write-Log "Uyarı: .env dosyasında JWT_SECRET bulunamadı." "Yellow"
        }
    }
    
    return $true
}

# Function to check database with enhanced error handling
function Test-DatabaseConnection {
    Write-Log "Veritabanı bağlantısı kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path ".\check-db.ps1")) {
        Write-Log "check-db.ps1 script'i bulunamadı." "Yellow"
        return $false
    }
    
    try {
        & .\check-db.ps1
        $dbResult = $LASTEXITCODE
        
        if ($dbResult -eq 0) {
            Write-Log "Veritabanı bağlantısı başarılı." "Green"
            return $true
        } else {
            Write-Log "Veritabanı bağlantısı başarısız." "Red"
            return $false
        }
    } catch {
        Write-Log "Veritabanı kontrolü sırasında hata: $_" "Red"
        return $false
    }
}

# Function to initialize database
function Initialize-Database {
    Write-Log "Veritabanı başlatma seçenekleri:" "Cyan"
    Write-Log "  1. Veritabanını sıfırla ve yeniden oluştur" "White"
    Write-Log "  2. Sadece migrasyonları uygula" "White"
    Write-Log "  3. Veritabanı işlemlerini atla" "White"
    
    $choice = Read-Host "Seçiminizi yapın (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Log "Veritabanı sıfırlanıyor ve yeniden oluşturuluyor..." "Yellow"
            if (Test-Path ".\init-db.ps1") {
                & .\init-db.ps1
                return $LASTEXITCODE -eq 0
            } else {
                Write-Log "init-db.ps1 script'i bulunamadı." "Red"
                return $false
            }
        }
        "2" {
            Write-Log "Migrasyonlar uygulanıyor..." "Yellow"
            npx prisma migrate deploy
            if ($LASTEXITCODE -eq 0) {
                npx prisma generate
                return $LASTEXITCODE -eq 0
            }
            return $false
        }
        "3" {
            Write-Log "Veritabanı işlemleri atlandı." "Yellow"
            return $true
        }
        default {
            Write-Log "Geçersiz seçim. Veritabanı işlemleri atlandı." "Yellow"
            return $true
        }
    }
}

# Main script execution
try {
    # Display startup banner
    Write-Log "=================================================" "Cyan"
    Write-Log "Çınar Veri Görüntüleme ve Analiz Portalı v2.0" "Cyan"
    Write-Log "Gelişmiş Başlatma Script'i" "Cyan"
    Write-Log "=================================================" "Cyan"
    
    # Step 1: Check system requirements
    if (-not (Test-SystemRequirements)) {
        throw "Sistem gereksinimleri karşılanmıyor."
    }
    
    # Step 2: Install dependencies
    if (-not (Install-Dependencies)) {
        throw "Bağımlılıklar yüklenemedi."
    }
    
    # Step 3: Setup environment
    if (-not (Initialize-Environment)) {
        throw "Ortam yapılandırması başarısız."
    }
    
    # Step 4: Check database connection
    $dbConnected = Test-DatabaseConnection
    
    if (-not $dbConnected) {
        $initDb = Get-YesNo "Veritabanı bağlantısı sağlanamadı. Veritabanını başlatmak ister misiniz?"
        
        if ($initDb) {
            if (-not (Initialize-Database)) {
                Write-Log "Veritabanı başlatılamadı." "Red"
                $continueAnyway = Get-YesNo "Yine de uygulamayı başlatmak ister misiniz?"
                if (-not $continueAnyway) {
                    throw "Veritabanı gerekli."
                }
            }
        } else {
            $continueAnyway = Get-YesNo "Veritabanı olmadan devam etmek ister misiniz? (Bazı özellikler çalışmayabilir)"
            if (-not $continueAnyway) {
                throw "Veritabanı bağlantısı gerekli."
            }
        }
    }
    
    # Step 5: Optional performance check
    $runPerfCheck = Get-YesNo "Veritabanı performans kontrolü yapmak ister misiniz? (Opsiyonel)"
    
    if ($runPerfCheck -and (Test-Path ".\check-db-performance.ps1")) {
        Write-Log "Performans kontrolü çalıştırılıyor..." "Yellow"
        & .\check-db-performance.ps1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Performans kontrolü uyarılar verdi, ancak devam ediliyor..." "Yellow"
        }
    }
    
    # Step 6: Final checks and startup
    Write-Log "Son kontroller yapılıyor..." "Cyan"
    
    # Check if build is needed
    if (-not (Test-Path ".next")) {
        Write-Log "İlk kez çalıştırılıyor, build işlemi gerekebilir..." "Yellow"
    }
    
    # Check for TypeScript errors
    Write-Log "TypeScript kontrolleri yapılıyor..." "Yellow"
    npx tsc --noEmit --skipLibCheck
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "TypeScript hataları tespit edildi, ancak devam ediliyor..." "Yellow"
    }
    
    # All checks passed, start the application
    Write-Log "=================================================" "Green"
    Write-Log "Tüm ön koşullar sağlandı!" "Green"
    Write-Log "Uygulama başlatılıyor..." "Green"
    Write-Log "=================================================" "Green"
    
    # Start the application
    if (Test-Path ".\run-app.ps1") {
        & .\run-app.ps1
    } else {
        Write-Log "run-app.ps1 bulunamadı, doğrudan npm run dev çalıştırılıyor..." "Yellow"
        npm run dev
    }
    
} catch {
    Write-Log "=================================================" "Red"
    Write-Log "BAŞLATMA HATASI: $_" "Red"
    Write-Log "=================================================" "Red"
    Write-Log "Sorun giderme önerileri:" "Yellow"
    Write-Log "  1. Tüm gereksinimlerin yüklendiğinden emin olun" "White"
    Write-Log "  2. .env dosyasını kontrol edin" "White"
    Write-Log "  3. PostgreSQL servisinin çalıştığından emin olun" "White"
    Write-Log "  4. node_modules'ü silin ve npm install çalıştırın" "White"
    Write-Log "  5. Yönetici olarak çalıştırmayı deneyin" "White"
    exit 1
}
