#!/usr/bin/env pwsh
# Çınar Veri Görüntüleme ve Analiz Portalı - Database Performance Check Script
# Enhanced version with comprehensive performance metrics and analysis

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
    }
}

# Function to format performance results
function Format-PerformanceResult {
    param (
        [string]$TestName,
        [double]$Duration,
        [string]$Status = "OK"
    )
    
    $color = "Green"
    $icon = "✓"
    
    if ($Duration -gt 1000) {
        $color = "Red"
        $icon = "✗"
        $Status = "SLOW"
    } elseif ($Duration -gt 500) {
        $color = "Yellow"
        $icon = "⚠"
        $Status = "WARNING"
    }
    
    Write-Host "  $icon $TestName" -ForegroundColor $color -NoNewline
    Write-Host " - ${Duration}ms" -ForegroundColor White -NoNewline
    Write-Host " [$Status]" -ForegroundColor $color
}

# Main execution
try {
    Write-Log "Veritabanı performans analizi başlatılıyor..." "Cyan"
    Write-Log "=============================================" "Cyan"
    
    # Load environment variables
    Import-EnvFile
    
    # Set default DATABASE_URL if not set
    if (-not $env:DATABASE_URL) {
        $env:DATABASE_URL = "postgresql://postgres:123@localhost:5432/cinar_portal"
        Write-Log "DATABASE_URL ortam değişkeni ayarlanmadı, varsayılan değer kullanılıyor." "Yellow"
    }
    
    # Check prerequisites
    Write-Log "Ön koşullar kontrol ediliyor..." "Cyan"
    
    if (-not (Test-Path "node_modules")) {
        Write-Log "node_modules bulunamadı, bağımlılıklar yükleniyor..." "Yellow"
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Bağımlılıklar yüklenemedi."
        }
    }
    
    # Create comprehensive performance test script
    $tempFile = "temp-performance-check.ts"
    
    @"
import { PrismaClient } from '@prisma/client';

