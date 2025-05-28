# Çınar Veri Görüntüleme ve Analiz Portalı

## 🎯 Proje Özeti
Çınar Çevre Laboratuvarı için geliştirilmiş kapsamlı veri analiz ve raporlama platformu. Excel verilerini yükleyip analiz edebilir, karmaşık formüller uygulayabilir ve profesyonel raporlar oluşturabilirsiniz.

## ✨ Özellikler

### 📊 Veri Yönetimi
- Excel dosyalarını çoklu sayfa desteği ile yükleme
- Dinamik tablo görüntüleme ve düzenleme
- Çoklu çalışma alanı (workspace) desteği
- Otomatik veri doğrulama ve temizleme

### 🧮 Gelişmiş Formül Sistemi
- **DÜZELTME ✅**: Formüllerin doğru satırlara kilitlenmesi sorunu çözüldü
- **DÜZELTME ✅**: Pizza dilimi görselleştirme sorunu çözüldü
- Karmaşık matematiksel ifadeler: `(İletkenlik + Toplam Fosfor) > (Orto Fosfat - Alkalinite)`
- Çoklu koşul desteği: `Variable > 300 AND Variable < 500`
- Değişken ve sabit karışımı: `İletkenlik + 50 > Orto Fosfat * 2`
- Renk kodlu hücre vurgulama
- Çoklu formül destekli hücreler için gelişmiş görselleştirme

### 📈 Görselleştirme
- Interaktif tablolar
- Formül sonuçlarına göre hücre renklendirme
- Tooltip ile detaylı formül bilgileri
- Çoklu formül vurgulaması için conic-gradient destekli pizza dilimi efekti

### 📄 Rapor Üretimi
- PDF rapor oluşturma
- Türkçe karakter desteği ile profesyonel düzen
- Formül sonuçlarını içeren kapsamlı raporlar
- Laboratuvar standartlarına uygun format

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm veya yarn
- PostgreSQL veritabanı

### Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Veritabanını kur
npm run db:setup

# Development sunucusunu başlat
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Teknolojiler
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Veritabanı**: PostgreSQL
- **PDF**: React-PDF, PDFKit
- **Dosya İşleme**: xlsx, multer

## 📝 Kullanım

### 1. Excel Dosyası Yükleme
1. Dashboard'da "Yeni Tablo Yükle" butonuna tıklayın
2. Excel dosyanızı seçin ve sayfa adını belirtin
3. Veriler otomatik olarak işlenip tabloya yüklenir

### 2. Formül Oluşturma
1. "Formül Yönetimi" sayfasına gidin
2. "Yeni Formül Oluştur" butonuna tıklayın
3. Formül ifadesini girin:
   - Basit: `[İletkenlik] > 300`
   - Karmaşık: `([İletkenlik] + [Toplam Fosfor]) > ([Orto Fosfat] - [Alkalinite])`
   - Çoklu koşul: `[pH] >= 7 AND [pH] <= 8.5`

### 3. Rapor Oluşturma
1. Tablo sayfasında "PDF Rapor Oluştur" butonuna tıklayın
2. Rapor ayarlarını seçin
3. PDF otomatik olarak indirilir

## 🎨 Formül Örnekleri

```javascript
// Basit karşılaştırma
İletkenlik > 300

// Matematiksel işlemler
(İletkenlik + Toplam Fosfor) > (Orto Fosfat * 2)

// Çoklu koşullar
pH >= 7 AND pH <= 8.5

// Karmaşık ifadeler
(İletkenlik * 1.5) + (Toplam Fosfor / 0.1) > 500 OR pH < 6
```

## 🐛 Çözülen Sorunlar

### ✅ Formül Satır Kilitleme Sorunu
- **Sorun**: Formüller yanlış satırlara kilitleniyordu
- **Çözüm**: Row mapping algoritması yeniden yazıldı
- **Sonuç**: Formüller artık doğru değişkenlere ve satırlara uygulanıyor

### ✅ Pizza Dilimi Görselleştirme Sorunu
- **Sorun**: Çoklu formüllü hücrelerde görsel karışıklık
- **Çözüm**: CSS conic-gradient ile gelişmiş pizza dilimi efekti
- **Sonuç**: Her formül kendine özel renk dilimi ile gösteriliyor

### ✅ Formül Ekranı Tek Ekran Olmaması
- **Sorun**: Formül yönetimi dağınık ve karmaşıktı
- **Çözüm**: Single-page application yaklaşımı ile tüm özellikler tek ekranda
- **Sonuç**: Gelişmiş formül editörü ve real-time preview

## 🔮 Gelecek Geliştirmeler
- [ ] Grafik ve chart desteği
- [ ] Otomatik rapor zamanlama
- [ ] E-posta entegrasyonu
- [ ] Mobil uygulama desteği
- [ ] API entegrasyonları

## 📞 Destek
Proje ile ilgili sorularınız için lütfen geliştirici ekibi ile iletişime geçin.

---
**Son Güncelleme**: Ocak 2025
**Versiyon**: 2.0.0 (Production Ready)
