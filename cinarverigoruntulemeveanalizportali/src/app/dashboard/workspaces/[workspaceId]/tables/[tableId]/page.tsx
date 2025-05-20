'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FcRules, FcReuse, FcPlus } from 'react-icons/fc';
import EditableDataTable from '@/components/tables/EditableDataTable';
import FormulaSelector from '@/components/formulas/FormulaSelector';
import Link from 'next/link';

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

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  color: string;
  active: boolean;
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
  const [showFormulaSidebar, setShowFormulaSidebar] = useState(false);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [newFormula, setNewFormula] = useState({
    name: '',
    formula: '',
    type: 'CELL_VALIDATION' as 'CELL_VALIDATION' | 'RELATIONAL',
    color: '#ef4444'
  });
  const [creatingFormula, setCreatingFormula] = useState(false);
  const [formulaSuccess, setFormulaSuccess] = useState('');

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
        
        // Extract variables from the table data
        if (data.columns && data.data) {
          const variableColumnIndex = data.columns.findIndex(
            (col: string) => col.toLowerCase() === 'variable'
          );
          
          if (variableColumnIndex !== -1) {
            const uniqueVariables = Array.from(
              new Set(
                data.data
                  .map((row: (string | number | null)[]) => row[variableColumnIndex])
                  .filter((val: string | number | null) => val !== null && val !== '')
              )
            ) as string[];
            
            setVariables(uniqueVariables);
          }
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching table data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchFormulas = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (!response.ok) {
          throw new Error('Formüller yüklenirken hata oluştu');
        }
        const data = await response.json();
        setFormulas(data);
      } catch (err) {
        console.error('Error fetching formulas:', err);
      }
    };
    
    if (workspaceId && tableId) {
      fetchTableData();
      fetchFormulas();
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
        // Ensure the data doesn't contain null values
        const sanitizedData = result.tableData.map(row => 
          row.map(cell => cell === null ? '' : cell)
        ) as (string | number)[][];
        
        setTable(prev => prev ? { ...prev, data: sanitizedData } : null);
        
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

  // Create a new formula
  const createFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFormula.name || !newFormula.formula) {
      setError('Formül adı ve formül ifadesi gereklidir');
      return;
    }
    
    try {
      setCreatingFormula(true);
      
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFormula.name,
          description: `Tablo için oluşturulmuş ${newFormula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'Oran ve Toplam İlişkisi'} formülü`,
          formula: newFormula.formula,
          color: newFormula.color,
          type: newFormula.type,
          tableId: tableId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Formül eklenirken bir hata oluştu');
      }
      
      const formula = await response.json();
      
      // Add the new formula to the list
      setFormulas([...formulas, formula]);
      
      // Reset form
      setNewFormula({
        name: '',
        formula: '',
        type: 'CELL_VALIDATION',
        color: '#ef4444'
      });
      
      setFormulaSuccess('Formül başarıyla eklendi');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormulaSuccess('');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreatingFormula(false);
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

  // Convert table data to the format expected by EditableDataTable component
  const tableColumns = table?.columns?.map(col => ({
    id: col,
    name: col,
    type: 'string'
  })) || [];
  
  // Convert table rows to the format expected by EditableDataTable component
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
            <h1 className="text-2xl font-bold text-black">{table.name}</h1>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFormulaSidebar(!showFormulaSidebar)}
                className={`px-4 py-2 rounded-md flex items-center ${
                  showFormulaSidebar 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                <FcRules className="mr-2" />
                {showFormulaSidebar ? 'Formülleri Gizle' : 'Formülleri Göster'}
              </button>
              
              <button
                onClick={applyFormulas}
                disabled={activeFormulas.length === 0 || loading}
                className={`px-4 py-2 rounded-md flex items-center ${
                  activeFormulas.length === 0 || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <FcReuse className="mr-2 bg-white rounded-full" />
                {loading ? 'İşleniyor...' : 'Formülleri Uygula'}
              </button>
              
              <button
                onClick={exportToPdf}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PDF&apos;e Aktar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className={`${showFormulaSidebar ? 'lg:col-span-5' : 'lg:col-span-7'}`}>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <EditableDataTable 
                  columns={tableColumns}
                  data={tableRows}
                  loading={loading}
                  title={table.name}
                  workspaceId={workspaceId}
                  tableId={tableId}
                  highlightedCells={highlightedCells}
                  onCellSelect={handleCellSelect}
                  onDataChange={(updatedData) => {
                    // Convert the updated data back to the original format
                    const updatedTableData = table.data.map((_, rowIndex) => {
                      const rowData = updatedData.find(row => row.id === `row-${rowIndex + 1}`);
                      return table.columns.map(col => rowData ? rowData[col] : null);
                    });
                    
                    setTable({
                      ...table,
                      data: updatedTableData
                    });
                  }}
                />
              </div>
            </div>
            
            {showFormulaSidebar && (
              <div className="lg:col-span-2">
                {/* Formulas Panel */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-black mb-4">Formül Seçimi</h3>
                  <FormulaSelector
                    workspaceId={workspaceId}
                    onSelectionChange={handleFormulaChange}
                  />
                  
                  {/* Link to Formulas Page */}
                  <div className="mt-4 border-t pt-4">
                    <Link 
                      href={`/dashboard/formulas?workspaceId=${workspaceId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FcRules className="mr-2" />
                      Tüm Formülleri Yönet
                    </Link>
                  </div>
                </div>
                
                {/* Quick Formula Creator */}
                <div className="bg-white shadow-md rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <FcPlus className="mr-2" />
                    Hızlı Formül Oluştur
                  </h3>
                  
                  {formulaSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded relative mb-4">
                      <span className="block sm:inline text-sm">{formulaSuccess}</span>
                    </div>
                  )}
                  
                  <form onSubmit={createFormula}>
                    <div className="mb-3">
                      <label htmlFor="formula-name" className="block text-sm font-medium text-gray-800 mb-1">
                        Formül Adı
                      </label>
                      <input
                        type="text"
                        id="formula-name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newFormula.name}
                        onChange={(e) => setNewFormula({...newFormula, name: e.target.value})}
                        placeholder="Örn: Siyanür > LOQ"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="formula-type" className="block text-sm font-medium text-gray-800 mb-1">
                        Formül Tipi
                      </label>
                      <select
                        id="formula-type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newFormula.type}
                        onChange={(e) => setNewFormula({...newFormula, type: e.target.value as 'CELL_VALIDATION' | 'RELATIONAL'})}
                      >
                        <option value="CELL_VALIDATION">Hücre Doğrulama</option>
                        <option value="RELATIONAL">Oran İlişkisi</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="formula-expression" className="block text-sm font-medium text-gray-800 mb-1">
                        Formül İfadesi
                      </label>
                      <textarea
                        id="formula-expression"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        rows={4}
                        value={newFormula.formula}
                        onChange={(e) => setNewFormula({...newFormula, formula: e.target.value})}
                        placeholder="Örn: [Toplam Fosfor] > [Orto Fosfat]"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Değişken adlarını köşeli parantez içinde yazın: [Değişken]
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="formula-color" className="block text-sm font-medium text-gray-800 mb-1">
                        Vurgulama Rengi
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          id="formula-color"
                          className="h-8 w-8 border-0"
                          value={newFormula.color}
                          onChange={(e) => setNewFormula({...newFormula, color: e.target.value})}
                        />
                        <span className="ml-2 text-sm text-gray-700">{newFormula.color}</span>
                      </div>
                    </div>
                    
                    {variables.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Tablodaki Değişkenler
                        </label>
                        <div className="bg-gray-50 p-2 rounded-md max-h-32 overflow-y-auto">
                          {variables.map((variableName, index) => (
                            <div 
                              key={index}
                              className="inline-block bg-white px-2 py-1 text-xs rounded border m-1 cursor-pointer hover:bg-blue-50"
                              onClick={() => {
                                // Add variable to formula at cursor position
                                const formulaInput = document.getElementById('formula-expression') as HTMLTextAreaElement;
                                const start = formulaInput.selectionStart || 0;
                                const end = formulaInput.selectionEnd || 0;
                                const text = newFormula.formula;
                                const variableText = `[${variableName}]`;
                                const newText = text.substring(0, start) + variableText + text.substring(end);
                                setNewFormula({...newFormula, formula: newText});
                              }}
                            >
                              {variableName}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Tıklayarak formüle ekleyin
                        </p>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={!newFormula.name || !newFormula.formula || creatingFormula}
                    >
                      {creatingFormula ? 'Oluşturuluyor...' : 'Formül Oluştur'}
                    </button>
                  </form>
                </div>
                
                {selectedCell && (
                  <div className="mt-4 bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-md font-semibold text-black mb-3">Seçili Hücre</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm mb-1">
                        <span className="font-semibold text-gray-800">Satır:</span> {selectedCell.rowId}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-semibold text-gray-800">Kolon:</span> {selectedCell.colId}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold text-gray-800">Değer:</span> {selectedCell.value !== null ? String(selectedCell.value) : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
} 