# 🧪 Çınar Veri Portalı - Enhanced Features Test Kılavuzu

Bu kılavuz, yeni eklenen özelliklerin kapsamlı testini yapmak için adım adım talimatlar içerir.

## 🚀 Hızlı Test Senaryosu (5 Dakika)

### 1. Ortam Hazırlığı
```bash
# Geliştirme sunucusunu başlat
npm run dev

# Test verisini hazırla (isteğe bağlı)
cp ./docs/test-data/sample-water-data.xlsx ./uploads/
```

### 2. Temel İşlevsellik Testi
- [ ] **Giriş**: `http://localhost:3000` - Admin ile giriş yapın
- [ ] **Workspace**: Yeni workspace oluşturun ("Test Workspace")
- [ ] **Veri Yükleme**: Excel dosyası yükleyin (İletkenlik, pH, Alkalinite sütunları olsun)
- [ ] **Tablo Görüntüleme**: Yüklenen veriyi tablo olarak görüntüleyin

## 🍕 Pizza Slice Effect Testi

### Test Senaryosu 1: Tek Formül
```bash
1. Formül oluştur: "İletkenlik > 300"
2. Formülü tabloya uygula
3. Beklenen sonuç: Normal renkli vurgulama (tek renk)
```

### Test Senaryosu 2: Çift Formül  
```bash
1. İkinci formül: "pH > 7"
2. Her iki formülü de tabloya uygula
3. Beklenen sonuç: Yarım-yarım pizza dilimi (2 renk)
4. Hover efekti: Tooltip'te iki formül bilgisi
```

### Test Senaryosu 3: Üçlü Formül (Pizza Slice)
```bash
1. Üçüncü formül: "Alkalinite < 50"
2. Üç formülü de aynı hücreye uygula
3. Beklenen sonuç: 
   - 3 eşit pizza dilimi
   - Merkezde sayı göstergesi (3)
   - Dönen animasyon efekti
   - Detaylı tooltip
```

### Test Kontrol Listesi
- [ ] 1 formül: Normal vurgulama
- [ ] 2 formül: İkiye bölünmüş hücre
- [ ] 3+ formül: Pizza slice efekti
- [ ] Hücre köşesinde sayı göstergesi görünüyor
- [ ] Hover'da tooltip açılıyor
- [ ] Tooltip'te formül detayları doğru
- [ ] Animasyon 3+ formülde aktif

## 🔄 Otomatik Yenilenme Testi

### Yenilenme Kontrolleri
```bash
1. Tablo sayfasına git
2. "Otomatik Yenile" checkbox'ını işaretle
3. Interval'ı "10s" olarak ayarla
4. Yeni formül oluştur
5. Beklenen: Otomatik yenilenme aktif olur (10 saniye)
```

### Test Kontrol Listesi
- [ ] Checkbox çalışıyor
- [ ] Interval dropdown fonksiyonel
- [ ] "Son yenilenme" zamanı görünüyor
- [ ] Formül oluşturma sonrası otomatik aktifleştirme
- [ ] Formül silme sonrası otomatik aktifleştirme
- [ ] Formül değiştirme sonrası otomatik aktifleştirme

## 📄 PDF Türkçe Karakter Testi

### Test Verileri
```
Sütun adları: İletkenlik, pH, Alkalinite, Çözünmüş Oksijen
Test değerleri: Yüksek, düşük, orta, şüpheli, çözümlü
Formül adları: "Yüksek İletkenlik Kontrolü", "pH Değer Aralığı"
```

### PDF Test Adımları
```bash
1. Türkçe karakterli veri yükle
2. Türkçe karakterli formüller oluştur  
3. Pizza slice effect'li hücreler elde et
4. PDF raporu oluştur (Excel download yerine)
5. PDF'i aç ve kontrol et
```

### PDF Kontrol Listesi
- [ ] Türkçe karakterler düzgün görünüyor (ğ, ü, ş, ı, ö, ç)
- [ ] Formül adları bozulmuyor
- [ ] Tablo başlıkları doğru
- [ ] Pizza slice bilgileri PDF'te var
- [ ] Genel layout düzgün

## 🎯 Scope Management Testi

### Tablo Kapsamı (Table Scope)
```bash
1. Formül yönetimi sayfasına git
2. "Yeni Formül" butonuna tıkla
3. Scope: "Tablo" seç
4. Tablo seç: [TestTable]
5. Formül: "İletkenlik > 500" (tek yönlü)
6. Kaydet
7. Kontrol: Sadece seçili tabloda çalışmalı
```

### Workspace Kapsamı (Workspace Scope)
```bash
1. Scope: "Workspace" seç
2. Formül: "İletkenlik > 300 AND pH > 7" (çoklu koşul)
3. Kaydet  
4. Kontrol: Tüm workspace tablolarında çalışmalı
```

