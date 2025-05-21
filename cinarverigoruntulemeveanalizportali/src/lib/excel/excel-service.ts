import * as XLSX from 'xlsx';
import prisma from '../db';

export interface ExcelData {
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

// Check if a string is potentially an Excel serial date
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

// Convert Excel serial date to DD.MM.YYYY format
function excelSerialDateToString(serialDate: number): string {
  try {
    // Excel's epoch starts on January 1, 1900
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

export async function parseExcelFile(file: File): Promise<ExcelData[]> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const result: ExcelData[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

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
            
            // Return appropriate data type based on cell content
            if (typeof cellValue === 'number') return cellValue;
            if (typeof cellValue === 'string') return cellValue.trim() === '' ? null : cellValue;
            
            // For any other type, convert to string
            return String(cellValue);
          });
        });

        result.push({
          sheetName,
          columns: cleanHeaders,
          data: data as (string | number | null)[][],
        });
      }
    }

    return result;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Excel dosyası işlenirken hata oluştu: ${(error as Error).message}`);
  }
}

export async function saveExcelData(
  excelData: ExcelData[],
  workspaceId: string
): Promise<{ sheets: ExcelData[], tableIds: string[] }> {
  const tableIds: string[] = [];

  try {
    // Extract filename from the first sheet or use a default
    const fileName = excelData.length > 0 ? excelData[0].sheetName : 'Imported Data';

    for (const sheet of excelData) {
      // Improved sanitization to ensure no undefined values
      // Deep check and convert any potential undefined values to null
      const sanitizedData = sheet.data.map(row => {
        // Ensure row is an array
        if (!Array.isArray(row)) return [];
        
        // Process each cell in the row
        return row.map(cell => {
          // Explicitly handle all possible undefined cases
          if (cell === undefined || cell === null) return null;
          
          // Handle empty strings and other special cases
          if (typeof cell === 'string' && cell.trim() === '') return null;
          
          return cell;
        });
      });
      
      const table = await prisma.dataTable.create({
        data: {
          name: fileName,
          sheetName: sheet.sheetName,
          workspaceId,
          columns: sheet.columns,
          data: sanitizedData,
        },
      });

      tableIds.push(table.id);
    }

    return {
      sheets: excelData,
      tableIds
    };
  } catch (error) {
    console.error(`Error saving Excel data:`, error);
    throw new Error(`Excel verisini kaydederken hata oluştu: ${(error as Error).message}`);
  }
}

export async function getTableData(tableId: string) {
  const table = await prisma.dataTable.findUnique({
    where: { id: tableId },
  });

  if (!table) {
    throw new Error('Table not found');
  }

  return {
    columns: table.columns as string[],
    data: table.data as (string | number | null)[][],
  };
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
    (col) => !fixedColumns.includes(col)
  );
  
  return dateColumns;
} 