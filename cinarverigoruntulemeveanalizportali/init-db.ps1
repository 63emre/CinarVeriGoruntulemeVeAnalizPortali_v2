#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Prisma Database Initialization Script

# Log function for consistent formatting and better readability
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

# Main script execution starts here
try {
    Write-Log "Veritabanı başlatma işlemi başlatılıyor..." "Green"
    
    # Check if prisma CLI is installed
    Write-Log "Prisma CLI kontrol ediliyor..." "Cyan"
    $prismaVersion = npx prisma -v 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Prisma CLI bulunamadı. Bağımlılıklar yükleniyor..." "Yellow"
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            throw "Bağımlılıklar yüklenirken hata oluştu. Lütfen 'npm install' komutunu manuel olarak çalıştırın."
        }
    } else {
        Write-Log "Prisma CLI bulundu: $($prismaVersion -split '\r?\n' | Select-Object -First 1)" "Green"
    }
    
    # Check database connection
    Write-Log "Veritabanı bağlantısı kontrol ediliyor..." "Cyan"
    npx prisma validate
    
    if ($LASTEXITCODE -ne 0) {
        throw "Veritabanı bağlantısı doğrulanamadı. Lütfen .env dosyasında DATABASE_URL ayarını kontrol edin."
    }
    
    # Reset database if requested
    $resetDb = Get-YesNoResponse "Veritabanını sıfırlamak istiyor musunuz? Bu işlem TÜM verileri silecektir"
    
    if ($resetDb) {
        Write-Log "Veritabanı sıfırlanıyor..." "Yellow"
        npx prisma migrate reset --force
        
        if ($LASTEXITCODE -ne 0) {
            throw "Veritabanı sıfırlama işlemi başarısız oldu."
        }
        
        Write-Log "Veritabanı başarıyla sıfırlandı." "Green"
    } else {
        # Apply migrations
        Write-Log "Veritabanı migrasyonları uygulanıyor..." "Cyan"
        npx prisma migrate deploy
        
        if ($LASTEXITCODE -ne 0) {
            throw "Veritabanı migrasyonları uygulanırken hata oluştu."
        }
        
        Write-Log "Migrasyonlar başarıyla uygulandı." "Green"
        
        # Generate Prisma client
        Write-Log "Prisma client oluşturuluyor..." "Cyan"
        npx prisma generate
        
        if ($LASTEXITCODE -ne 0) {
            throw "Prisma client oluşturulurken hata oluştu."
        }
        
        Write-Log "Prisma client başarıyla oluşturuldu." "Green"
        
        # Run seed script if requested
        $runSeed = Get-YesNoResponse "Veritabanına başlangıç verilerini eklemek istiyor musunuz?"
        
        if ($runSeed) {
            Write-Log "Başlangıç verileri ekleniyor..." "Cyan"
            npm run prisma:seed
            
            if ($LASTEXITCODE -ne 0) {
                throw "Başlangıç verileri eklenirken hata oluştu."
            }
            
            Write-Log "Başlangıç verileri başarıyla eklendi." "Green"
        }
    }
    
    Write-Log "Veritabanı başlatma işlemi tamamlandı!" "Green"
} catch {
    Write-Log "HATA: $_" "Red"
    exit 1
} 