'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FcAreaChart, FcRules, FcReuse, FcPlus } from 'react-icons/fc';
import EditableDataTable from '@/components/tables/EditableDataTable';import FormulaSelector from '@/components/formulas/FormulaSelector';

interface TableData {
  id: string;
  name: string;
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
  uploadedAt: string;
  updatedAt: string;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
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
  const [showFormulaSidebar, setShowFormulaSidebar] = useState(false);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [variables, setVariables] = useState<string[]>([]);

  // ESC key handling
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && showFormulaSidebar) {
      setShowFormulaSidebar(false);
    }
  }, [showFormulaSidebar]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [handleEscKey]);

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
      
      const result = await response.json();
      console.log("Formula application result:", result);
      
      if (result.highlightedCells && result.highlightedCells.length > 0) {
        console.log(`Received ${result.highlightedCells.length} highlighted cells:`, result.highlightedCells);
        setHighlightedCells(result.highlightedCells);
      } else {
        console.log("No highlighted cells received");
        setHighlightedCells([]);
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
      
      const preparedHighlightedCells = highlightedCells?.map(cell => ({
        row: cell.row,
        col: cell.col,
        color: cell.color,
        message: cell.message
      })) || [];
      
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeDate: true,
          highlightedCells: preparedHighlightedCells,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating PDF: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table?.name || 'table'}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error exporting to PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle formula toggling
  const handleToggleFormula = async (formulaId: string, active: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${formulaId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });
      
      if (!response.ok) {
        throw new Error(`Error toggling formula: ${response.statusText}`);
      }
      
      const updatedFormula = await response.json();
      setFormulas(prevFormulas => prevFormulas.map(formula =>
        formula.id === formulaId ? updatedFormula : formula
      ));
    } catch (err) {
      setError((err as Error).message);
      console.error('Error toggling formula:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle formula deletion
  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${formulaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting formula: ${response.statusText}`);
      }
      
      setFormulas(prevFormulas => prevFormulas.filter(formula => formula.id !== formulaId));
    } catch (err) {
      setError((err as Error).message);
      console.error('Error deleting formula:', err);
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

  // Convert table data to the format expected by EditableDataTable component
  const tableColumns = table?.columns?.map(col => ({
    id: col,
    name: col,
    type: 'string'
  })) || [];
  
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
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-black">
                {table.name}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/dashboard/workspaces/${workspaceId}/analysis?tableId=${tableId}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              >
                <FcAreaChart className="mr-2 bg-white rounded-full" />
                Analiz Et
              </Link>
              
              <button
                onClick={() => setShowFormulaSidebar(!showFormulaSidebar)}
                className={`px-4 py-2 rounded-md flex items-center ${
                  showFormulaSidebar 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                <FcRules className="mr-2" />
                {showFormulaSidebar ? 'Formülleri Gizle (ESC)' : 'Formülleri Göster'}
              </button>
              
              <button
                onClick={applyFormulas}
                disabled={activeFormulas.length === 0 || loading}
                                className={`px-4 py-2 rounded-md flex items-center ${                  activeFormulas.length === 0 || loading                    ? 'bg-slate-300 cursor-not-allowed text-slate-600'                    : 'bg-green-600 hover:bg-green-700 text-white'                }`}
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
            <div className={`${showFormulaSidebar ? 'lg:col-span-4' : 'lg:col-span-7'}`}>
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
            
            <div className={`${showFormulaSidebar ? 'lg:col-span-3' : 'hidden'}`}>
              <div className="space-y-4">
                {/* Formula Management Panel */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <FcRules className="mr-2" />
                    Formül Yönetimi
                  </h3>
                  
                  {/* Active Formulas List */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Mevcut Formüller</h4>
                    {formulas.length === 0 ? (
                      <p className="text-gray-500 text-sm">Bu workspace için henüz formül eklenmemiş.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {formulas.map((formula) => (
                          <div 
                            key={formula.id} 
                            className="border border-blue-200 rounded-lg p-3 hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                    style={{ backgroundColor: formula.color }}
                                  ></div>
                                  <h5 className="font-medium text-gray-800">{formula.name}</h5>
                                                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${                                    formula.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'                                  }`}>
                                    {formula.active ? 'Aktif' : 'Pasif'}
                                  </span>
                                </div>
                                {formula.description && (
                                  <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                                )}
                                                                <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">                                  <code className="text-xs text-blue-900 font-mono">{formula.formula}</code>                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <span className="mr-3">Tip: {formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişkisel'}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-1 ml-3">
                                <button
                                  onClick={() => handleToggleFormula(formula.id, !formula.active)}
                                  className={`p-1 rounded ${
                                    formula.active 
                                      ? 'text-orange-600 hover:bg-orange-100' 
                                      : 'text-green-600 hover:bg-green-100'
                                  }`}
                                  title={formula.active ? 'Pasifleştir' : 'Aktifleştir'}
                                >
                                  {formula.active ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteFormula(formula.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Sil"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formula Selection for Application */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Tabloya Uygula</h4>
                    <FormulaSelector
                      workspaceId={workspaceId}
                      onSelectionChange={handleFormulaChange}
                    />
                  </div>
                  
                  <div className="mt-4 border-t pt-4">
                    <Link 
                      href={`/dashboard/workspaces/${workspaceId}/formulas`}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FcRules className="mr-2" />
                      Gelişmiş Formül Yönetimi
                    </Link>
                  </div>
                </div>

                {/* Formula Editor Placeholder */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <FcRules className="mx-auto text-4xl mb-3" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Formül Oluştur ve Düzenle
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Detaylı formül yönetimi için gelişmiş editörü kullanın
                  </p>
                  <Link 
                    href={`/dashboard/workspaces/${workspaceId}/formulas`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <FcPlus className="mr-2" />
                    Gelişmiş Formül Editörü
                  </Link>
                  <p className="text-xs text-blue-600 mt-2">
                    ESC tuşu ile paneli kapatabilirsiniz
                  </p>
                </div>
              </div>
            </div>
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