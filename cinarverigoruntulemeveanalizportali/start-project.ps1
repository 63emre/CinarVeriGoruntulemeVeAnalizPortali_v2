#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Startup Script

# Function for logging with timestamps
function Write-Log {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor $ForegroundColor
}

# Function to get yes/no input
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

# Display startup banner
Write-Log "Çınar Veri Görüntüleme ve Analiz Portalı - Başlatılıyor" "Cyan"
Write-Log "=================================================" "Cyan"

# Step 1: Check if npm dependencies are installed
Write-Log "Node.js bağımlılıkları kontrol ediliyor..." "White"
if (-not (Test-Path "node_modules")) {
    Write-Log "Node.js bağımlılıkları bulunamadı, yükleniyor..." "Yellow"
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Node.js bağımlılıkları yüklenirken hata oluştu!" "Red"
        exit 1
    }
    
    Write-Log "Node.js bağımlılıkları başarıyla yüklendi." "Green"
} else {
    Write-Log "Node.js bağımlılıkları bulundu." "Green"
}

# Step 2: Check if .env file exists
Write-Log "Ortam değişkenleri dosyası kontrol ediliyor..." "White"
if (-not (Test-Path ".env")) {
    Write-Log ".env dosyası bulunamadı, oluşturuluyor..." "Yellow"
    @"
DATABASE_URL="postgresql://postgres:123@localhost:5432/cinar_portal"
JWT_SECRET="cinar-secret-key-123456789"
"@ | Out-File -Encoding utf8 ".env"
    
    Write-Log ".env dosyası başarıyla oluşturuldu." "Green"
} else {
    Write-Log ".env dosyası bulundu." "Green"
}

# Step 3: Check database connection
Write-Log "Veritabanı bağlantısı kontrol ediliyor..." "White"
& .\check-db.ps1

if ($LASTEXITCODE -ne 0) {
    $initDb = Get-YesNo "Veritabanı bağlantısı sağlanamadı. Veritabanını başlatmak ister misiniz?"
    
    if ($initDb) {
        & .\init-db.ps1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Veritabanı başlatılamadı, uygulama çalıştırılamıyor." "Red"
            exit 1
        }
    } else {
        Write-Log "Veritabanı başlatılmadı, uygulama çalıştırılamıyor." "Red"
        exit 1
    }
}

# Step 4: Start the application
Write-Log "Tüm ön koşullar sağlandı, uygulama başlatılıyor..." "Green"
& .\run-app.ps1