interface PerformanceMetrics {
  connectionTime: number;
  simpleQueryTime: number;
  complexQueryTime: number;
  insertTime: number;
  updateTime: number;
  deleteTime: number;
  transactionTime: number;
  concurrentQueryTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

interface PerformanceResult {
  metrics: PerformanceMetrics;
  recommendations: string[];
  overallScore: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

async function measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;
  return { result, duration };
}

async function runPerformanceTests(): Promise<PerformanceResult> {
  const prisma = new PrismaClient({
    log: ['error'],
  });
  
  const metrics: PerformanceMetrics = {
    connectionTime: 0,
    simpleQueryTime: 0,
    complexQueryTime: 0,
    insertTime: 0,
    updateTime: 0,
    deleteTime: 0,
    transactionTime: 0,
    concurrentQueryTime: 0,
    memoryUsage: {
      heapUsed: 0,
      heapTotal: 0,
      external: 0
    }
  };
  
  const recommendations: string[] = [];
  
  try {
    console.log('🚀 Performans testleri başlatılıyor...\n');
    
    // Test 1: Connection Time
    console.log('📡 Bağlantı süresi testi...');
    const connectionTest = await measureTime(async () => {
      await prisma.`$connect();
      return true;
    });
    metrics.connectionTime = connectionTest.duration;
    console.log(`   Bağlantı süresi: ${metrics.connectionTime}ms`);
    
    if (metrics.connectionTime > 2000) {
      recommendations.push('Bağlantı süresi yavaş. Veritabanı sunucusu performansını kontrol edin.');
    }
    
    // Test 2: Simple Query Performance
    console.log('\n🔍 Basit sorgu performansı...');
    const simpleQueryTest = await measureTime(async () => {
      return await prisma.`$queryRaw`SELECT 1 as test, NOW() as current_time`;
    });
    metrics.simpleQueryTime = simpleQueryTest.duration;
    console.log(`   Basit sorgu süresi: ${metrics.simpleQueryTime}ms`);
    
    // Test 3: Complex Query Performance (if data exists)
    console.log('\n🧮 Karmaşık sorgu performansı...');
    const complexQueryTest = await measureTime(async () => {
      return await prisma.user.findMany({
        include: {
          workspaces: {
            include: {
              workspace: {
                include: {
                  dataTables: true,
                  formulas: true
                }
              }
            }
          }
        },
        take: 10
      });
    });
    metrics.complexQueryTime = complexQueryTest.duration;
    console.log(`   Karmaşık sorgu süresi: ${metrics.complexQueryTime}ms`);
    
    if (metrics.complexQueryTime > 1000) {
      recommendations.push('Karmaşık sorgular yavaş. İndeks optimizasyonu düşünün.');
    }
    
    // Test 4: Insert Performance
    console.log('\n➕ Ekleme performansı...');
    const testEmail = `perf-test-${Date.now()}@example.com`;
    const insertTest = await measureTime(async () => {
      return await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Performance Test User',
          role: 'USER'
        }
      });
    });
    metrics.insertTime = insertTest.duration;
    console.log(`   Ekleme süresi: ${metrics.insertTime}ms`);
    
    // Test 5: Update Performance
    console.log('\n✏️  Güncelleme performansı...');
    const updateTest = await measureTime(async () => {
      return await prisma.user.update({
        where: { id: insertTest.result.id },
        data: { name: 'Updated Performance Test User' }
      });
    });
    metrics.updateTime = updateTest.duration;
    console.log(`   Güncelleme süresi: ${metrics.updateTime}ms`);
    
    // Test 6: Delete Performance
    console.log('\n🗑️  Silme performansı...');
    const deleteTest = await measureTime(async () => {
      return await prisma.user.delete({
        where: { id: insertTest.result.id }
      });
    });
    metrics.deleteTime = deleteTest.duration;
    console.log(`   Silme süresi: ${metrics.deleteTime}ms`);
    
    // Test 7: Transaction Performance
    console.log('\n🔄 Transaction performansı...');
    const transactionTest = await measureTime(async () => {
      return await prisma.`$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: `tx-test-${Date.now()}@example.com`,
            name: 'Transaction Test User',
            role: 'USER'
          }
        });
        
        await tx.user.update({
          where: { id: user.id },
          data: { name: 'Updated Transaction Test User' }
        });
        
        await tx.user.delete({
          where: { id: user.id }
        });
        
        return user;
      });
    });
    metrics.transactionTime = transactionTest.duration;
    console.log(`   Transaction süresi: ${metrics.transactionTime}ms`);
    
    // Test 8: Concurrent Query Performance
    console.log('\n⚡ Eşzamanlı sorgu performansı...');
    const concurrentTest = await measureTime(async () => {
      const promises = Array.from({ length: 5 }, () => 
        prisma.`$queryRaw`SELECT COUNT(*) as count FROM "User"`
      );
      return await Promise.all(promises);
    });
    metrics.concurrentQueryTime = concurrentTest.duration;
    console.log(`   5 eşzamanlı sorgu süresi: ${metrics.concurrentQueryTime}ms`);
    
    // Memory Usage
    const memUsage = process.memoryUsage();
    metrics.memoryUsage = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
    };
    
    console.log(`\n💾 Bellek kullanımı:`);
    console.log(`   Heap kullanılan: ${metrics.memoryUsage.heapUsed} MB`);
    console.log(`   Heap toplam: ${metrics.memoryUsage.heapTotal} MB`);
    console.log(`   External: ${metrics.memoryUsage.external} MB`);
    
    // Calculate overall score
    let score = 0;
    const tests = [
      metrics.connectionTime,
      metrics.simpleQueryTime,
      metrics.complexQueryTime,
      metrics.insertTime,
      metrics.updateTime,
      metrics.deleteTime,
      metrics.transactionTime
    ];
    
    tests.forEach(time => {
      if (time < 100) score += 4;
      else if (time < 300) score += 3;
      else if (time < 500) score += 2;
      else if (time < 1000) score += 1;
      else score += 0;
    });
    
    const maxScore = tests.length * 4;
    const percentage = (score / maxScore) * 100;
    
    let overallScore: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    if (percentage >= 90) overallScore = 'EXCELLENT';
    else if (percentage >= 75) overallScore = 'GOOD';
    else if (percentage >= 50) overallScore = 'FAIR';
    else overallScore = 'POOR';
    
    // Additional recommendations
    if (metrics.memoryUsage.heapUsed > 100) {
      recommendations.push('Yüksek bellek kullanımı tespit edildi. Bellek optimizasyonu gerekebilir.');
    }
    
    if (metrics.concurrentQueryTime > metrics.simpleQueryTime * 3) {
      recommendations.push('Eşzamanlı sorgu performansı düşük. Bağlantı havuzu ayarlarını kontrol edin.');
    }
    
    // Display results
    console.log('\n📊 PERFORMANS RAPORU');
    console.log('====================');
    console.log(`Genel Skor: ${overallScore} (${Math.round(percentage)}%)`);
    
    if (recommendations.length > 0) {
      console.log('\n💡 Öneriler:');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    } else {
      console.log('\n✅ Tüm performans testleri başarılı!');
    }
    
    return {
      metrics,
      recommendations,
      overallScore
    };
    
  } catch (error: any) {
    console.error('\n❌ Performans testi sırasında hata:', error.message);
    throw error;
  } finally {
    await prisma.`$disconnect();
  }
}

// Run performance tests
runPerformanceTests()
  .then((result) => {
    console.log('\n🎯 Performans analizi tamamlandı!');
    
    if (result.overallScore === 'POOR') {
      console.log('\n⚠️  Performans sorunları tespit edildi. Optimizasyon gerekli.');
      process.exit(1);
    } else {
      console.log('\n✅ Performans kabul edilebilir seviyede.');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n💥 Performans testi başarısız:', error.message);
    process.exit(1);
  });
"@ | Out-File -Encoding utf8 $tempFile
    
    # Run the performance test
    Write-Log "Kapsamlı performans testleri çalıştırılıyor..." "Yellow"
    Write-Log "Bu işlem birkaç dakika sürebilir..." "Yellow"
    
    npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" $tempFile
    $perfTestResult = $LASTEXITCODE
    
    # Clean up
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
    if ($perfTestResult -ne 0) {
        Write-Log "=============================================" "Red"
        Write-Log "Performans testleri başarısız!" "Red"
        Write-Log "=============================================" "Red"
        Write-Log "Önerilen iyileştirmeler:" "Yellow"
        Write-Log "  1. PostgreSQL yapılandırmasını optimize edin" "White"
        Write-Log "  2. Veritabanı indekslerini kontrol edin" "White"
        Write-Log "  3. Bağlantı havuzu ayarlarını gözden geçirin" "White"
        Write-Log "  4. Sunucu kaynaklarını (RAM, CPU) artırın" "White"
        Write-Log "  5. Veritabanı istatistiklerini güncelleyin (ANALYZE)" "White"
        exit 1
    } else {
        Write-Log "=============================================" "Green"
        Write-Log "Performans analizi başarıyla tamamlandı!" "Green"
        Write-Log "=============================================" "Green"
        Write-Log "Performans izleme önerileri:" "Cyan"
        Write-Log "  • Bu testi düzenli olarak çalıştırın" "White"
        Write-Log "  • Yavaş sorguları loglamak için Prisma log ayarlarını kullanın" "White"
        Write-Log "  • Veritabanı metriklerini izlemek için monitoring araçları kurun" "White"
        Write-Log "  • Büyük veri setleri için sayfalama kullanın" "White"
    }
    
} catch {
    Write-Log "HATA: $_" "Red"
    Write-Log "Performans kontrolü sırasında beklenmeyen bir hata oluştu." "Red"
    exit 1
} 