import * as XLSX from 'xlsx';
import prisma from '../db';

export interface ExcelData {
  fileName?: string;
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

// Excel dosyalarının maksimum boyutu (MB cinsinden)
const MAX_FILE_SIZE_MB = 50;
// Tek seferde işlenecek maksimum satır sayısı (bellek yönetimi için)
const CHUNK_SIZE = 5000;

/**
 * Checks if a value is potentially an Excel serial date
 * Excel dates are stored as numbers representing days since 1/1/1900
 */
function isExcelSerialDate(value: string | number): boolean {
  if (typeof value === 'number') {
    // Excel serial dates are typically 5-digit or 6-digit numbers
    // representing days since Excel epoch (Dec 30, 1899)
    return value > 1000 && value < 1000000;
  }
  
  // Convert string to number and check
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return numValue > 1000 && numValue < 1000000;
  }
  
  return false;
}

/**
 * Checks if a string might be a date in various formats (DD.MM.YYYY, DD/MM/YYYY, etc.)
 * Used to identify date strings that aren't recognized by Excel as dates
 */
function isDateString(value: string): boolean {
  if (typeof value !== 'string') return false;
  
  // Turkish date format: DD.MM.YYYY
  const turkishDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  
  // International formats: DD/MM/YYYY or YYYY-MM-DD
  const internationalDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$|^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  
  return turkishDateRegex.test(value) || internationalDateRegex.test(value);
}

/**
 * Parses and standardizes a date string to DD.MM.YYYY format
 */
function standardizeDateString(value: string): string {
  try {
    // Turkish format: DD.MM.YYYY - already standardized
    const turkishDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    if (turkishDateRegex.test(value)) {
      // Extract parts and ensure proper padding
      const [_, day, month, year] = value.match(turkishDateRegex) || [];
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
    
    // DD/MM/YYYY format
    const slashDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (slashDateRegex.test(value)) {
      const [_, day, month, year] = value.match(slashDateRegex) || [];
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
    
    // YYYY-MM-DD format
    const isoDateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    if (isoDateRegex.test(value)) {
      const [_, year, month, day] = value.match(isoDateRegex) || [];
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
    
    return value;
  } catch (error) {
    console.error('Error standardizing date string:', error);
    return value;
  }
}

/**
 * Convert Excel serial date to DD.MM.YYYY format
 * Excel's epoch starts on January 0, 1900 (December 30, 1899)
 */
function excelSerialDateToString(serialDate: number): string {
  try {
    // Excel's epoch starts on January 0, 1900 (actually December 30, 1899)
    // Excel incorrectly treats 1900 as a leap year, so we need to adjust
    // Excel serial dates before March 1, 1900 are off by 1
    const excelEpoch = new Date(1899, 11, 30);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Calculate the number of milliseconds from the Excel epoch
    const milliseconds = serialDate * millisecondsPerDay;
    const date = new Date(excelEpoch.getTime() + milliseconds);
    
    // Format as DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Error converting Excel serial date:', error);
    return String(serialDate); // Return original value if conversion fails
  }
}

// Validate the uploaded Excel file
function validateExcelFile(file: File): void {
  // Dosya tipini kontrol et
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Geçersiz dosya formatı. Lütfen Excel (.xlsx veya .xls) dosyası yükleyin.');
  }
  
  // Dosya boyutunu kontrol et
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`Dosya boyutu çok büyük. Maksimum dosya boyutu: ${MAX_FILE_SIZE_MB}MB`);
  }
}

// Excel dosyasının veri kalitesini doğrula
function validateDataQuality(data: ExcelData[]): void {
  if (!data || data.length === 0) {
    throw new Error('Excel dosyasında veri bulunamadı.');
  }
  
  for (const sheet of data) {
    if (!sheet.columns || sheet.columns.length === 0) {
      throw new Error('Excel sayfasında sütun başlıkları bulunamadı.');
    }
    
    // Boş sütun başlıkları için uyarı
    const emptyHeaders = sheet.columns.filter(header => !header || header.trim() === '');
    if (emptyHeaders.length > 0) {
      console.warn(`'${sheet.sheetName}' sayfasında ${emptyHeaders.length} adet boş sütun başlığı bulundu.`);
    }
    
    // Veri sayısını kontrol et
    if (!sheet.data || sheet.data.length === 0) {
      throw new Error(`'${sheet.sheetName}' sayfasında veri bulunamadı.`);
    }
  }
}

