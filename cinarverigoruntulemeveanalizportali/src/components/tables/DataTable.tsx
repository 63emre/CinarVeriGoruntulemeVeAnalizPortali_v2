'use client';

import { useState, useEffect } from 'react';
import { FcSearch, FcPrint, FcExport, FcCellPhone } from 'react-icons/fc';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DataTableProps {
  tableId: string;
  workspaceId: string;
}

interface TableData {
  id: string;
  name: string;
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

interface FormulaResult {
  result: boolean;
  error?: string;
  message?: string;
  color: string;
  formulaName: string;
}

export default function DataTable({ tableId, workspaceId }: DataTableProps) {
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<Record<string, Record<string, FormulaResult[]>>>({}); // row,col -> results
  const [searchTerm, setSearchTerm] = useState('');
  const [tooltipCell, setTooltipCell] = useState<{ row: number, col: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch table data
        const tableResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
        if (!tableResponse.ok) {
          throw new Error('Tablo verisi yüklenemedi');
        }
        const tableDataResult = await tableResponse.json();
        setTableData(tableDataResult);

        // Fetch formulas
        const formulasResponse = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (!formulasResponse.ok) {
          throw new Error('Formüller yüklenemedi');
        }
        const formulasData = await formulasResponse.json();
        setFormulas(formulasData);

        // Evaluate formulas on data if available
        if (tableDataResult && formulasData.length > 0) {
          const results = evaluateFormulas(tableDataResult, formulasData);
          setEvaluationResults(results);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [tableId, workspaceId]);

  const evaluateFormulas = (table: TableData, formulas: any[]) => {
    const results: Record<string, Record<string, FormulaResult[]>> = {};
    
    // This is a simplified evaluation - in a real application, you would implement proper formula evaluation
    // For this example, we'll just generate some dummy evaluation results
    
    // Get fixed columns (Data Source, Variable, Method, Unit, LOQ)
    const fixedColumns = ['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'];
    const fixedColumnIndices = fixedColumns.map(col => table.columns.indexOf(col));
    
    // Get date columns (all columns except fixed ones)
    const dateColumnIndices = table.columns.reduce((indices, col, index) => {
      if (!fixedColumns.includes(col)) {
        indices.push(index);
      }
      return indices;
    }, [] as number[]);
    
    // Evaluate formulas for each cell that has a value
    table.data.forEach((row, rowIndex) => {
      dateColumnIndices.forEach(colIndex => {
        if (row[colIndex] !== null && row[colIndex] !== undefined && row[colIndex] !== '') {
          const cellResults: FormulaResult[] = [];
          const variableIndex = fixedColumnIndices[1]; // Variable column
          const loqIndex = fixedColumnIndices[4]; // LOQ column
          
          // Get variable name and value
          const variable = row[variableIndex] as string;
          const value = row[colIndex];
          const loq = row[loqIndex];
          
          // Apply some basic formula evaluations (simplified for this example)
          formulas.forEach(formula => {
            // Check for LOQ comparison
            if (formula.name.includes('LOQ') && loq && value) {
              const valueNum = typeof value === 'number' ? value : parseFloat(value as string);
              const loqNum = typeof loq === 'number' ? loq : parseFloat((loq as string).replace('<', ''));
              
              if (!isNaN(valueNum) && !isNaN(loqNum) && valueNum < loqNum) {
                cellResults.push({
                  result: true,
                  message: `Değer (${valueNum}) LOQ değerinden (${loqNum}) düşük`,
                  color: formula.color || '#ffcccc',
                  formulaName: formula.name
                });
              }
            }
            
            // Check for specific variable formulas (e.g., WAD Siyanür vs Toplam Siyanür)
            if (variable === 'WAD Siyanür' && formula.name.includes('WAD')) {
              // Find the Total Cyanide row for the same date
              const totalCyanideRow = table.data.find(r => r[variableIndex] === 'Toplam Siyanür');
              if (totalCyanideRow) {
                const totalValue = totalCyanideRow[colIndex];
                const totalValueNum = typeof totalValue === 'number' ? totalValue : parseFloat(totalValue as string);
                const wadValueNum = typeof value === 'number' ? value : parseFloat(value as string);
                
                if (!isNaN(wadValueNum) && !isNaN(totalValueNum) && wadValueNum > totalValueNum) {
                  cellResults.push({
                    result: true,
                    message: `WAD Siyanür (${wadValueNum}) > Toplam Siyanür (${totalValueNum})`,
                    color: formula.color || '#ffaaff',
                    formulaName: formula.name
                  });
                }
              }
            }
          });
          
          // Store results if any
          if (cellResults.length > 0) {
            if (!results[rowIndex]) {
              results[rowIndex] = {};
            }
            results[rowIndex][colIndex] = cellResults;
          }
        }
      });
    });
    
    return results;
  };

  const getCellBackground = (rowIndex: number, colIndex: number) => {
    const results = evaluationResults[rowIndex]?.[colIndex];
    if (results && results.length > 0) {
      if (results.length === 1) {
        return results[0].color;
      } else {
        // Multiple rules - create gradient
        const colors = results.map(r => r.color).join(', ');
        return `linear-gradient(45deg, ${colors})`;
      }
    }
    return undefined;
  };

  const getTooltipContent = (rowIndex: number, colIndex: number) => {
    const results = evaluationResults[rowIndex]?.[colIndex];
    if (results && results.length > 0) {
      return (
        <div className="bg-white shadow-lg rounded-md p-3 text-sm z-50 max-w-xs">
          <h4 className="font-bold mb-2">Formül Sonuçları:</h4>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index}>
                <span className="font-medium">{result.formulaName}:</span>
                <span className="ml-1">{result.message}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  const filteredData = tableData?.data.filter(row => {
    if (!searchTerm) return true;
    
    return row.some(cell => {
      if (cell === null) return false;
      return String(cell).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const exportAsPDF = async () => {
    if (!tableData) return;
    
    const table = document.getElementById('excel-table');
    if (!table) return;
    
    try {
      const canvas = await html2canvas(table, { scale: 1 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.text(`${tableData.name} - ${tableData.sheetName}`, 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Tarih: ${new Date().toLocaleString('tr-TR')}`, 15, 22);
      
      pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      pdf.save(`${tableData.name}_${tableData.sheetName}.pdf`);
    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Tablo verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{tableData.name} - {tableData.sheetName}</h2>
      </div>
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FcSearch className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Ara..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportAsPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <FcPrint className="mr-2 bg-white rounded" /> PDF İndir
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table id="excel-table" className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              {tableData.columns.map((column, index) => (
                <th 
                  key={index}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-r"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className="px-4 py-2 text-sm border-b border-r relative"
                    style={{ 
                      background: getCellBackground(rowIndex, cellIndex)
                    }}
                    onMouseEnter={() => {
                      if (evaluationResults[rowIndex]?.[cellIndex]) {
                        setTooltipCell({ row: rowIndex, col: cellIndex });
                      }
                    }}
                    onMouseLeave={() => setTooltipCell(null)}
                  >
                    {cell !== null ? String(cell) : ''}
                    
                    {tooltipCell && tooltipCell.row === rowIndex && tooltipCell.col === cellIndex && (
                      <div className="absolute left-0 -mt-1 transform -translate-y-full z-10">
                        {getTooltipContent(rowIndex, cellIndex)}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 