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
    await prisma.$connect();
    
    health.connected = true;
    health.responseTime = Date.now() - startTime;
    
    console.log('Veritabani baglantisi basarili!');
    console.log(Baglanti suresi: ${health.responseTime}ms);
    
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
    console.log(   Kullanicilar: ${userCount});
    console.log(   Calisma Alanlari: ${workspaceCount});
    console.log(   Veri Tablolari: ${tableCount});
    console.log(   Formuller: ${formulaCount});
    console.log(   Calisma Alani Uyelikleri: ${workspaceUserCount});
    
    // Test a simple query to ensure database is responsive
    console.log('\nVeritabani sorgu testi yapiliyor...');
    const queryStartTime = Date.now();
    await prisma.$queryRawSELECT 1 as test;
    const queryTime = Date.now() - queryStartTime;
    console.log(Sorgu testi basarili (ms));
    
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
    console.error(Hata detaylari: ${error.message});
    
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
    await prisma.$disconnect();
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