### Tek Yönlü Kısıtlama Testi
```bash
Geçerli formüller (Tablo kapsamı):
✅ "İletkenlik > 300"
✅ "pH < Alkalinite + 2"  
✅ "Çözünmüş Oksijen > Sıcaklık * 1.5"

Geçersiz formüller (Tablo kapsamı):
❌ "İletkenlik + pH > Alkalinite + Sıcaklık"
❌ "(pH * 2) > (İletkenlik / 3)"
❌ "pH + İletkenlik > 300"
```

### Scope Kontrol Listesi
- [ ] Tablo kapsamı: Tek tablo sınırlaması çalışıyor
- [ ] Workspace kapsamı: Tüm tablolar etkileniyor
- [ ] Tek yönlü kısıtlama: Sol tarafta tek değişken kontrolü
- [ ] UI uyarıları: Geçersiz formüller engelleniyor
- [ ] Bağlam duyarlı yardım metinleri görünüyor

## 🔧 Teknik Performans Testi

### Büyük Veri Testi
```bash
1. 1000+ satırlı Excel dosyası yükle
2. 5+ formül oluştur
3. Hepsini aynı anda uygula
4. Pizza slice efektinin performansını gözlemle
5. Otomatik yenilenme stres testi
```

### Performans Kontrol Listesi
- [ ] 1000+ satır: 3 saniye altında yükleme
- [ ] 5+ formül: Anlık uygulama
- [ ] Pizza slice: Lag olmadan render
- [ ] Otomatik yenilenme: CPU kullanımı makul
- [ ] Memory leaks: Uzun kullanımda sabit bellek

## 🐛 Hata Durumları Testi

### Beklenmeyen Durumlar
```bash
1. Boş Excel dosyası yükleme
2. Türkçe karakterli formül adı (çok uzun)
3. Geçersiz formül ifadesi
4. Network kesintisi sırasında otomatik yenilenme
5. Çok fazla formül (10+) aynı hücrede
```

### Hata Kontrol Listesi
- [ ] Boş dosya: Anlamlı hata mesajı
- [ ] Uzun formül adı: Karakter sınırı uyarısı
- [ ] Geçersiz formül: Türkçe hata açıklaması
- [ ] Network hatası: Graceful degradation
- [ ] 10+ formül: Performans korunuyor

## 📱 Responsive & Erişilebilirlik Testi

### Mobil Test
```bash
1. Chrome DevTools: Mobile görünüm
2. Tablet görünümü test et
3. Touch interaction'lar
4. Pizza slice hover -> touch equivalent
```

### Erişilebilirlik
```bash
1. Screen reader uyumluluğu
2. Klavye navigation (Tab, Enter, ESC)
3. Color contrast ratios
4. Alt text ve ARIA labels
```

## 🎯 Son Kontrol Listesi

### Kritik Özellikler
- [ ] **Pizza Slice**: 3+ formülde çalışıyor
- [ ] **Auto-refresh**: Formül değişikliği sonrası aktif
- [ ] **PDF Turkish**: Karakter sorunları çözüldü
- [ ] **Scope Management**: Table vs Workspace ayrımı
- [ ] **Unidirectional**: Tek yönlü formül kısıtlaması

### İsteğe Bağlı İyileştirmeler
- [ ] Performans optimizasyonları
- [ ] Gelişmiş animasyonlar
- [ ] Ek klavye kısayolları
- [ ] Advanced tooltip içerikleri
- [ ] Custom color themes

---

## 📋 Test Raporu Şablonu

```markdown
## Test Sonuçları - [Tarih]

### Pizza Slice Effect
- ✅/❌ 1 formül: Normal vurgulama
- ✅/❌ 2 formül: Yarım pizza slice
- ✅/❌ 3+ formül: Tam pizza slice
- ✅/❌ Animasyon çalışıyor
- ✅/❌ Tooltip detayları doğru

### Auto-refresh System  
- ✅/❌ Manuel kontroller çalışıyor
- ✅/❌ Otomatik tetikleme aktif
- ✅/❌ Performance impact minimal

### PDF & Turkish Support
- ✅/❌ Türkçe karakterler düzgün
- ✅/❌ Pizza slice bilgileri PDF'te
- ✅/❌ Layout bozulmuyor

### Scope Management
- ✅/❌ Table scope sınırlaması
- ✅/❌ Workspace scope genişletme
- ✅/❌ Unidirectional validation

### Genel Değerlendirme
- Başarı oranı: ___%
- Kritik hatalar: ___ adet
- Performans skoru: ___/10
- UX skoru: ___/10
```

**Not**: Bu test kılavuzu, Enhanced Edition'ın tüm yeni özelliklerinin doğru çalıştığını garanti etmek için tasarlanmıştır. Her test senaryosunu eksiksiz olarak çalıştırmanız önerilir. 