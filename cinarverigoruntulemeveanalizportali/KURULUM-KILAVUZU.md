# 🚀 Çınar Portalı - Hızlı Başlangıç Kılavuzu

Bu kılavuz, Çınar Veri Görüntüleme ve Analiz Portalı'nı hızlıca kurmak ve çalıştırmak için gerekli adımları içerir.

## 📋 Ön Hazırlık

1. **PostgreSQL Veritabanı**:
   - PostgreSQL'in yüklü olduğundan emin olun
   - Yeni bir veritabanı oluşturun: `cinar_db`
   - Kullanıcı adı ve şifrenizi not edin

2. **Node.js**: 
   - Node.js 18+ sürümünün yüklü olduğundan emin olun
   - Terminal'de `node --version` komutu ile kontrol edin

## 🔧 Kurulum

### Seçenek 1: Otomatik Kurulum (Önerilen)

```powershell
# 1. PowerShell'i yönetici olarak açın
# 2. Proje dizinine gidin:
cd "C:\Users\user\Desktop\CinarVeriGoruntulemeVeAnalizPortali_v2\cinarverigoruntulemeveanalizportali"

# 3. Otomatik kurulum script'ini çalıştırın:
.\init-db.ps1
```

### Seçenek 2: Ana Dizinden Çalıştırma

```powershell
# Ana dizinden (CinarVeriGoruntulemeVeAnalizPortali_v2):
.\run-init-db.ps1
```

### Seçenek 3: Manuel Kurulum

1. **Environment dosyasını oluşturun**:
   ```powershell
   copy .env.example .env
   ```

2. **`.env` dosyasını düzenleyin**:
   - `DATABASE_URL` değerini kendi veritabanı bilgilerinizle değiştirin
   - Örnek: `postgresql://postgres:password@localhost:5432/cinar_db`

3. **Kurulum komutlarını çalıştırın**:
   ```powershell
   npm install
   npx prisma migrate deploy
   npx prisma generate
   npm run prisma:seed
   ```

## 🎯 Uygulamayı Başlatma

```powershell
# Geliştirme modu:
npm run dev

# Veya otomatik başlatma script'i:
.\start-project.ps1
```

Uygulama `http://localhost:3000` adresinde çalışacak.

## 👤 İlk Giriş

**Admin Kullanıcısı**:
- Email: `admin@cinar.com`
- Şifre: `Admin123!`

## 🔍 Sorun Giderme

### Script Hataları
```powershell
# Execution Policy hatası alırsanız:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Encoding sorunları için:
chcp 65001
```

### Veritabanı Hataları
- `.env` dosyasında `DATABASE_URL` doğru mu?
- PostgreSQL servisi çalışıyor mu?
- Veritabanı `cinar_db` oluşturuldu mu?

### Node.js Hataları
```powershell
# Node modules'leri temizle ve yeniden yükle:
rm -rf node_modules
rm package-lock.json
npm install
```

## 📚 Yararlı Komutlar

```powershell
# Veritabanını sıfırla:
npx prisma migrate reset

# Prisma Studio (veritabanı yöneticisi):
npm run prisma:studio

# Veritabanı durumunu kontrol et:
.\check-db.ps1

# Performans kontrolü:
.\check-db-performance.ps1
```

## 🎨 Geliştirme

```powershell
# Kod kontrolü:
npm run lint

# Build oluştur:
npm run build

# Production başlat:
npm start
```

## 📞 Destek

Sorun yaşıyorsanız:
1. Bu kılavuzu tekrar kontrol edin
2. Log dosyalarını inceleyin
3. GitHub issues'a sorun bildirin
4. Script'lerin detaylı hata mesajlarını okuyun
