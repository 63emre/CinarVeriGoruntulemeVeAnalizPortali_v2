# Formül Renklendirme Özelliği

Bu belge, Çınar Veri Görüntüleme ve Analiz Portalı'ndaki formül renklendirme özelliğinin nasıl çalıştığını açıklamaktadır.

## Formül Yapısı ve Parçaları

Her formül, aşağıdaki öğelerden oluşur:

### Operandlar (Değişkenler veya Sabitler)
- Örneğin `İletkenlik`, `Alkalinite Tayini` veya sayısal sabit `12.5`

### Aritmetik Operatörler
- Toplama (`+`), çıkarma (`-`), çarpma (`*`), bölme (`/`)

### Karşılaştırma Operatörleri
- Büyük (`>`), küçük (`<`), büyük-eşit (`>=`), küçük-eşit (`<=`), eşit (`==`), eşit değil (`!=`)

## Satır ve Hücre Bazlı Değerlendirme

### Tablodaki Her Satır
- Tabloda "İletkenlik", "Orto Fosfat", "Alkalinite Tayini" gibi değişkenler "Variable" sütununda bir satıra bağlıdır.

### Tarih Sütunlarında Döngü
- Nisan 22, Haziran 22… gibi tarih sütunlarının her biri için:
  - Soldaki aritmetik ifadenin sonucu hesaplanır: örn. 374 (İletkenlik) – 170.4 (Alkalinite)
  - Sağdaki aritmetik ifadenin sonucu hesaplanır: örn. 0.01 (Orto Fosfat) – sabit 0
  - Karşılaştırma yapılır: `>`, `<` vb.

### Koşulun Sağlanması
- Eğer koşul `true` ise, o hücrenin arka planı formül için belirlenen renkle boyanır.
- `false` ise renklendirme yapılmaz.

## Bir Hücreye Birden Fazla Formül Uygulama

Aynı tarihteki aynı hücre birden çok formülün koşulunu sağlıyor olabilir.

Bu durumda:
- Tüm tetiklenen formüller bir "stack" (küme) olarak toplanır.
- Gradient veya katmanlı renk uygulamasıyla, her formülün renkleri karışık ya da üst üste gelecek şekilde gösterilir.
- Hücreye hover edildiğinde tooltip içinde "Formül 1: …", "Formül 2: …" gibi liste gösterilir.

## Adım Adım Değerlendirme Akışı

1. **Formüller Listesi**
   - Kullanıcı workspace ve tablo seçtikten sonra sistemde tanımlı formüller çekilir.

2. **Hücre Değerlerinin Alınması**
   - Her satır ve her tarih sütunu için ilgili değişken değerleri tablo verisinden okunur.

3. **Aritmetik Hesaplama**
   - Sol ve sağ ifadeler, değişken değerleri ve sabitler kullanılarak sırayla hesaplanır.
   - İşlem sırasına (öncelikle parantez, sonra çarpma/bölme, sonra toplama/çıkarma) dikkat edilir.

4. **Karşılaştırma**
   - Hesaplanan iki sonuç, formülde seçilen karşılaştırma operatörüyle karşılaştırılır.

5. **Renklendirme Kararı**
   - `true` ise hücre "highlightedCells" listesine eklenir.
   - `false` ise olduğu gibi bırakılır.

6. **UI'ya Yansıtma**
   - Frontend, "highlightedCells" dizisinden gelen hücre koordinatlarına `style={{ backgroundColor: color }}` uygular.
   - Birden fazla varsa gradient ya da katmanlı renk kullanır.

7. **Tooltip ve Detay**
   - Hücre hover'da, o hücrede hangi formüllerin tetiklendiğini listeler.
   - Her formül için sol ve sağ ifadelerin hesaplanmış değerlerini gösterir.

## Teknik Uygulama

Formül renklendirme özelliği aşağıdaki dosyalarda uygulanmıştır:

1. **src/lib/formulaEvaluator.ts**
   - Formülleri değerlendiren ve hangi hücrelerin vurgulanacağını belirleyen ana modül.

2. **src/components/tables/TableCell.tsx**
   - Vurgulanan hücrelerin görsel stilini ve tooltip'ini yöneten bileşen.

3. **src/components/tables/DataTable.tsx**
   - Tablo verilerini görüntüleyen ve formül değerlendirme işlemini başlatan ana bileşen.

4. **src/app/api/workspaces/[workspaceId]/tables/[tableId]/formulas/route.ts**
   - Bir tablo için geçerli formülleri getiren API endpoint'i.

5. **src/app/api/workspaces/[workspaceId]/tables/[tableId]/apply-formulas/route.ts**
   - Formülleri tabloya uygulayan ve vurgulanacak hücreleri döndüren API endpoint'i.

## Test Sayfası

Formül renklendirme özelliğini test etmek için `/dashboard/formulas/test` sayfasını ziyaret edebilirsiniz. Bu sayfa, formüllerin nasıl değerlendirildiğini ve hücrelerin nasıl vurgulandığını gösterir.

## Örnek Formüller

1. **İletkenlik > Alkalinite Tayini**
   - İletkenlik değeri Alkalinite Tayini değerinden büyükse hücreyi vurgular.

2. **Toplam Fosfor > Orto Fosfat**
   - Toplam Fosfor değeri Orto Fosfat değerinden büyükse hücreyi vurgular.

3. **Karmaşık Formül**
   - `(İletkenlik + Toplam Fosfor) > (Orto Fosfat * 2 + Alkalinite Tayini)`
   - Birden fazla değişken ve işlem içeren karmaşık bir formül örneği. 