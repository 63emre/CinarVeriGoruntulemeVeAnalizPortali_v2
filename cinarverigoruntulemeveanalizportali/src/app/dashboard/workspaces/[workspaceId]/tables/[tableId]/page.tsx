'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FcAreaChart, FcRules } from 'react-icons/fc';
import EditableDataTable from '@/components/tables/EditableDataTable';
import FormulaSelector from '@/components/formulas/FormulaSelector';
import FormulaBuilder from '@/components/formulas/FormulaBuilder';
import { showError, showSuccess, showInfo } from '@/components/ui/Notification';

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
  formulaIds?: string[];
  formulaDetails?: {
    id: string;
    name: string;
    formula: string;
    leftResult?: number;
    rightResult?: number;
    color: string;
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
  const [showFormulaSidebar, setShowFormulaSidebar] = useState(false);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ENHANCED: Auto-refresh state management
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Convert table data to the format expected by EditableDataTable component - using useMemo for performance
  const tableColumns = useMemo(() => 
    table?.columns?.map(col => ({
      id: col,
      name: col,
      type: 'string'
    })) || [], 
    [table?.columns]
  );
  
  const tableRows = useMemo(() => 
    table?.data?.map((row, rowIndex) => {
      const rowData: { [key: string]: string | number | null, id: string } = { id: `row-${rowIndex + 1}` };
      table.columns.forEach((col, colIndex) => {
        rowData[col] = row[colIndex];
      });
      return rowData;
    }) || [], 
    [table?.data, table?.columns]
  );

  // Debug highlighted cells - MOVED BEFORE EARLY RETURNS to fix hooks order
  useEffect(() => {
    if (highlightedCells.length > 0 && tableRows.length > 0 && tableColumns.length > 0) {
      console.log('=== HIGHLIGHTED CELLS DEBUG ===');
      console.log('Number of highlighted cells:', highlightedCells.length);
      console.log('Sample highlighted cells:', highlightedCells.slice(0, 3));
      console.log('Available row IDs in table:', tableRows.slice(0, 5).map(row => row.id));
      console.log('Available column IDs:', tableColumns.map(col => col.id));
      
      // Check for any row/column mismatches
      highlightedCells.forEach((cell, index) => {
        const rowExists = tableRows.some(row => row.id === cell.row);
        const colExists = tableColumns.some(col => col.id === cell.col);
        
        if (!rowExists) {
          console.warn(`❌ Row ID mismatch at index ${index}: "${cell.row}" not found in table rows`);
        }
        if (!colExists) {
          console.warn(`❌ Column ID mismatch at index ${index}: "${cell.col}" not found in table columns`);
        }
      });
      console.log('=== END DEBUG ===');
    }
  }, [highlightedCells, tableRows, tableColumns]);

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

  // ENHANCED: Auto-refresh effect for formula changes
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(async () => {
        // Refresh table data
        if (workspaceId && tableId) {
          try {
            const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
            if (response.ok) {
              const data = await response.json();
              setTable(data);
              console.log('📊 Auto-refresh: Table data updated');
            }
          } catch (error) {
            console.error('Auto-refresh table error:', error);
          }
        }
        
        // Refresh formulas
        try {
          const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
          if (response.ok) {
            const data = await response.json();
            setFormulas(data);
            console.log('🔄 Auto-refresh: Formulas updated');
          }
        } catch (error) {
          console.error('Auto-refresh formulas error:', error);
        }
        
        // Update last refresh time
        setLastRefresh(new Date());
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, workspaceId, tableId]);

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
    // Cell selection logic can be added here if needed
    console.log('Cell selected:', { rowId, colId, value });
  };

  // Apply formulas to the table data with enhanced error handling
  const applyFormulas = async () => {
    if (!activeFormulas.length) {
      showError('Lütfen en az bir formül seçin');
      return;
    }

    if (!table) {
      showError('Tablo verisi bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      setHighlightedCells([]); // Clear previous highlights

      // Import notification helpers
      const { showFormulaApplied } = await import('@/components/ui/Notification');

      // FIXED: Use the SAME logic as MultiChartAnalysis (Analysis page)
      const { evaluateFormulasForTable } = await import('@/lib/enhancedFormulaEvaluator');
      
      // Get active formulas - only the ones that are actually active
      const activeFormulaObjects = formulas.filter(f => 
        activeFormulas.includes(f.id) && f.active === true
      );
      
      if (activeFormulaObjects.length === 0) {
        showError('Seçili aktif formüller bulunamadı');
        return;
      }

      console.log('🔧 APPLYING FORMULAS:', {
        activeFormulaCount: activeFormulaObjects.length,
        formulaNames: activeFormulaObjects.map(f => f.name),
        tableDataStructure: {
          columns: table.columns.length,
          rows: table.data.length
        }
      });

      // FIXED: Use EXACT same data structure as Analysis page
      const tableDataForEvaluator = {
        columns: table.columns,
        data: table.data,
        name: table.name
      };

      // FIXED: Use the SAME evaluator as Analysis page - this is the key fix!
      const highlighted = evaluateFormulasForTable(activeFormulaObjects, tableDataForEvaluator);
      
      console.log('🎯 FORMULA EVALUATION RESULT:', {
        inputFormulas: activeFormulaObjects.length,
        outputHighlights: highlighted.length,
        sampleHighlight: highlighted[0],
        allRowIds: highlighted.map(h => h.row).slice(0, 10)
      });

      // Set the highlights - this should now work correctly
      setHighlightedCells(highlighted);

      // Enhanced feedback with proper success/info messaging using new notification system
      const formulaNames = activeFormulaObjects.map(f => f.name).join(', ');

      if (highlighted.length > 0) {
        console.log(`✅ SUCCESS: ${highlighted.length} cells highlighted for formulas: ${formulaNames}`);
        showFormulaApplied(formulaNames, highlighted.length);
      } else {
        console.log(`✅ APPLIED: Formulas applied but no cells match criteria: ${formulaNames}`);
        showFormulaApplied(formulaNames, 0);
      }

    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ FORMULA APPLICATION ERROR:', {
        error: errorMessage,
        stack: (err as Error).stack
      });
      showError(`Formül uygulama hatası: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF export with enhanced error handling and progress feedback
  const exportToPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting PDF export...');
      console.log(`📊 Table: ${table?.name}`);
      console.log(`🎯 Highlighted cells: ${highlightedCells?.length || 0}`);
      
      showInfo('📄 PDF oluşturuluyor...');
      
      const preparedHighlightedCells = highlightedCells?.map(cell => ({
        row: cell.row,
        col: cell.col,
        color: cell.color,
        message: cell.message
      })) || [];
      
      // Create proper Turkish filename
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0]; // 2025-01-02
      const timeStr = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-'); // 18-03-41
      
      // Clean table name for filename
      const cleanTableName = table?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Tablo';
      
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeDate: true,
          highlightedCells: preparedHighlightedCells,
          title: `${table?.name} - Formül Analizi`,
          subtitle: 'Çınar Çevre Laboratuvarı Veri Görüntüleme ve Analiz Portalı',
          orientation: 'landscape',
          includeFormulas: formulas.length > 0,
          userName: 'Portal Kullanıcısı'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PDF API error:', errorText);
        throw new Error(`PDF oluşturulamadı (${response.status}): ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Use proper Turkish filename with timestamp
      a.download = `Cinar_Veri_Raporu_${cleanTableName}_${dateStr}_${timeStr}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`✅ PDF başarıyla indirildi: ${a.download}`);
      showSuccess(`✅ PDF başarıyla oluşturuldu: ${a.download}`);
      
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ Error exporting to PDF:', err);
      showError(`❌ PDF oluşturma hatası: ${errorMessage}`);
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
      
      // ENHANCED: Trigger auto-refresh after formula toggle
      setAutoRefresh(true);
      setTimeout(() => setAutoRefresh(false), 5000); // Auto-refresh for 5 seconds
      
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
      
      // ENHANCED: Trigger auto-refresh after formula deletion
      setAutoRefresh(true);
      setTimeout(() => setAutoRefresh(false), 5000); // Auto-refresh for 5 seconds
      
    } catch (err) {
      setError((err as Error).message);
      console.error('Error deleting formula:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle formula creation with FormulaBuilder
  const handleFormulaCreate = async (
    formula: string, 
    name: string, 
    color: string, 
    scope: 'table' | 'workspace', 
    tableId?: string
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          formula,
          color,
          type: 'CELL_VALIDATION',
          description: `${scope === 'table' ? 'Tablo' : 'Workspace'} kapsamından oluşturulan formül: ${formula}`,
          active: true,
          scope: scope, // ENHANCED: Include scope
          tableId: scope === 'table' ? (tableId || table?.id) : null // ENHANCED: Include tableId for table scope
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error creating formula: ${response.statusText}`);
      }
      
      const result = await response.json();
      const newFormula = result.formula || result; // Handle different response formats
      setFormulas(prev => [...prev, newFormula]);
      setShowCreateForm(false); // Close the creation form
      
      // Success feedback with scope information
      const scopeInfo = scope === 'table' ? 'bu tabloya' : 'tüm workspace\'e';
      console.log(`✅ Formül "${name}" başarıyla oluşturuldu ve ${scopeInfo} uygulandı!`);
      
      // ENHANCED: Trigger auto-refresh after formula creation
      setAutoRefresh(true);
      setTimeout(() => setAutoRefresh(false), 10000); // Auto-refresh for 10 seconds
      
      // Show temporary success message
      setError(null);
      const successMessage = `Formül "${name}" başarıyla oluşturuldu (${scopeInfo}) ve mevcut formüller listesine eklendi.`;
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        if (error === successMessage) {
          setError(null);
        }
      }, 3000);
      
    } catch (err) {
      setError((err as Error).message);
      console.error('Error creating formula:', err);
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

  return (
    <div className="p-6">
      {table ? (
        <>
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-black">
                {table.name}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Sayfa: {table.sheetName} • Son güncelleme: {new Date(table.updatedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            
            {/* Formula Results Status */}
            {highlightedCells.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-w-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                  <span className="text-orange-800 font-medium text-sm">
                    {highlightedCells.length} hücre uyarısı
                  </span>
                </div>
                <p className="text-orange-700 text-xs mt-1">
                  Formül kriterlerini karşılamayan hücreler vurgulandı
                </p>
              </div>
            )}

            {/* No Issues Status */}
            {activeFormulas.length > 0 && highlightedCells.length === 0 && !loading && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-green-800 font-medium text-sm">
                    Tüm kontroller başarılı
                  </span>
                </div>
                <p className="text-green-700 text-xs mt-1">
                  Seçili formüller tüm hücreler için sağlandı
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              {/* ENHANCED: Auto-refresh controls */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Otomatik Yenile</span>
                </label>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="text-xs border-gray-300 rounded"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                )}
                {lastRefresh && (
                  <span className="text-xs text-gray-500">
                    Son: {lastRefresh.toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </div>
              
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
                {/* Unified Formula Management Panel */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <FcRules className="mr-2" />
                    Formül Yönetimi
                  </h3>
                  
                  {/* Quick Formula Creation */}
                  {!showCreateForm ? (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-800 mb-1">Formül Oluştur</h4>
                          <p className="text-sm text-green-600">
                            {variables.length} değişken mevcut. Yeni formül oluşturmak için tıklayın.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          disabled={variables.length === 0}
                          className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                            variables.length === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                          }`}
                        >
                          ➕ Yeni Formül
                        </button>
                      </div>
                      {variables.length === 0 && (
                        <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-orange-800 text-sm">
                          ⚠️ Formül oluşturmak için tabloda &quot;Variable&quot; kolonuna değişken adları ekleyin
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">Yeni Formül Oluştur</h4>
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕ Kapat
                        </button>
                      </div>
                      <FormulaBuilder
                        variables={variables}
                        onSave={handleFormulaCreate}
                        onCancel={() => setShowCreateForm(false)}
                        isVisible={true}
                        availableTables={[{ id: table?.id || '', name: table?.name || '' }]} // ENHANCED: Pass current table
                        currentTableId={table?.id} // ENHANCED: Pass current table ID
                      />
                    </div>
                  )}

                  {/* Available Formulas */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
                      <span>Mevcut Formüller ({formulas.length})</span>
                      {formulas.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {formulas.filter(f => f.active).length} aktif
                        </span>
                      )}
                    </h4>
                    
                    {formulas.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                        <FcRules className="mx-auto text-4xl mb-2 opacity-50" />
                        <p className="text-gray-500 text-sm">Henüz formül eklenmemiş</p>
                        <p className="text-gray-400 text-xs">Yukarıdaki butonu kullanarak yeni formül oluşturun</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {formulas.map((formula) => (
                          <div 
                            key={formula.id} 
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                    style={{ backgroundColor: formula.color }}
                                  ></div>
                                  <h5 className="font-medium text-gray-800">{formula.name}</h5>
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    formula.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {formula.active ? 'Aktif' : 'Pasif'}
                                  </span>
                                </div>
                                {formula.description && (
                                  <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                                )}
                                <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                  <code className="text-xs text-blue-900 font-mono">{formula.formula}</code>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-1 ml-3">
                                <button
                                  onClick={() => handleToggleFormula(formula.id, !formula.active)}
                                  className={`p-1 rounded text-xs ${
                                    formula.active 
                                      ? 'text-orange-600 hover:bg-orange-100' 
                                      : 'text-green-600 hover:bg-green-100'
                                  }`}
                                  title={formula.active ? 'Pasifleştir' : 'Aktifleştir'}
                                >
                                  {formula.active ? '⏸️' : '▶️'}
                                </button>
                                <button
                                  onClick={() => handleDeleteFormula(formula.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded text-xs"
                                  title="Sil"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formula Application Section */}
                  {formulas.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Tabloya Formül Uygula
                      </h4>
                      <FormulaSelector
                        workspaceId={workspaceId}
                        onSelectionChange={handleFormulaChange}
                      />
                      
                      {/* Apply Formulas Button */}
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={applyFormulas}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                            loading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uygulanıyor...
                            </>
                          ) : (
                            <>
                              🎯 Formülleri Uygula
                            </>
                          )}
                        </button>
                        
                        {highlightedCells.length > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            ✅ {highlightedCells.length} hücre vurgulandı
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
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