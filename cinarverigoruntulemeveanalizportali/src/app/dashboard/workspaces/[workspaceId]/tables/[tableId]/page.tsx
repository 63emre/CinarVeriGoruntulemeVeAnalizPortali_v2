'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DataTable from '@/components/tables/DataTable';
import FormulaSelector from '@/components/formulas/FormulaSelector';

interface TableData {
  id: string;
  name: string;
  sheetName: string;
  columns: string[];
  data: (string | number)[][];
  uploadedAt: string;
  updatedAt: string;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
}

interface FormulaResult {
  tableData: (string | number | null)[][];
  highlightedCells: {
    rowIndex: number;
    colIndex: number;
    color: string;
    message: string;
  }[];
}

export default function TablePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const tableId = params.tableId as string;
  
  const [table, setTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFormulas, setActiveFormulas] = useState<string[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<HighlightedCell[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{rowId: string, colId: string, value: string | number | null} | null>(null);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching table: ${response.statusText}`);
        }
        
        const data = await response.json();
        setTable(data);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching table data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (workspaceId && tableId) {
      fetchTableData();
    }
  }, [workspaceId, tableId]);

  // Handle formula selection
  const handleFormulaChange = (formulaIds: string[]) => {
    setActiveFormulas(formulaIds);
  };

  // Handle cell selection for variable identification
  const handleCellSelect = (rowId: string, colId: string, value: string | number | null) => {
    setSelectedCell({rowId, colId, value});
    
    // If the Variable column is selected, update the selectedVariable
    if (colId === 'Variable' && typeof value === 'string') {
      setSelectedVariable(value);
    }
  };

  // Apply formulas to the table data
  const applyFormulas = async () => {
    if (!activeFormulas.length) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/apply-formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formulaIds: activeFormulas,
          selectedVariable: selectedVariable,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error applying formulas: ${response.statusText}`);
      }
      
      const result = await response.json() as FormulaResult;
      
      // Update table with results
      if (result.tableData) {
        setTable(prev => prev ? { ...prev, data: result.tableData as (string | number)[][] } : null);
        
        // Process highlighted cells
        if (result.highlightedCells && result.highlightedCells.length > 0) {
          const formattedHighlights = result.highlightedCells.map(cell => ({
            row: `row-${cell.rowIndex + 1}`,
            col: table?.columns[cell.colIndex] || '',
            color: cell.color,
            message: cell.message
          }));
          
          setHighlightedCells(formattedHighlights);
        }
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Error applying formulas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF export
  const exportToPdf = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeDate: true,
          highlightedCells: highlightedCells,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating PDF: ${response.statusText}`);
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table?.name || 'table'}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error exporting to PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !table) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Convert table data to the format expected by DataTable component
  const tableColumns = table?.columns?.map(col => ({
    id: col,
    name: col,
    type: 'string'
  })) || [];
  
  // Convert table rows to the format expected by DataTable component
  const tableRows = table?.data?.map((row, rowIndex) => {
    const rowData: { [key: string]: string | number | null, id: string } = { id: `row-${rowIndex + 1}` };
    table.columns.forEach((col, colIndex) => {
      rowData[col] = row[colIndex];
    });
    return rowData;
  }) || [];

  return (
    <div className="p-6">
      {table ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{table.name}</h1>
            
            <div className="flex space-x-2">
              <button
                onClick={applyFormulas}
                disabled={activeFormulas.length === 0 || loading}
                className={`px-4 py-2 rounded-md ${
                  activeFormulas.length === 0 || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'İşleniyor...' : 'Formülleri Uygula'}
              </button>
              
              <button
                onClick={exportToPdf}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                PDF&apos;e Aktar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-4">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <DataTable 
                  columns={tableColumns}
                  data={tableRows}
                  loading={loading}
                  title={table.name}
                  printable={true}
                  highlightedCells={highlightedCells}
                  onCellSelect={handleCellSelect}
                />
              </div>
              
              {selectedCell && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900">Seçili Hücre</h3>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-800">
                      <span className="font-medium">Kolon:</span> {selectedCell.colId}
                    </div>
                    <div className="text-sm text-gray-800">
                      <span className="font-medium">Değer:</span> {selectedCell.value !== null ? selectedCell.value : '-'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Formüller</h2>
                <FormulaSelector 
                  workspaceId={workspaceId} 
                  onSelectionChange={handleFormulaChange} 
                />
                
                {selectedVariable && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="text-sm font-medium text-green-900">Seçili Değişken</h3>
                    <div className="mt-1 text-sm text-gray-800">
                      <span className="font-medium">{selectedVariable}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      Bu değişken formül uygulaması için kullanılacaktır.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Tablo bulunamadı</p>
        </div>
      )}
    </div>
  );
} 