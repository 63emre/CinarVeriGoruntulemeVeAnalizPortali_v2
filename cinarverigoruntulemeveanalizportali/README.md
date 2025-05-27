# Çınar Veri Görüntüleme ve Analiz Portali

<div align="center">
  <img src="public/company-logo.png" alt="Çınar Çevre Laboratuvarı Logo" width="300"/>
  <p>Modern, güvenli ve kullanıcı dostu çevre analizi verilerini görüntüleme platformu</p>
</div>

## 📑 Proje Hakkında

Çınar Veri Görüntüleme ve Analiz Portali, çevre laboratuvarı analiz verilerinin yönetilmesi, görüntülenmesi ve analiz edilmesi için geliştirilmiş web tabanlı bir uygulamadır. Bu portal, Excel dosyalarından veri yüklemeyi, formül tanımlamayı ve veri analizini kolaylaştırarak laboratuvar süreçlerini optimize eder.

### 🌟 Özellikler

- 🔐 **Rol Tabanlı Erişim Kontrolü**: Admin ve Kullanıcı rolleri
- 📊 **Excel Veri Yükleme ve Görüntüleme**: Excel verilerini sisteme aktarma ve tablolarda görüntüleme
- 📝 **Formül Yönetimi**: Değişkenler üzerinde karşılaştırma ve hesaplamalar yapma
- 📈 **Analiz ve Grafikler**: Veri eğilimleri ve analizler
- 📋 **PDF Raporlama**: Renkli hücre vurgulamaları ile PDF raporları oluşturma
- 👥 **Çalışma Alanı Yönetimi**: Farklı projeleri izole etme ve yönetme
- 🔍 **Veri Arama ve Filtreleme**: Tablolarda arama ve sıralama

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15.3.2, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: Özel JWT tabanlı kimlik doğrulama
- **Excel İşleme**: xlsx
- **PDF Oluşturma**: jsPDF
- **Deployment**: Vercel (önerilen)

## ⚙️ Kurulum ve Çalıştırma

### Ön Gereksinimler

- Node.js 18.0 veya üzeri
- PostgreSQL veritabanı
- Git
- PowerShell (Windows)

### Kurulum Adımları

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/your-username/CinarVeriGoruntulemeveanalizportali.git
   cd CinarVeriGoruntulemeveanalizportali
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. **Kolay Kurulum (Önerilen)**: PowerShell script'ini kullanın:
   ```powershell
   # Proje dizininde:
   .\init-db.ps1
   
   # Veya ana dizinden:
   .\run-init-db.ps1
   ```

4. **Manuel Kurulum**: Adım adım kurulum:
   ```bash
   # .env dosyasını oluşturun ve veritabanı bağlantısını yapılandırın
   cp .env.example .env
   
   # Veritabanı migrasyonlarını uygulayın
   npx prisma migrate deploy
   
   # Prisma client'ı oluşturun
   npx prisma generate
   
   # Başlangıç verilerini yükleyin (opsiyonel)
   npm run prisma:seed
   ```

5. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

### 🚀 Hızlı Başlangıç

Projeyi hızlıca başlatmak için otomatik script'leri kullanabilirsiniz:

```powershell
# Proje dizininde - Tam otomatik kurulum ve başlatma:
.\start-project.ps1

# Sadece veritabanı kurulumu:
.\init-db.ps1

# Ana dizinden çalıştırmak için:
.\run-init-db.ps1
```

3. `.env` dosyasını oluşturun:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/cinar_portal"
   JWT_SECRET="your-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Veritabanını kurma seçenekleri:
   
   **A. Otomatik kurulum**:
   ```bash
   npm run db:setup
   ```
   
   Bu komut, migrationları uygular, Prisma istemcisini oluşturur ve örnek verileri ekler.
   
   **B. Manuel kurulum adımları**:
   - Migrationları uygulama: `npm run prisma:migrate`
   - Prisma istemcisini oluşturma: `npm run prisma:generate`
   - Örnek verileri yükleme (opsiyonel): `npm run prisma:seed`
   
   **C. PowerShell script ile kurulum (Windows)**:
   ```bash
   ./init-db.ps1
   ```
   
   **Veritabanını sıfırlama (tüm veriler silinir)**:
   ```bash
   npm run db:reset
   ```
   
   **Prisma Studio ile veritabanını görüntüleme**:
   ```bash
   npm run prisma:studio
   ```

5. Geliştirme modunda çalıştırın:
   ```bash
   npm run dev
   ```

6. Uygulamaya `http://localhost:3000` adresinden erişebilirsiniz

### Üretim Ortamına Dağıtım

1. Uygulamayı derleyin:
   ```bash
   npm run build
   ```

2. Üretim modunda çalıştırın:
   ```bash
   npm run start
   ```

## 📁 Proje Yapısı

```
├── prisma/                  # Veritabanı şeması ve migrationlar
├── public/                  # Statik dosyalar
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API rotaları
│   │   ├── auth/            # Kimlik doğrulama sayfaları
│   │   ├── dashboard/       # Kontrol paneli
│   │   └── ...
│   ├── components/          # React bileşenleri
│   │   ├── auth/            # Kimlik doğrulama ile ilgili bileşenler
│   │   ├── dashboard/       # Kontrol paneli bileşenleri
│   │   ├── formulas/        # Formül yönetimi bileşenleri
│   │   ├── tables/          # Tablo görüntüleme bileşenleri
│   │   └── ...
│   ├── lib/                 # Yardımcı fonksiyonlar
│   │   ├── auth/            # Kimlik doğrulama işlevleri
│   │   ├── db.ts            # Veritabanı bağlantısı
│   │   ├── excel/           # Excel işleme
│   │   ├── formula/         # Formül işleme
│   │   └── pdf/             # PDF oluşturma
│   ├── styles/              # Global stiller
│   └── types/               # TypeScript tipleri
├── .env                     # Ortam değişkenleri
├── next.config.js           # Next.js yapılandırması
├── package.json             # Proje bağımlılıkları
└── tsconfig.json            # TypeScript yapılandırması
```

## 📊 Veri Modeli

Sistem aşağıdaki ana veri modellerini kullanır:

- **User**: Kullanıcı bilgileri ve rol atamaları
- **Workspace**: Çalışma alanları ve kullanıcı izinleri
- **DataTable**: Excel'den yüklenen veri tabloları
- **Formula**: Tanımlanan formül ve koşullar

## 🔧 Kullanım Örnekleri

### Excel Yükleme

1. Dashboard'dan çalışma alanı seçin
2. "Excel Yükle" butonuna tıklayın
3. Excel dosyasını sürükleyin veya seçin
4. Yükleme tamamlandığında, tablo listesinde görüntülenecektir

### Formül Oluşturma

1. Formül Yönetim ekranını açın
2. Yeni formül oluştur'a tıklayın
3. Formül adı ve açıklaması girin
4. Açılır menülerden değişkenleri ve operatörleri seçin
5. Formülü kaydedin ve tabloya uygulayın

### PDF Raporu Alma

1. Görüntülemek istediğiniz tabloyu seçin
2. "PDF'e Aktar" butonuna tıklayın
3. PDF, formül renklendirmeleri dahil indirilecektir

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 👥 Katkıda Bulunanlar

- Çınar Çevre Laboratuvarı Ekibi

## 📞 İletişim

Sorularınız veya önerileriniz için lütfen iletişime geçin:

- E-posta: info@cinarcevre.com
- Web sitesi: [www.cinarcevre.com](https://www.cinarcevre.com)
