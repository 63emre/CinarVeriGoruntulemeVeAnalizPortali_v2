/**
 * Veri işleme ve biçimlendirme yardımcı fonksiyonları
 */

/**
 * Türkiye lokali için sayı biçimlendirme
 * Örnekler:
 * - "<0,0005" -> değer 0.0005'ten küçük demektir
 * - "100,000" -> 100 olarak gösterilir (gereksiz sıfırlar temizlenir)
 * - "374 310 348" -> birden fazla değer olarak parse edilir
 */

export interface ParsedValue {
  originalValue: string;
  numericValue: number | null;
  isComparison: boolean;
  comparisonOperator?: '<' | '>' | '<=' | '>=' | '=' | '!=';
  displayValue: string;
  isMultiValue: boolean;
  values?: number[];
}

/**
 * Türkiye lokali sayı formatını parse eder
 */
export function parseValue(value: string | number | null): ParsedValue {
  if (value === null || value === undefined) {
    return {
      originalValue: '',
      numericValue: null,
      isComparison: false,
      displayValue: '',
      isMultiValue: false
    };
  }

  const strValue = String(value).trim();
  
  // Boş değer kontrolü
  if (!strValue) {
    return {
      originalValue: strValue,
      numericValue: null,
      isComparison: false,
      displayValue: '',
      isMultiValue: false
    };
  }

  // Karşılaştırma operatörleri kontrolü (<0,0005, >100, vb.)
  const comparisonMatch = strValue.match(/^([<>=!]+)?\s*([0-9,.\s]+)$/);
  if (comparisonMatch) {
    const operator = comparisonMatch[1] as '<' | '>' | '<=' | '>=' | '=' | '!=' | undefined;
    const numberPart = comparisonMatch[2];
    
    if (operator) {
      const numericValue = parseNumberValue(numberPart);
      return {
        originalValue: strValue,
        numericValue,
        isComparison: true,
        comparisonOperator: operator,
        displayValue: formatDisplayValue(numericValue, operator),
        isMultiValue: false
      };
    }
  }

  // Çoklu değer kontrolü (boşlukla ayrılmış sayılar: "374 310 348 342")
  const multiValueMatch = strValue.match(/^[0-9]+(\s+[0-9]+){2,}$/);
  if (multiValueMatch) {
    const values = strValue.split(/\s+/).map(parseNumberValue).filter(v => v !== null) as number[];
    return {
      originalValue: strValue,
      numericValue: values[0] || null,
      isComparison: false,
      displayValue: values.map(v => formatNumber(v)).join(' '),
      isMultiValue: true,
      values
    };
  }

  // Normal sayı değeri
  const numericValue = parseNumberValue(strValue);
  return {
    originalValue: strValue,
    numericValue,
    isComparison: false,
    displayValue: numericValue !== null ? formatNumber(numericValue) : strValue,
    isMultiValue: false
  };
}

/**
 * Türkiye lokali sayı string'ini parse eder
 */
function parseNumberValue(value: string): number | null {
  if (!value || typeof value !== 'string') return null;
  
  // Türkiye formatını normalize et (virgül -> nokta, boşlukları temizle)
  let normalized = value.trim()
    .replace(/\s/g, '') // Boşlukları temizle
    .replace(',', '.'); // Virgülü noktaya çevir
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Sayıyı Türkiye lokali için biçimlendirir
 */
export function formatNumber(value: number | null): string {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  // Çok küçük değerler için bilimsel notasyon kullanma
  if (Math.abs(value) < 0.001 && value !== 0) {
    return value.toExponential(3).replace('.', ',');
  }
  
  // Normal değerler için
  const formatted = value.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  });
  
  // Gereksiz sıfırları temizle (100,000 -> 100)
  return formatted.replace(/,000+$/, '');
}

/**
 * Karşılaştırma değeri için görüntü formatı
 */
function formatDisplayValue(value: number | null, operator: string): string {
  if (value === null) return '';
  
  const formattedNumber = formatNumber(value);
  return `${operator}${formattedNumber}`;
}

/**
 * Hücre değerini güncellemek için API çağrısı
 */
