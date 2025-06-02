# Güvenlik Rehberi

## 🔒 Güvenlik Konfigürasyonu

### Environment Variables
Proje artık hassas bilgileri güvenli şekilde yönetmektedir:

```bash
# .env dosyası oluşturun (repo'ya commit etmeyin!)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cinar_portal"
JWT_SECRET="your-very-secure-secret-key-here-minimum-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SHADOW_DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cinar_portal_shadow"
NODE_ENV="development"
```

### Güvenlik Önlemleri

#### 1. Database Security
- Veritabanı bağlantısı environment variable'lardan okunuyor
- Prisma shadow database kullanılıyor
- SQL injection koruması Prisma tarafından sağlanıyor

#### 2. JWT Security  
- JWT secret key environment variable'dan okunuyor
- Minimum 32 karakter güçlü anahtar kullanın
- Production'da farklı ve güçlü key kullanın

#### 3. Build Security
- TypeScript tip kontrolleri aktif
- ESLint kontrolleri aktif
- Generated dosyalar ignore ediliyor

### Güvenlik Kontrol Listesi

- [ ] `.env` dosyası oluşturuldu ve `.gitignore'da
- [ ] Güçlü JWT_SECRET kullanılıyor
- [ ] DATABASE_URL production ortamında güvenli
- [ ] Hassas bilgiler hardcode edilmemiş
- [ ] Regular security audit yapılıyor

### Güvenlik Açığı Bildirimi

Güvenlik açığı bulduğunuzda lütfen gizli olarak bildirin.

## 🛡️ Güvenlik Güncellemeleri

### Son Düzeltmeler (2025-01-27)
- ✅ Hardcode edilmiş JWT_SECRET kaldırıldı
- ✅ Hardcode edilmiş DATABASE_URL kaldırıldı
- ✅ Environment variable tabanlı konfigürasyon eklendi
- ✅ Build sırasında güvenlik kontrolleri aktif
- ✅ Çift konfigürasyon dosyaları temizlendi 