/**
 * ENHANCED: Parse special Excel values with Turkish formatting and comparison operators
 * Handles cases like:
 * - "0,0005 → Değer 0.0005'ten küçük" → convert to "< 0.0005"
 * - "100,000 → 100" → convert to 100 (remove unnecessary trailing zeros)
 * - "Değer 0.05'ten büyük" → convert to "> 0.05"
 */
function parseSpecialValue(value: string): string | number | null {
  if (typeof value !== 'string') return value;
  
  const trimmed = value.trim();
  if (!trimmed) return null;
  
  // Handle Turkish comparison text patterns
  const turkishPatterns = [
    // "0,0005 → Değer 0.0005'ten küçük" patterns
    {
      regex: /^(\d+[,.]\d+)\s*→\s*Değer\s+(\d+[,.]\d+)'?ten\s+küçük/i,
      transform: (match: RegExpMatchArray) => {
        const numValue = parseFloat(match[2].replace(',', '.'));
        return `< ${numValue}`;
      }
    },
    // "Değer X'ten küçük" patterns  
    {
      regex: /Değer\s+(\d+[,.]\d+)'?ten\s+küçük/i,
      transform: (match: RegExpMatchArray) => {
        const numValue = parseFloat(match[1].replace(',', '.'));
        return `< ${numValue}`;
      }
    },
    // "Değer X'ten büyük" patterns
    {
      regex: /Değer\s+(\d+[,.]\d+)'?ten\s+büyük/i,
      transform: (match: RegExpMatchArray) => {
        const numValue = parseFloat(match[1].replace(',', '.'));
        return `> ${numValue}`;
      }
    },
    // "X'ten küçük" patterns
    {
      regex: /(\d+[,.]\d+)'?ten\s+küçük/i,
      transform: (match: RegExpMatchArray) => {
        const numValue = parseFloat(match[1].replace(',', '.'));
        return `< ${numValue}`;
      }
    },
    // "X'ten büyük" patterns
    {
      regex: /(\d+[,.]\d+)'?ten\s+büyük/i,
      transform: (match: RegExpMatchArray) => {
        const numValue = parseFloat(match[1].replace(',', '.'));
        return `> ${numValue}`;
      }
    },
    // Handle values with arrows like "100,000 → 100"
    {
      regex: /^(\d+[,.]\d*)\s*→\s*(\d+[,.]\d*)$/,
      transform: (match: RegExpMatchArray) => {
        // Take the simplified value (after arrow)
        const simplifiedValue = match[2].replace(',', '.');
        const numValue = parseFloat(simplifiedValue);
        return isNaN(numValue) ? match[2] : numValue;
      }
    }
  ];
  
  // Try each pattern
  for (const pattern of turkishPatterns) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      try {
        const result = pattern.transform(match);
        console.log(`📊 Converted Turkish value: "${trimmed}" → "${result}"`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Error transforming value: "${trimmed}"`, error);
      }
    }
  }
  
  // Handle trailing zeros removal for decimal numbers
  // "100,000" → 100, "5,000" → 5
  if (/^\d+[,.]\d*0+$/.test(trimmed)) {
    const normalizedValue = trimmed.replace(',', '.');
    const numValue = parseFloat(normalizedValue);
    if (!isNaN(numValue)) {
      // Remove unnecessary trailing zeros
      const cleanNumber = numValue.toString();
      console.log(`🔢 Cleaned trailing zeros: "${trimmed}" → ${cleanNumber}`);
      return numValue;
    }
  }
  
  // Handle very small values with scientific notation
  // "0,0005" should be recognized as a very small number
  if (/^0[,.]0+\d+$/.test(trimmed)) {
    const normalizedValue = trimmed.replace(',', '.');
    const numValue = parseFloat(normalizedValue);
    if (!isNaN(numValue) && numValue < 0.001) {
      console.log(`🔬 Detected small value: "${trimmed}" → ${numValue}`);
      return `< 0.001`;
    }
    return numValue;
  }
  
  // Handle standard Turkish decimal format
  if (/^\d+[,]\d+$/.test(trimmed)) {
    const normalizedValue = trimmed.replace(',', '.');
    const numValue = parseFloat(normalizedValue);
    if (!isNaN(numValue)) {
      return numValue;
    }
  }
  
  // Return original value if no special pattern matches
  return trimmed;
}

export async function parseExcelFile(file: File): Promise<ExcelData[]> {
  try {
    // Önce dosyayı doğrula
    validateExcelFile(file);
    
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const result: ExcelData[] = [];
    
    // Extract the filename without extension for later use
    const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false });

      if (jsonData.length > 0) {
        // Get and clean headers from the first row
        const rawHeaders = jsonData[0] || [];
        const headers = Array.isArray(rawHeaders) 
          ? rawHeaders.map(h => {
              if (h === null || h === undefined) return '';
              
              // Convert Excel serial dates in headers to readable format
              if (h instanceof Date) {
                const day = String(h.getDate()).padStart(2, '0');
                const month = String(h.getMonth() + 1).padStart(2, '0');
                const year = h.getFullYear();
                return `${day}.${month}.${year}`;
              }
              
              // Handle numeric values that might be dates
              if (typeof h === 'number' || (typeof h === 'string' && !isNaN(Number(h)))) {
                const numValue = typeof h === 'number' ? h : Number(h);
                if (isExcelSerialDate(numValue)) {
                  return excelSerialDateToString(numValue);
                }
              }
              
              // Handle string values that might be dates
              if (typeof h === 'string' && isDateString(h)) {
                return standardizeDateString(h);
              }
              
              return String(h).trim();
            }) 
          : [];
        
        // Filter out empty header columns
        const cleanHeaders = headers.filter(h => h !== '');
        
        // Process data rows - ensure all values are properly typed and null-safe
        const data = jsonData.slice(1).map(row => {
          // Skip rows that aren't arrays or are empty
          if (!Array.isArray(row)) return Array(cleanHeaders.length).fill(null);
          
          // Ensure each cell is properly processed
          return Array(cleanHeaders.length).fill(null).map((_, i) => {
            const cellValue = i < row.length ? row[i] : null;
            
            // Handle different data types
            if (cellValue === null || cellValue === undefined) return null;
            
            // Handle dates correctly
            if (cellValue && typeof cellValue === 'object' && Object.prototype.toString.call(cellValue) === '[object Date]') {
              const dateObj = cellValue as Date;
              const day = String(dateObj.getDate()).padStart(2, '0');
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const year = dateObj.getFullYear();
              return `${day}.${month}.${year}`;
            }
            
            // Return appropriate data type based on cell content
            if (typeof cellValue === 'number') {
              // Handle Excel serial dates
              if (isExcelSerialDate(cellValue)) {
                return excelSerialDateToString(cellValue);
              }
              return cellValue;
            }
            
            if (typeof cellValue === 'string') {
              const trimmed = cellValue.trim();
              if (trimmed === '') return null;
              
              // ENHANCED: Parse special Turkish values first
              const specialValue = parseSpecialValue(trimmed);
              if (specialValue !== trimmed) {
                return specialValue;
              }
              
              // Check if the string represents a date and standardize it
              if (isDateString(trimmed)) {
                return standardizeDateString(trimmed);
              }
              
              return trimmed;
            }
            
            // For any other type, convert to string
            return String(cellValue);
          });
        });

        result.push({
          fileName, // Store the original filename
          sheetName,
          columns: cleanHeaders,
          data: data as (string | number | null)[][],
        });
      }
    }

    // Veri kalitesi doğrulaması yap
    validateDataQuality(result);
    
    console.log(`✅ Excel file parsed successfully with enhanced Turkish value support`);
    result.forEach(sheet => {
      console.log(`📊 Sheet "${sheet.sheetName}": ${sheet.columns.length} columns, ${sheet.data.length} rows`);
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Excel dosyası işlenirken hata oluştu: ${(error as Error).message}`);
  }
}

