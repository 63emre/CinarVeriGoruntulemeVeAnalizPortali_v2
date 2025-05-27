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
    
    # Get the script directory and change to project root
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $projectRoot = $scriptDir
    
    Write-Log "Script dizini: $scriptDir" "Cyan"
    Write-Log "Proje kök dizinine geçiliyor: $projectRoot" "Cyan"
    
    # Change to project root directory
    Set-Location $projectRoot
    
    # Check if we're in the correct directory (should have package.json and prisma folder)
    if (-not (Test-Path "package.json")) {
        throw "Bu script proje kök dizininde çalıştırılmalıdır. package.json dosyası bulunamadı. Şu anki dizin: $(Get-Location)"
    }
    
    if (-not (Test-Path "prisma")) {
        throw "Prisma dizini bulunamadı. Lütfen 'prisma' klasörünün mevcut olduğundan emin olun. Şu anki dizin: $(Get-Location)"
    }
    
    if (-not (Test-Path "prisma/schema.prisma")) {
        throw "Prisma schema dosyası bulunamadı. Lütfen 'prisma/schema.prisma' dosyasının mevcut olduğundan emin olun. Şu anki dizin: $(Get-Location)"
    }
    
    Write-Log "Proje dizini doğrulandı: $(Get-Location)" "Green"
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Node.js bulunamadı. Lütfen Node.js'i yükleyin."
        }
        Write-Log "Node.js versiyonu: $nodeVersion" "Green"
    } catch {
        throw "Node.js kontrol edilirken hata oluştu: $_"
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "npm bulunamadı. Lütfen npm'i yükleyin."
        }
        Write-Log "npm versiyonu: $npmVersion" "Green"
    } catch {
        throw "npm kontrol edilirken hata oluştu: $_"
    }
      # Check if prisma CLI is installed
    Write-Log "Prisma CLI kontrol ediliyor..." "Cyan"
    try {
        $prismaVersion = npx prisma -v 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Prisma CLI bulunamadı. Bağımlılıklar yükleniyor..." "Yellow"
            npm install
            
            if ($LASTEXITCODE -ne 0) {
                throw "Bağımlılıklar yüklenirken hata oluştu. Lütfen 'npm install' komutunu manuel olarak çalıştırın."
            }
            
            # Re-check after installation
            $prismaVersion = npx prisma -v 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Prisma CLI bağımlılıklar yüklendikten sonra da bulunamadı."
            }
        }
        
        Write-Log "Prisma CLI bulundu: $($prismaVersion -split '\r?\n' | Select-Object -First 1)" "Green"
    } catch {
        throw "Prisma CLI kontrol edilirken hata oluştu: $_"
    }
      # Check database connection
    Write-Log "Veritabanı bağlantısı kontrol ediliyor..." "Cyan"
    
    # Check if .env file exists
    if (-not (Test-Path ".env") -and -not (Test-Path ".env.local")) {
        Write-Log "UYARI: .env veya .env.local dosyası bulunamadı. DATABASE_URL environment variable'ının tanımlı olduğundan emin olun." "Yellow"
    }
    
    try {
        npx prisma validate
        
        if ($LASTEXITCODE -ne 0) {
            throw "Veritabanı bağlantısı doğrulanamadı. Lütfen .env dosyasında DATABASE_URL ayarını kontrol edin."
        }
        
        Write-Log "Veritabanı bağlantısı başarıyla doğrulandı." "Green"
    } catch {
        throw "Veritabanı bağlantısı kontrol edilirken hata oluştu: $_"
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
    }
    
    # Generate Prisma client (needed in both reset and migration scenarios)
    Write-Log "Prisma client oluşturuluyor..." "Cyan"
    npx prisma generate
    
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma client oluşturulurken hata oluştu."
    }
    
    Write-Log "Prisma client başarıyla oluşturuldu." "Green"
    
    # Run seed script if requested (available for both reset and migration scenarios)
    $runSeed = Get-YesNoResponse "Veritabanına başlangıç verilerini eklemek istiyor musunuz?"
    
    if ($runSeed) {
        Write-Log "Başlangıç verileri ekleniyor..." "Cyan"
        
        # Check if seed script exists in package.json
        $packageJsonExists = Test-Path "package.json"
        if (-not $packageJsonExists) {
            throw "package.json dosyası bulunamadı. Lütfen proje dizininde olduğunuzdan emin olun."
        }
        
        npm run prisma:seed
          if ($LASTEXITCODE -ne 0) {
            Write-Log "Başlangıç verileri npm script ile eklenemedi. ts-node ile deneniyor..." "Yellow"
            npx ts-node prisma/seed.ts
            
            if ($LASTEXITCODE -ne 0) {
                throw "Başlangıç verileri eklenirken hata oluştu. Lütfen 'prisma/seed.ts' dosyasının var olduğunu kontrol edin."
            }
        }
        
        Write-Log "Başlangıç verileri başarıyla eklendi." "Green"
    }
      Write-Log "Veritabanı başlatma işlemi tamamlandı!" "Green"
    Write-Log "Artık uygulamayı başlatabilirsiniz:" "Cyan"
    Write-Log "  - Development için: npm run dev" "White"
    Write-Log "  - Prisma Studio için: npm run prisma:studio" "White"
    Write-Log "  - Database kontrolü için: ./check-db.ps1" "White"
    
} catch {
    Write-Log "HATA: $_" "Red"
    Write-Log "Hata detayları için lütfen yukarıdaki mesajları kontrol edin." "Yellow"
    Write-Host ""
    Write-Log "Script'i doğru şekilde çalıştırmak için:" "Yellow"
    Write-Log "1. PowerShell'i açın" "White"
    Write-Log "2. Proje dizinine gidin:" "White"
    Write-Log "   cd 'C:\Users\user\Desktop\CinarVeriGoruntulemeVeAnalizPortali_v2\cinarverigoruntulemeveanalizportali'" "Cyan"
    Write-Log "3. Script'i çalıştırın:" "White"
    Write-Log "   .\init-db.ps1" "Cyan"
    Write-Host ""
    Write-Log "Alternatif olarak, tam path ile çalıştırabilirsiniz:" "Yellow"
    Write-Log "   & 'C:\Users\user\Desktop\CinarVeriGoruntulemeVeAnalizPortali_v2\cinarverigoruntulemeveanalizportali\init-db.ps1'" "Cyan"
    Write-Host ""
    Write-Log "Eğer problem devam ederse, aşağıdaki adımları manuel olarak deneyebilirsiniz:" "Yellow"
    Write-Log "  1. cd 'C:\Users\user\Desktop\CinarVeriGoruntulemeVeAnalizPortali_v2\cinarverigoruntulemeveanalizportali'" "White"
    Write-Log "  2. npm install" "White"
    Write-Log "  3. npx prisma migrate deploy" "White"
    Write-Log "  4. npx prisma generate" "White"
    Write-Log "  5. npm run prisma:seed" "White"
    exit 1
}