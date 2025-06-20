'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FcPrint, FcFullTrash, FcCheckmark, FcCancel, FcRules, FcDocument } from 'react-icons/fc';
import { AiOutlineSearch, AiOutlineSave } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import TableCell from './TableCell'; // ENHANCED: Import TableCell for pizza slice effect
import { showSuccess, showError, showInfo } from '@/components/ui/Notification';

type Column = {
  id: string;
  name: string;
  type: string;
  editable?: boolean;
};

type DataRow = {
  [key: string]: string | number | null;
  id: string;
};

// ENHANCED: Updated interface to match TableCell expectations
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

interface EditableDataTableProps {
  columns: Column[];
  data: DataRow[];
  loading?: boolean;
  title?: string;
  workspaceId?: string;
  tableId?: string;
  highlightedCells?: HighlightedCell[];
  onCellSelect?: (rowId: string, colId: string, value: string | number | null) => void;
  onDataChange?: (updatedData: DataRow[]) => void;
  onFormulasRecalculated?: (highlightedCells: HighlightedCell[]) => void;
  autoRecalculateFormulas?: boolean;
  printable?: boolean;
  downloadUrl?: string;
  showDataTypes?: boolean;
  cellBorderWidth?: number;
}

export default function EditableDataTable({
  columns,
  data,
  loading = false,
  title = 'Veri Tablosu',
  workspaceId,
  tableId,
  highlightedCells = [],
  onCellSelect,
  onDataChange,
  onFormulasRecalculated,
  autoRecalculateFormulas = true,
  printable = false,
  downloadUrl,
  showDataTypes = true,
  cellBorderWidth = 2
}: EditableDataTableProps) {
  const [tableData, setTableData] = useState<DataRow[]>(data);
  const [originalData, setOriginalData] = useState<DataRow[]>(data);
  const [editingCell, setEditingCell] = useState<{rowId: string, colId: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCell, setSelectedCell] = useState<{row: string, col: string} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Focus the edit input when it becomes visible
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Fetch table data if tableId and workspaceId are provided
  useEffect(() => {
    if (tableId && workspaceId && !data.length) {
      const fetchTableData = async () => {
        console.log('Fetching table data for:', tableId);
        try {
          const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
          if (!response.ok) {
            throw new Error('Tablo verileri yüklenemedi');
          }
          const tableData = await response.json();
          
          if (tableData && tableData.columns && tableData.data) {
            // Convert data structure to match component's expectations
            const columnDefs: Column[] = tableData.columns.map((col: string) => ({
              id: col,
              name: col,
              type: 'string',
              editable: !['id'].includes(col)
            }));
            
            // Add ID column if not present
            columnDefs.unshift({
              id: 'id',
              name: '#',
              type: 'number',
              editable: false
            });
            
            // Add row IDs to data
            const rowsWithIds: DataRow[] = tableData.data.map((row: (string | number | null)[], index: number) => {
              const rowData: DataRow = { id: String(index + 1) };
              tableData.columns.forEach((col: string, colIndex: number) => {
                rowData[col] = row[colIndex];
              });
              return rowData;
            });
            
            console.log('🔍 ROW ID DEBUG:', {
              totalRows: rowsWithIds.length,
              sampleRowIds: rowsWithIds.slice(0, 5).map(row => row.id),
              highlightedRowIds: highlightedCells.map(cell => cell.row).slice(0, 10)
            });
            
            // Update local state with fetched data
            setTableData(rowsWithIds);
            setOriginalData(JSON.parse(JSON.stringify(rowsWithIds)));
          } else {
            throw new Error('Tablo yapısı geçersiz');
          }
        } catch (err) {
          console.error('Error fetching table data:', err);
          showError((err as Error).message);
        }
      };
      
      fetchTableData();
    } else if (!tableId && workspaceId) {
      showError('Lütfen bir tablo seçin');
    }
  }, [tableId, workspaceId, data.length, highlightedCells]);
  
  // Update data when data prop changes
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setHasChanges(false);
    }
  }, [data]);

  // NEW: Fetch formulas for auto-recalculation
  useEffect(() => {
    const fetchFormulas = async () => {
      if (!workspaceId || !autoRecalculateFormulas) return;
      
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (response.ok) {
          const formulasData = await response.json();
          const activeFormulas = formulasData.filter((f: any) => f.active === true);
          setFormulas(activeFormulas);
          console.log(`📊 EditableDataTable: Loaded ${activeFormulas.length} active formulas for auto-recalculation`);
        }
      } catch (error) {
        console.error('Error fetching formulas for auto-recalculation:', error);
      }
    };

    fetchFormulas();
  }, [workspaceId, autoRecalculateFormulas]);

  // NEW: Auto-recalculate formulas when data changes
  const recalculateFormulas = useCallback(async (updatedData: DataRow[]) => {
    if (!autoRecalculateFormulas || formulas.length === 0 || !workspaceId) {
      return;
    }

    setIsRecalculating(true);
    try {
      console.log('🔄 Auto-recalculating formulas after data change...');
      
      // Import the formula evaluator
      const { evaluateFormulasWithDataRows } = await import('@/lib/enhancedFormulaEvaluator');
      
      // Recalculate highlights
      const newHighlights = evaluateFormulasWithDataRows(
        formulas,
        updatedData,
        columns.map(col => col.id)
      );
      
      console.log(`✨ Auto-recalculation complete: ${newHighlights.length} highlighted cells`);
      
      // Notify parent component about new highlights
      if (onFormulasRecalculated) {
        onFormulasRecalculated(newHighlights);
      }
      
      // Show brief feedback to user
      if (newHighlights.length !== highlightedCells.length) {
        showInfo(`🔄 Formüller otomatik güncellendi: ${newHighlights.length} hücre vurgulandı`);
      }
      
    } catch (error) {
      console.error('Error in auto-recalculation:', error);
      showError('Formül otomatik hesaplamasında hata oluştu');
    } finally {
      setIsRecalculating(false);
    }
  }, [formulas, highlightedCells.length, columns, workspaceId, autoRecalculateFormulas, onFormulasRecalculated]);

  // Handle cell value changes with auto-recalculation and enhanced data processing
  const handleCellChange = useCallback(async (rowId: string, colId: string, newValue: string | number | null) => {
    console.log('🔄 Hücre değeri değiştiriliyor:', { rowId, colId, newValue });
    
    // Import data utilities
    const { parseValue, validateCellValue, updateCellValue } = await import('@/lib/dataUtils');
    
    // Validate the new value
    const validation = validateCellValue(newValue, 'string');
    if (!validation.isValid) {
      showError(`❌ Geçersiz değer: ${validation.error}`);
      return;
    }
    
    // Parse and format the value
    const parsedValue = validation.parsedValue;
    let displayValue = parsedValue.displayValue || newValue;
    
    // Handle Turkish number format conversion
    if (parsedValue.numericValue !== null) {
      displayValue = String(parsedValue.numericValue);
    } else if (parsedValue.isComparison) {
      displayValue = `${parsedValue.comparisonOperator}${parsedValue.numericValue}`;
    }
    
    // Update local state first
    const updatedData = tableData.map(row => 
      row.id === rowId 
        ? { ...row, [colId]: displayValue }
        : row
    );
    
    setTableData(updatedData);
    setEditingCell(null);
    setHasChanges(true);
    
    // Show immediate feedback
    showInfo(`📝 Hücre güncellendi: ${displayValue || 'boş değer'}`);
    
    // Save to database if tableId and workspaceId are available
    if (tableId && workspaceId) {
      try {
        // Find row and column indices
        const rowIndex = parseInt(rowId.replace('row-', '')) - 1;
        const columnIndex = columns.findIndex(col => col.id === colId) - 1; // -1 for ID column
        
        if (rowIndex >= 0 && columnIndex >= 0) {
          const success = await updateCellValue(
            workspaceId,
            tableId,
            rowIndex,
            columnIndex,
            displayValue
          );
          
          if (success) {
            showSuccess(`✅ Hücre başarıyla kaydedildi: ${displayValue || 'boş değer'}`);
            setHasChanges(false); // Reset changes flag
          } else {
            showError('❌ Hücre kaydedilemedi, daha sonra tekrar deneyin');
          }
        }
      } catch (error) {
        console.error('Cell save error:', error);
        showError('❌ Hücre kaydetme sırasında hata oluştu');
      }
    }
    
    // Notify parent component
    if (onDataChange) {
      onDataChange(updatedData);
    }
    
    // AUTO-RECALCULATE formulas
    if (autoRecalculateFormulas) {
      await recalculateFormulas(updatedData);
    }
    
    console.log(`📝 Cell updated: ${rowId}.${colId} = ${displayValue}${autoRecalculateFormulas ? ' (formulas auto-recalculated)' : ''}`);
  }, [tableData, columns, tableId, workspaceId, onDataChange, autoRecalculateFormulas, recalculateFormulas]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  const sortedData = Array.isArray(tableData) 
    ? [...tableData].sort((a, b) => {
        if (!sortColumn) return 0;
        
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        return sortDirection === 'asc' 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      })
    : [];
  
  const filteredData = searchTerm && Array.isArray(sortedData)
    ? sortedData.filter(row => 
        Object.entries(row).some(([key, value]) => {
          if (key === 'id') return false;
          return value !== null && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : sortedData;
    
  const handleCellClick = (rowId: string, colId: string, value: string | number | null) => {
    setSelectedCell({ row: rowId, col: colId });
    if (onCellSelect) {
      onCellSelect(rowId, colId, value);
    }
  };
  
  const handleCellDoubleClick = (rowId: string, colId: string, value: string | number | null, isEditable: boolean) => {
    if (!isEditable) return;
    
    setEditingCell({ rowId, colId });
    setEditValue(value !== null ? String(value) : '');
  };
  
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const handleEditSave = async (rowId: string, colId: string) => {
    console.log('💾 Hücre düzenleme kaydediliyor:', { rowId, colId, editValue });
    
    try {
      // Import data utilities
      const { parseValue, validateCellValue, updateCellValue } = await import('@/lib/dataUtils');
      
      // Validate the new value
      const validation = validateCellValue(editValue, 'string');
      if (!validation.isValid) {
        showError(`❌ Geçersiz değer: ${validation.error}`);
        return;
      }
      
      // Parse and format the value
      const parsedValue = validation.parsedValue;
      let displayValue = parsedValue.displayValue || editValue;
      
      // Handle Turkish number format conversion
      if (parsedValue.numericValue !== null) {
        displayValue = String(parsedValue.numericValue);
      } else if (parsedValue.isComparison) {
        displayValue = `${parsedValue.comparisonOperator}${parsedValue.numericValue}`;
      }
      
      // Update local state
      const updatedData = tableData.map(row => {
        if (row.id === rowId) {
          return { ...row, [colId]: displayValue };
        }
        return row;
      });
      
      setTableData(updatedData);
      setEditingCell(null);
      setEditValue('');
      setHasChanges(true);
      
      // Show immediate feedback
      showInfo(`📝 Değer güncellendi: ${displayValue || 'boş değer'}`);
      
      // Save to database if possible
      if (tableId && workspaceId) {
        try {
          const rowIndex = parseInt(rowId.replace('row-', '')) - 1;
          const columnIndex = columns.findIndex(col => col.id === colId) - 1; // -1 for ID column
          
          if (rowIndex >= 0 && columnIndex >= 0) {
            const success = await updateCellValue(
              workspaceId,
              tableId,
              rowIndex,
              columnIndex,
              displayValue
            );
            
            if (success) {
              showSuccess(`✅ Hücre veritabanına kaydedildi: ${displayValue || 'boş değer'}`);
              setHasChanges(false);
            } else {
              showError('❌ Veritabanı kaydetme başarısız');
            }
          }
        } catch (error) {
          console.error('Database save error:', error);
          showError('❌ Veritabanı kaydetme sırasında hata oluştu');
        }
      }
      
      // Notify parent component
      if (onDataChange) {
        onDataChange(updatedData);
      }
      
      // Auto-recalculate formulas if enabled
      if (autoRecalculateFormulas) {
        await recalculateFormulas(updatedData);
      }
      
    } catch (error) {
      console.error('Edit save error:', error);
      showError('❌ Hücre güncelleme sırasında hata oluştu');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, colId: string) => {
    if (e.key === 'Enter') {
      handleEditSave(rowId, colId);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Save all changes back to the server
  const saveChanges = async () => {
    if (!tableId || !workspaceId) {
      showError('Tablo ID veya Workspace ID eksik');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Convert data back to the format expected by the API
      const apiData = {
        name: title,
        columns: columns.filter(col => col.id !== 'id').map(col => col.id),
        data: tableData.map(row => {
          return columns.filter(col => col.id !== 'id').map(col => row[col.id]);
        })
      };
      
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        throw new Error(`Değişiklikler kaydedilemedi: ${response.statusText}`);
      }
      
      // Update original data to match current data
      setOriginalData(JSON.parse(JSON.stringify(tableData)));
      setHasChanges(false);
      showSuccess('Değişiklikler başarıyla kaydedildi!');
      
    } catch (err) {
      console.error('Error saving table data:', err);
      showError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Discard all changes and revert to original data
  const discardChanges = () => {
    setTableData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
  };

  // Keep only the regular PDF export function
  const exportToPdf = async () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      alert('PDF oluşturmak için tablo verisi gereklidir.');
      return;
    }
    
    try {
      console.log('🚀 Starting PDF export from EditableDataTable...');
      
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeDate: true,
          highlightedCells: highlightedCells,
          title: `${title} - Tablo Raporu`,
          subtitle: 'Çınar Çevre Laboratuvarı Veri Görüntüleme ve Analiz Portalı',
          orientation: 'landscape',
          includeFormulas: false,
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
      
      // Create proper Turkish filename
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      const timeStr = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-');
      const cleanTableName = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      a.download = `Cinar_Tablo_${cleanTableName}_${dateStr}_${timeStr}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ PDF export completed from EditableDataTable');
      
    } catch (error) {
      console.error('❌ PDF export error:', error);
      alert(`PDF oluşturulurken hata: ${(error as Error).message}`);
    }
  };

  if (filteredData.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="text-center py-20 text-gray-600 font-medium">
          {searchTerm 
            ? 'Arama kriterlerine uygun sonuç bulunamadı.' 
            : 'Gösterilecek veri bulunmuyor.'}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-blue-100 text-sm">
              {filteredData.length} satır, {columns.length} sütun
              {autoRecalculateFormulas && formulas.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-500 rounded-full text-xs">
                  🔄 Otomatik formül hesaplama aktif ({formulas.length} formül)
                </span>
              )}
              {isRecalculating && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 rounded-full text-xs animate-pulse">
                  ⚡ Hesaplanıyor...
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Ara..."
                className="pl-9 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            {hasChanges && (
              <div className="flex space-x-2">
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <AiOutlineSave className="mr-1" />
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                
                <button
                  onClick={discardChanges}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-md flex items-center"
                >
                  <FcCancel className="mr-1" />
                  İptal
                </button>
              </div>
            )}
            
            <button
              onClick={toggleFullscreen}
              className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 rounded-md flex items-center transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFullscreen ? "M9 9V4H4v5M20 4v5h-5V4M4 15h5v5H4v-5M15 15h5v5h-5v-5" : "M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
              </svg>
              {isFullscreen ? 'Küçült' : 'Tam Ekran'}
            </button>
            
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-md flex items-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Excel
              </a>
            )}
            
            {printable && (
              <button
                onClick={handlePrint}
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-md flex items-center transition"
              >
                <FcPrint className="mr-1" />
                Yazdır
              </button>
            )}
            
            <button
              onClick={exportToPdf}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs"
              title="PDF olarak indir"
            >
              <FcDocument className="mr-1 h-3 w-3" />
              PDF İndir
            </button>
          </div>
        </div>
      </div>
      
      <div className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[80vh]'}`} ref={tableContainerRef}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100 sticky top-0 z-20">
                <tr>
                  {columns.map((column) => {
                    // OPTIMIZED: More efficient column width calculation
                    let colWidth = "auto";
                    
                    if (column.id === 'id') {
                      colWidth = "50px"; // Narrower ID column
                    } 
                    else if (['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'].includes(column.id)) {
                      colWidth = "120px"; // Reduced from 150px
                    } 
                    else {
                      colWidth = "100px"; // Reduced from 120px for date columns
                    }
                    
                    return (
                      <th
                        key={column.id}
                        scope="col"
                        style={{ 
                          width: colWidth, 
                          minWidth: colWidth,
                          maxWidth: colWidth
                        }}
                        className="px-2 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border border-gray-300 bg-gray-100"
                        onClick={() => handleSort(column.id)}
                        title={column.name}
                      >
                        <div className="flex items-center">
                          <span className="truncate">{column.name}</span>
                          {sortColumn === column.id && (
                            <span className="ml-1 flex-shrink-0 text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* OPTIMIZED: Limit visible rows for better performance */}
                {filteredData.slice(0, 500).map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => {
                      const cellValue = row[column.id];
                      const isSelected = selectedCell?.row === row.id && selectedCell?.col === column.id;
                      const isEditing = editingCell?.rowId === row.id && editingCell?.colId === column.id;
                      const isEditable = column.editable !== false;
                      
                      // OPTIMIZED: Use TableCell component with better performance
                      if (isEditing) {
                        return (
                          <td
                            key={`${row.id}-${column.id}`}
                            className="px-2 py-1 text-xs border border-gray-200"
                            style={{ 
                              width: column.id === 'id' ? '50px' : column.id.includes('Data Source') || column.id.includes('Variable') ? '120px' : '100px',
                              maxWidth: column.id === 'id' ? '50px' : column.id.includes('Data Source') || column.id.includes('Variable') ? '120px' : '100px'
                            }}
                          >
                            <div className="flex items-center">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, row.id, column.id)}
                                className="w-full px-1 py-0.5 border border-blue-500 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSave(row.id, column.id);
                                }}
                                className="ml-1 p-0.5 text-green-600 hover:bg-green-50 rounded"
                              >
                                <FcCheckmark className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCancel();
                                }}
                                className="ml-1 p-0.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FcCancel className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        );
                      }
                      
                      // OPTIMIZED: Use TableCell component for all non-editing cells
                      return (
                        <TableCell
                          key={`${row.id}-${column.id}`}
                          rowId={row.id}
                          colId={column.id}
                          value={cellValue}
                          highlights={highlightedCells}
                          isSelected={isSelected}
                          onClick={(rowId, colId, value) => {
                            handleCellClick(rowId, colId, value);
                            if (isEditable) {
                              const currentTime = Date.now();
                              const lastClickTime = (window as Window & { lastClickTime?: number }).lastClickTime || 0;
                              if (currentTime - lastClickTime < 300) {
                                handleCellDoubleClick(rowId, colId, value, isEditable);
                              }
                              (window as Window & { lastClickTime?: number }).lastClickTime = currentTime;
                            }
                          }}
                        />
                      );
                    })}
                  </tr>
                ))}
                
                {/* OPTIMIZED: Show message if data is truncated */}
                {filteredData.length > 500 && (
                  <tr>
                    <td 
                      colSpan={columns.length} 
                      className="px-4 py-6 text-center text-gray-500 bg-yellow-50 border border-yellow-200"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-sm font-medium">
                          Performans için ilk 500 satır gösteriliyor
                        </span>
                        <span className="text-xs">
                          Toplam {filteredData.length} satırdan 500 tanesi görüntülendi. 
                          Daha fazla sonuç için arama filtresini kullanın.
                        </span>
                        <button
                          onClick={() => {
                            // Option to load more data
                            console.log('Load more data functionality can be implemented here');
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          Daha Fazla Göster
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-gray-900 text-sm border-t border-gray-200 flex justify-between">
        <div>
          {Array.isArray(filteredData) ? (
            <>
              <span className="font-medium">
                {Math.min(filteredData.length, 500)}
              </span> satır gösteriliyor
              {searchTerm && Array.isArray(data) && ` (toplam ${data.length} satırdan)`}
              {filteredData.length > 500 && (
                <span className="text-yellow-600 ml-2">
                  • Performans için {filteredData.length - 500} satır gizlendi
                </span>
              )}
            </>
          ) : (
            'Veri yok'
          )}
        </div>
        {isFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="text-red-600 hover:text-red-800 flex items-center text-xs"
          >
            <FcFullTrash className="mr-1 h-4 w-4" />
            Tam Ekrandan Çık
          </button>
        )}
      </div>
    </div>
  );
} 