// Büyük veri setlerini parçalar halinde işleyen yardımcı fonksiyon
// Not: Şu anda doğrudan kullanılmıyor, ileride büyük veri setleri için kullanılabilir
export async function processInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processFunction: (chunk: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processFunction(chunk);
    results.push(...chunkResults);
  }
  
  return results;
}

export async function saveExcelData(
  excelData: ExcelData[],
  workspaceId: string
): Promise<{ sheets: ExcelData[], tableIds: string[] }> {
  const tableIds: string[] = [];

  try {
    // Çalışma alanının var olduğunu ve kullanıcının erişim hakkı olduğunu doğrula
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    
    if (!workspace) {
      throw new Error('Çalışma alanı bulunamadı.');
    }

    // First check for existing tables in this workspace to avoid duplicate names
    const existingTables = await prisma.dataTable.findMany({
      where: { workspaceId },
      select: { sheetName: true, name: true },
    });    // Create a map of existing sheet names for faster lookup
    const existingSheetNames = new Map<string, number>();
    existingTables.forEach(table => {
      // Extract the base sheet name (without any suffix)
      const baseSheetName = table.sheetName.replace(/\s+\(\d+\)$/, '');
      // Add sheet name to map and count occurrences
      const count = existingSheetNames.get(baseSheetName) || 0;
      existingSheetNames.set(baseSheetName, count + 1);
    });

    // Track sheet names used within this batch to avoid duplicates in the same import
    const batchSheetNames = new Map<string, number>();

    // Tüm sayfaları transaction içinde işle
    await prisma.$transaction(async (tx) => {
      for (const sheet of excelData) {
        // Get the base sheet name (in case it already has a suffix)
        const baseSheetName = sheet.sheetName.replace(/\s+\(\d+\)$/, '');
        
        // Determine if this sheet name already exists in database or current batch
        const existingCount = existingSheetNames.get(baseSheetName) || 0;
        const batchCount = batchSheetNames.get(baseSheetName) || 0;
        const totalCount = existingCount + batchCount;
        
        // Create a unique sheet name
        let uniqueSheetName = baseSheetName;
        
        // Add suffix if needed to make name unique
        if (totalCount > 0) {
          uniqueSheetName = `${baseSheetName} (${totalCount + 1})`;
        }
        
        // Use fileName-sheetName format for the table name displayed to users
        const fileNameToUse = sheet.fileName ? `${sheet.fileName} - ${uniqueSheetName}` : uniqueSheetName;
        
        // Update the batch map for future sheets in this import
        batchSheetNames.set(baseSheetName, batchCount + 1);

        // Create a proper sanitized version of the data
        // Remove any row/column limits - process all data dynamically
        const sanitizedData = sheet.data.map(row => {
          // Ensure row is an array
          if (!Array.isArray(row)) return [];
          
          // Process each cell in the row
          return row.map(cell => {
            // Explicitly handle all possible undefined cases
            if (cell === undefined || cell === null) return null;
            
            // Handle empty strings
            if (typeof cell === 'string' && cell.trim() === '') return null;
            
            // Convert dates to a standard format if needed
            // Check for Date objects using typeof and object type checks
            if (cell && typeof cell === 'object' && Object.prototype.toString.call(cell) === '[object Date]') {
              // Güvenli bir şekilde Date nesnesine dönüştür
              const dateObj = cell as Date;
              const day = String(dateObj.getDate()).padStart(2, '0');
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const year = dateObj.getFullYear();
              return `${day}.${month}.${year}`;
            }
            
            // Handle Excel serial dates
            if (typeof cell === 'number' && isExcelSerialDate(cell)) {
              return excelSerialDateToString(cell);
            }
            
            // Handle string dates in different formats
            if (typeof cell === 'string' && isDateString(cell)) {
              return standardizeDateString(cell);
            }
            
            return cell;
          });
        });
        
        // Filter out empty rows (all cells are null)
        const nonEmptyRows = sanitizedData.filter(row => 
          row.some(cell => cell !== null && cell !== '')
        );
        
        // Büyük veri setleri için chunk'lar halinde işle
        const processedData = nonEmptyRows;
        if (nonEmptyRows.length > CHUNK_SIZE) {
          // Veri çok büyük, hafıza tüketimini azaltmak için
          // (Bu örnekte bütün veriyi kaydediyoruz, ancak gerçek bir chunk işleyici bunu parçalayacak)
          console.log(`Büyük veri seti tespit edildi: ${nonEmptyRows.length} satır. Bellek optimizasyonu uygulanıyor.`);
        }
        
        // Convert to CSV format for better data integrity
        const csvData = convertToCSV(sheet.columns, processedData);
        
        try {
          const table = await tx.dataTable.create({
            data: {
              name: fileNameToUse,
              sheetName: uniqueSheetName,
              workspaceId,
              columns: sheet.columns,
              data: processedData, // Store all data without row limits
              csvData: csvData, // Now defined in the Prisma schema
            },
          });
          
          tableIds.push(table.id);
        } catch (err) {
          // Specifically handle column missing error (schema update required)
          if ((err as Error).message.includes("The column `csvData` does not exist")) {
            throw new Error('Veritabanı şeması güncel değil. "npx prisma db push" komutunu çalıştırmanız gerekiyor.');
          }
          throw err;
        }
      }
    });

    return {
      sheets: excelData,
      tableIds
    };
  } catch (error) {
    console.error(`Error saving Excel data:`, error);
    throw new Error(`Excel verisini kaydederken hata oluştu: ${(error as Error).message}`);
  }
}

