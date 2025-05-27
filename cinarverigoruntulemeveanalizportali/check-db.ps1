#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Database Connection Check Script
# Enhanced version with comprehensive database health checks

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

# Function to load environment variables from .env file
function Import-EnvFile {
    param (
        [string]$Path = ".env"
    )
    
    if (Test-Path $Path) {
        Get-Content $Path | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.+)$") {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"').Trim("'")
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
        Write-Log ".env dosyası yüklendi." "Green"
    } else {
        Write-Log ".env dosyası bulunamadı." "Yellow"
    }
}

# Main execution
try {
    Write-Log "Veritabanı bağlantısı ve sağlık kontrolü başlatılıyor..." "Cyan"
    Write-Log "=================================================" "Cyan"
    
    # Load environment variables
    Import-EnvFile
    
    # Set default DATABASE_URL if not set
    if (-not $env:DATABASE_URL) {
        $env:DATABASE_URL = "postgresql://postgres:123@localhost:5432/cinar_portal"
        Write-Log "DATABASE_URL ortam değişkeni ayarlanmadı, varsayılan değer kullanılıyor." "Yellow"
        Write-Log "Varsayılan: $env:DATABASE_URL" "Yellow"
    } else {
        Write-Log "DATABASE_URL bulundu: $($env:DATABASE_URL -replace 'postgresql://[^:]+:[^@]+@', 'postgresql://***:***@')" "Green"
    }
    
    # Check if Node.js and required packages are available
    Write-Log "Node.js ve bağımlılıklar kontrol ediliyor..." "Cyan"
    
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js bulunamadı. Lütfen Node.js'i yükleyin."
    }
    
    if (-not (Test-Path "node_modules")) {
        Write-Log "node_modules bulunamadı, bağımlılıklar yükleniyor..." "Yellow"
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Bağımlılıklar yüklenemedi."
        }
    }
    
    Write-Log "Node.js $nodeVersion - Bağımlılıklar hazır." "Green"
    
    # Check Prisma CLI
    Write-Log "Prisma CLI kontrol ediliyor..." "Cyan"
    $prismaVersion = npx prisma --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma CLI bulunamadı. 'npm install' komutunu çalıştırın."
    }
    Write-Log "Prisma CLI hazır." "Green"
    
    # Create enhanced database check script
    $tempFile = "temp-enhanced-db-check.ts"
    
    @"
import { PrismaClient } from '@prisma/client';

interface DatabaseStats {
  users: number;
  workspaces: number;
  dataTables: number;
  formulas: number;
  workspaceUsers: number;
}

interface DatabaseHealth {
  connected: boolean;
  responseTime: number;
  stats: DatabaseStats | null;
  errors: string[];
}

async function performDatabaseHealthCheck(): Promise<DatabaseHealth> {
  const prisma = new PrismaClient({
    log: ['error'],
  });
  
  const health: DatabaseHealth = {
    connected: false,
    responseTime: 0,
    stats: null,
    errors: []
  };
  
  const startTime = Date.now();
  
  try {
    // Test basic connection
    console.log('Veritabani baglantisi test ediliyor...');
    await prisma.`$connect();
    
    health.connected = true;
    health.responseTime = Date.now() - startTime;
    
    console.log('Veritabani baglantisi basarili!');
    console.log(`Baglanti suresi: `${health.responseTime}ms`);
    
    // Test database operations and get statistics
    console.log('\nVeritabani istatistikleri aliniyor...');
    
    const [userCount, workspaceCount, tableCount, formulaCount, workspaceUserCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.workspace.count().catch(() => 0),
      prisma.dataTable.count().catch(() => 0),
      prisma.formula.count().catch(() => 0),
      prisma.workspaceUser.count().catch(() => 0)
    ]);
    
    health.stats = {
      users: userCount,
      workspaces: workspaceCount,
      dataTables: tableCount,
      formulas: formulaCount,
      workspaceUsers: workspaceUserCount
    };
    
    // Display statistics
    console.log('\nVeritabani Istatistikleri:');
    console.log(`   Kullanicilar: `${userCount}`);
    console.log(`   Calisma Alanlari: `${workspaceCount}`);
    console.log(`   Veri Tablolari: `${tableCount}`);
    console.log(`   Formuller: `${formulaCount}`);
    console.log(`   Calisma Alani Uyelikleri: `${workspaceUserCount}`);
    
    // Test a simple query to ensure database is responsive
    console.log('\nVeritabani sorgu testi yapiliyor...');
    const queryStartTime = Date.now();
    await prisma.`$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - queryStartTime;
    console.log(`Sorgu testi basarili (${queryTime}ms)`);
    
    // Check for potential issues
    if (health.responseTime > 5000) {
      health.errors.push('Yavas baglanti suresi (>5s)');
      console.log('Uyari: Baglanti suresi yavas');
    }
    
    if (queryTime > 1000) {
      health.errors.push('Yavas sorgu suresi (>1s)');
      console.log('Uyari: Sorgu suresi yavas');
    }
    
    console.log('\nVeritabani saglik kontrolu tamamlandi!');
    
  } catch (error: any) {
    health.connected = false;
    health.errors.push(error.message);
    
    console.error('Veritabani baglantisi basarisiz!');
    console.error(`Hata detaylari: `${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Cozum onerisi: PostgreSQL servisinin calistiginden emin olun.');
    } else if (error.message.includes('authentication failed')) {
      console.error('Cozum onerisi: Veritabani kullanici adi ve sifresini kontrol edin.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('Cozum onerisi: Veritabanini olusturun veya init-db.ps1 scriptini calistirin.');
    }
    
    process.exit(1);
  } finally {
    await prisma.`$disconnect();
  }
  
  return health;
}

// Run the health check
performDatabaseHealthCheck()
  .then((health) => {
    if (health.connected && health.errors.length === 0) {
      console.log('\nTum kontroller basarili!');
      process.exit(0);
    } else if (health.connected && health.errors.length > 0) {
      console.log('\nBaglanti var ama uyarilar mevcut.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Beklenmeyen hata:', error);
    process.exit(1);
  });
"@ | Out-File -Encoding utf8 $tempFile
    
    # Run the enhanced database check
    Write-Log "Gelişmiş veritabanı sağlık kontrolü çalıştırılıyor..." "Yellow"
    npx ts-node $tempFile
    $dbCheckResult = $LASTEXITCODE
    
    # Clean up
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    if ($dbCheckResult -ne 0) {
        Write-Log "Veritabanı sağlık kontrolü başarısız!" "Red"
        Write-Log "Önerilen çözümler:" "Yellow"
        Write-Log "  1. PostgreSQL servisinin çalıştığından emin olun" "White"
        Write-Log "  2. .env dosyasındaki DATABASE_URL'yi kontrol edin" "White"
        Write-Log "  3. Veritabanını başlatmak için 'init-db.ps1' scriptini çalıştırın" "White"
        Write-Log "  4. Prisma şemasını güncellemek için 'npx prisma migrate dev' çalıştırın" "White"
        exit 1
    } else {
        Write-Log "=================================================" "Green"
        Write-Log "Veritabanı sağlık kontrolü başarıyla tamamlandı!" "Green"
        Write-Log "=================================================" "Green"
    }
    
} catch {
    Write-Log "HATA: $_" "Red"
    Write-Log "Veritabanı kontrolü sırasında beklenmeyen bir hata oluştu." "Red"
    exit 1
}