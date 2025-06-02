# Çınar Veri Görüntüleme ve Analiz Portalı

## 📊 Proje Özeti

Çınar Veri Görüntüleme ve Analiz Portalı, su kalitesi ve laboratuvar verilerinin Excel'den otomatik yüklenmesi, gelişmiş formül kurallarıyla analiz edilmesi ve grafiksel raporlanmasını sağlayan profesyonel bir web platformudur. Çok kiracılı workspace yapısı, dinamik formül motoru, hücre bazlı renklendirme sistemi ve PDF rapor oluşturma özellikleriyle laboratuvar veri yönetimini kolaylaştırır. Modern Next.js, TypeScript, Prisma ORM ve PostgreSQL teknolojileriyle güvenli ve ölçeklenebilir mimari sunar.

## 🚀 Son Güncellemeler (2025-01-27)

### ✅ Düzeltilen Kritik Sorunlar

1. **🔒 Güvenlik Düzeltmeleri**
   - Hardcode edilmiş JWT_SECRET ve DATABASE_URL kaldırıldı
   - Environment variable tabanlı güvenli konfigürasyon eklendi
   - `.env` dosyası şablonu oluşturuldu

2. **⚙️ Konfigürasyon Tutarlılığı**
   - Çakışan `next.config.js` dosyası kaldırıldı (sadece `next.config.ts` kullanılıyor)
   - Çakışan `.eslintrc.json` kaldırıldı (modern `eslint.config.mjs` kullanılıyor)
   - Build sırasında TypeScript ve ESLint kontrolleri aktif

3. **📝 Kod Duplikasyonu Çözüldü**
   - `formulaEvaluator.ts` kaldırıldı
   - `enhancedFormulaEvaluator.ts` ana formül motoru olarak konsolide edildi
   - Geriye uyumluluk fonksiyonları eklendi

4. **🔧 Import Düzeltmeleri**
   - Tüm dosyalarda eski import'lar güncellendi
   - Type uyumsuzlukları çözüldü

## 🛠️ Kurulum

### 1. Environment Variables
`.env` dosyası oluşturun:

```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cinar_portal"
JWT_SECRET="your-very-secure-secret-key-here-minimum-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SHADOW_DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cinar_portal_shadow"
NODE_ENV="development"
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Veritabanını Hazırlayın
```bash
npm run db:setup
```

### 4. Uygulamayı Başlatın
```bash
npm run dev
```

## 📋 Özellikler

- ✅ Excel dosyası yükleme ve analizi
- ✅ Dinamik formül sistemi (konsolide edildi)
- ✅ Gerçek zamanlı veri görselleştirme
- ✅ Çoklu workspace desteği
- ✅ PDF export özelliği
- ✅ Güvenli authentication
- ✅ Responsive tasarım

## 🏗️ Teknik Mimari

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization

### Backend
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps
- **ESLint** - Code linting (modern config)
- **TypeScript** - Build-time checks active
- **Git** - Version control with proper .gitignore

## 📁 Proje Yapısı

```
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React Components
│   ├── lib/           # Utility functions
│   │   ├── enhancedFormulaEvaluator.ts  # Ana formül motoru
│   │   ├── auth/      # Authentication utilities
│   │   └── pdf/       # PDF generation
│   └── types/         # TypeScript definitions
├── prisma/            # Database schema & migrations
├── public/            # Static files
└── docs/              # Documentation
```

## 🔐 Güvenlik

- JWT token tabanlı authentication
- Environment variable'lar ile güvenli konfigürasyon
- SQL injection koruması (Prisma ORM)
- XSS koruması (Next.js built-in)
- HTTPS ready

Daha fazla güvenlik bilgisi için: [SECURITY.md](./SECURITY.md)

## 🧪 Test

```bash
# Formula evaluator testi
npm run test:formulas

# Database connection testi  
npm run test:db
```

## 📈 Performans Optimizasyonları

- Formula cache sistemi
- Lazy loading components
- Optimized database queries
- Image optimization (Next.js)
- Code splitting

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Son güncellenme**: 27 Ocak 2025  
**Versiyon**: 2.0.0 (Konsolide edilmiş)  
**Durum**: ✅ Production Ready