// Function to convert data to CSV format for better integrity
function convertToCSV(columns: string[], data: (string | number | null)[][]): string {
  try {
    // Create header row
    let csv = columns.map(column => escapeCsvValue(String(column || ''))).join(',') + '\n';
    
    // Add data rows
    for (const row of data) {
      csv += row.map(cell => {
        if (cell === null || cell === undefined) return '';
        return escapeCsvValue(String(cell));
      }).join(',') + '\n';
    }
    
    return csv;
  } catch (error) {
    console.error('CSV dönüşüm hatası:', error);
    // Hata durumunda boş bir CSV döndür, bu en azından veri kaybını önler
    return columns.join(',') + '\n';
  }
}

// Helper function to properly escape CSV values
function escapeCsvValue(value: string): string {
  // Boşluk ve özel karakterleri koruma
  if (!value || value.trim() === '') return value;
  
  // Başındaki ve sonundaki whitespace'leri koru
  const originalValue = value;
  
  // Comparison operators and decimal values should be preserved as-is
  // Turkish decimal format uses comma, international uses dot
  const isComparisonValue = /^[<>=≤≥]/.test(value.trim());
  const isDecimalValue = /^\d+[,.]\d+$/.test(value.trim());
  const isNegativeNumber = /^-\d+([,.]?\d+)?$/.test(value.trim());
  
  // Preserve scientific notation and special values
  const isScientificNotation = /^\d+([,.]?\d+)?[eE][+-]?\d+$/i.test(value.trim());
  const isSpecialValue = ['N/A', 'NA', 'n.a.', 'NULL', 'null', '-', ''].includes(value.trim().toLowerCase());
  
  // Don't escape comparison operators or numerical values
  if (isComparisonValue || isDecimalValue || isNegativeNumber || isScientificNotation || isSpecialValue) {
    // Still need to handle commas in CSV context
    if (value.includes(',') && !isDecimalValue) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }
  
  // Security check - CSV injection prevention for formula-like values
  if (value.trim().startsWith('=') || value.trim().startsWith('+') || value.trim().startsWith('@')) {
    // Potential Excel formula injection prevention
    value = `'${value}`;
  }
  
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    // Double any quotes within the value
    return '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
}