export async function updateCellValue(
  workspaceId: string,
  tableId: string,
  rowIndex: number,
  columnIndex: number,
  newValue: string | number | null
): Promise<boolean> {
  try {
    console.log('🔄 Hücre güncelleniyor:', {
      workspaceId,
      tableId,
      rowIndex,
      columnIndex,
      newValue
    });

    // Mevcut tablo verilerini al
    const tableResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
    if (!tableResponse.ok) {
      throw new Error('Tablo verileri alınamadı');
    }
    
    const tableData = await tableResponse.json();
    
    // Yeni değeri güncelle
    const updatedData = [...tableData.data];
    if (!updatedData[rowIndex]) {
      // Yeni satır oluştur
      updatedData[rowIndex] = new Array(tableData.columns.length).fill(null);
    }
    
    updatedData[rowIndex][columnIndex] = newValue;
    
    // Güncellenen veriyi gönder
    const updateResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tableData.name,
        columns: tableData.columns,
        data: updatedData
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Hücre güncelleme başarısız');
    }

    console.log('✅ Hücre başarıyla güncellendi');
    return true;
    
  } catch (error) {
    console.error('❌ Hücre güncelleme hatası:', error);
    return false;
  }
}

/**
 * Veri doğrulama fonksiyonu
 */
export function validateCellValue(value: string | number | null, columnType?: string): {
  isValid: boolean;
  error?: string;
  parsedValue: ParsedValue;
} {
  const parsedValue = parseValue(value);
  
  // Boş değer her zaman geçerli
  if (!parsedValue.originalValue) {
    return { isValid: true, parsedValue };
  }
  
  // Sayısal sütunlar için özel doğrulama
  if (columnType === 'number' || columnType === 'numeric') {
    if (parsedValue.numericValue === null && !parsedValue.isComparison) {
      return {
        isValid: false,
        error: 'Geçerli bir sayı giriniz',
        parsedValue
      };
    }
  }
  
  return { isValid: true, parsedValue };
}

/**
 * Toplu veri güncellemesi için optimized fonksiyon
 */
export async function updateMultipleCells(
  workspaceId: string,
  tableId: string,
  updates: Array<{
    rowIndex: number;
    columnIndex: number;
    value: string | number | null;
  }>
): Promise<boolean> {
  try {
    console.log('🔄 Toplu hücre güncellemesi:', updates.length, 'hücre');
    
    // Mevcut tablo verilerini al
    const tableResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
    if (!tableResponse.ok) {
      throw new Error('Tablo verileri alınamadı');
    }
    
    const tableData = await tableResponse.json();
    const updatedData = [...tableData.data];
    
    // Tüm güncellemeleri uygula
    for (const update of updates) {
      if (!updatedData[update.rowIndex]) {
        updatedData[update.rowIndex] = new Array(tableData.columns.length).fill(null);
      }
      updatedData[update.rowIndex][update.columnIndex] = update.value;
    }
    
    // Güncellenen veriyi gönder
    const updateResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tableData.name,
        columns: tableData.columns,
        data: updatedData
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Toplu güncelleme başarısız');
    }

    console.log('✅ Toplu hücre güncellemesi başarılı');
    return true;
    
  } catch (error) {
    console.error('❌ Toplu güncelleme hatası:', error);
    return false;
  }
}

/**
 * Veri analizi için sayısal değerleri çıkarır
 */
export function extractNumericValues(data: (string | number | null)[][]): number[] {
  const values: number[] = [];
  
  for (const row of data) {
    for (const cell of row) {
      const parsed = parseValue(cell);
      if (parsed.numericValue !== null) {
        values.push(parsed.numericValue);
      }
      if (parsed.isMultiValue && parsed.values) {
        values.push(...parsed.values);
      }
    }
  }
  
  return values;
}

/**
 * Formül değerlendirmesi için değer karşılaştırması
 */
export function evaluateComparison(
  cellValue: string | number | null,
  formula: string
): boolean {
  const parsed = parseValue(cellValue);
  
  // Formülü parse et (örn: "value > 100", "value < 0.005")
  const formulaMatch = formula.match(/value\s*([<>=!]+)\s*([0-9.,]+)/);
  if (!formulaMatch) return false;
  
  const operator = formulaMatch[1];
  const threshold = parseNumberValue(formulaMatch[2]);
  
  if (parsed.numericValue === null || threshold === null) return false;
  
  switch (operator) {
    case '>': return parsed.numericValue > threshold;
    case '<': return parsed.numericValue < threshold;
    case '>=': return parsed.numericValue >= threshold;
    case '<=': return parsed.numericValue <= threshold;
    case '=': case '==': return Math.abs(parsed.numericValue - threshold) < 0.0001;
    case '!=': return Math.abs(parsed.numericValue - threshold) >= 0.0001;
    default: return false;
  }
} 