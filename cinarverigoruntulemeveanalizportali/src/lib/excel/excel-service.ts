import * as XLSX from 'xlsx';
import prisma from '../db';

export interface ExcelData {
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

export async function parseExcelFile(file: File): Promise<ExcelData[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const result: ExcelData[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length > 0) {
      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1) as (string | number | null)[][];

      result.push({
        sheetName,
        columns: headers,
        data: data,
      });
    }
  }

  return result;
}

export async function saveExcelData(
  workspaceId: string,
  fileName: string,
  excelData: ExcelData[]
): Promise<string[]> {
  const tableIds: string[] = [];

  for (const sheet of excelData) {
    const table = await prisma.dataTable.create({
      data: {
        name: fileName,
        sheetName: sheet.sheetName,
        workspaceId,
        columns: sheet.columns,
        data: sheet.data,
      },
    });

    tableIds.push(table.id);
  }

  return tableIds;
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