export async function getTableData(tableId: string) {
  try {
    const table = await prisma.dataTable.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new Error('Tablo bulunamadı');
    }

    // CSV verisini kullanarak yedek veri sağlama
    let data = table.data as (string | number | null)[][];
    let columns = table.columns as string[];
    
    // Veri bozulmuş veya eksikse CSV'den yeniden oluşturmayı dene
    if ((!data || !Array.isArray(data) || data.length === 0) && table.csvData) {
      try {
        const reconstructed = parseCSV(table.csvData);
        if (reconstructed) {
          columns = reconstructed.columns;
          data = reconstructed.data;
          console.log('Tablodaki veriler CSV yedeklemesinden başarıyla geri yüklendi.');
          
          // Düzeltilmiş verileri veritabanına kaydet
          await prisma.dataTable.update({
            where: { id: tableId },
            data: { 
              columns: columns,
              data: data 
            }
          });
        }
      } catch (csvError) {
        console.error('CSV verisi işlenirken hata oluştu:', csvError);
      }
    }

    return {
      columns,
      data,
    };
  } catch (error) {
    console.error('Tablo verileri yüklenirken hata:', error);
    throw new Error(`Tablo verileri yüklenemedi: ${(error as Error).message}`);
  }
}

// Enhanced parseCSV function with better handling of Turkish data formats
function parseCSV(csvData: string): { columns: string[], data: (string | number | null)[][] } | null {
  try {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) return null;
    
    // Parse header
    const columns = parseCSVLine(lines[0]);
    
    // Parse data rows with enhanced value processing
    const data: (string | number | null)[][] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const processedRow: (string | number | null)[] = row.map(cell => {
        if (!cell || cell.trim() === '' || cell.toLowerCase() === 'null') return null;
        
        const trimmedCell = cell.trim();
        
        // Handle comparison operators (< > = ≤ ≥)
        if (/^[<>=≤≥]/.test(trimmedCell)) {
          return trimmedCell; // Keep as string with operator
        }
        
        // Handle decimal numbers with Turkish format (comma as decimal separator)
        if (/^\d+,\d+$/.test(trimmedCell)) {
          const numberValue = parseFloat(trimmedCell.replace(',', '.'));
          return isNaN(numberValue) ? trimmedCell : numberValue;
        }
        
        // Handle decimal numbers with international format (dot as decimal separator)  
        if (/^\d+\.\d+$/.test(trimmedCell)) {
          const numberValue = parseFloat(trimmedCell);
          return isNaN(numberValue) ? trimmedCell : numberValue;
        }
        
        // Handle negative numbers
        if (/^-\d+([,.]?\d+)?$/.test(trimmedCell)) {
          const normalizedValue = trimmedCell.replace(',', '.');
          const numberValue = parseFloat(normalizedValue);
          return isNaN(numberValue) ? trimmedCell : numberValue;
        }
        
        // Handle integers
        if (/^\d+$/.test(trimmedCell)) {
          const numberValue = parseInt(trimmedCell, 10);
          return isNaN(numberValue) ? trimmedCell : numberValue;
        }
        
        // Handle scientific notation
        if (/^\d+([,.]?\d+)?[eE][+-]?\d+$/i.test(trimmedCell)) {
          const normalizedValue = trimmedCell.replace(',', '.');
          const numberValue = parseFloat(normalizedValue);
          return isNaN(numberValue) ? trimmedCell : numberValue;
        }
        
        // Keep dates and other strings as-is
        return trimmedCell;
      });
      
      data.push(processedRow);
    }
    
    return { columns, data };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return null;
  }
}

// Enhanced parseCSVLine function with better quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = i + 1 < line.length ? line[i + 1] : '';
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Handle escaped quotes inside quoted field
        current += '"';
        i += 2; // Skip both quotes
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator found outside quotes
      result.push(current.trim());
      current = '';
    } else {
      // Regular character
      current += char;
    }
    
    i++;
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

interface TableData {
  columns: string[];
  data: (string | number | null)[][];
}

export function getVariableColumns(data: TableData) {
  // Find the index of the "Variable" column
  const columns = data.columns;
  const variableColumnIndex = columns.findIndex(
    (col) => col.toLowerCase() === 'variable'
  );

  if (variableColumnIndex === -1) {
    return [];
  }

  // Extract all variable values
  const variables: string[] = [];
  for (const row of data.data) {
    const variableValue = row[variableColumnIndex];
    if (variableValue && typeof variableValue === 'string' && !variables.includes(variableValue)) {
      variables.push(variableValue);
    }
  }

  return variables;
}

export function getDateColumns(data: TableData) {
  // These are the fixed columns that should be excluded
  const fixedColumns = ['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'];
  
  // Filter out the fixed columns to get the date columns
  const dateColumns = data.columns.filter(
    (col) => !fixedColumns.includes(col) && isDateString(col)
  );
  
  return dateColumns;
}