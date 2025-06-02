'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FcDownload, FcPrint, FcExpand, FcCollapse } from 'react-icons/fc';
import { AiOutlineSearch } from 'react-icons/ai';
import EnhancedTableCell from './EnhancedTableCell';
import { evaluateFormulasWithDataRows } from '../../lib/enhancedFormulaEvaluator';

type Column = {
  id: string;
  name: string;
  type: string;
};

type DataRow = {
  id: string;
  [key: string]: string | number | null;
};

// Interface for formula-highlighted cells
interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
  formulaIds?: string[]; // IDs of formulas that triggered the highlight
}

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  color: string;
  tableId: string | null;
  workspaceId: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
}

interface DataTableProps {
  data?: DataRow[];
  columns?: Column[];
  title?: string;
  loading?: boolean;
  downloadUrl?: string;
  printable?: boolean;
  tableId?: string;
  workspaceId?: string;
  highlightedCells?: HighlightedCell[];
  onCellSelect?: (rowId: string, colId: string, value: string | number | null) => void;
  showDataTypes?: boolean;
  cellBorderWidth?: number;
}

// Local helper function to process table cell values
function processTableCellValue(value: string | number | null): {
  displayValue: string;
  numericValue: number | null;
  isLimitValue: boolean;
} {
  if (value === null || value === undefined) {
    return { displayValue: '', numericValue: null, isLimitValue: false };
  }
  
  const stringValue = String(value).trim();
  
  // Check for limit values like "<0.001", ">1000" etc.
  const limitMatch = stringValue.match(/^(<|>|<=|>=)\s*(\d+(?:\.\d+)?)/);
  if (limitMatch) {
    const numericPart = parseFloat(limitMatch[2]);
    return {
      displayValue: stringValue,
      numericValue: numericPart,
      isLimitValue: true
    };
  }
  
  // Try to parse as number
  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue)) {
    return {
      displayValue: stringValue,
      numericValue: numericValue,
      isLimitValue: false
    };
  }
  
  // Return as string
  return {
    displayValue: stringValue,
    numericValue: null,
    isLimitValue: false
  };
}

export default function DataTable({ 
  data: initialData, 
  columns: initialColumns, 
  title: initialTitle, 
  loading: initialLoading = false,
  downloadUrl,
  printable = false,
  tableId,
  workspaceId,
  highlightedCells = [],
  onCellSelect,
  showDataTypes = true,
  cellBorderWidth = 2
}: DataTableProps) {
  const [data, setData] = useState<DataRow[]>(initialData || []);
  const [columns, setColumns] = useState<Column[]>(initialColumns || []);
  const [title, setTitle] = useState(initialTitle || 'Tablo');
  const [loading, setLoading] = useState(initialLoading || false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCell, setSelectedCell] = useState<{row: string, col: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [calculatedHighlights, setCalculatedHighlights] = useState<HighlightedCell[]>([]);
  const [dataStats, setDataStats] = useState<{
    totalCells: number;
    numericCells: number;
    limitValues: number;
    emptyValues: number;
  }>({ totalCells: 0, numericCells: 0, limitValues: 0, emptyValues: 0 });
  const tableRef = useRef<HTMLDivElement>(null);

  // Calculate data statistics
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      let totalCells = 0;
      let numericCells = 0;
      let limitValues = 0;
      let emptyValues = 0;

      data.forEach(row => {
        columns.forEach(col => {
          totalCells++;
          const value = row[col.id];
          const processed = processTableCellValue(value);
          
          if (processed.isLimitValue) {
            limitValues++;
          } else if (processed.numericValue !== null) {
            numericCells++;
          } else if (!processed.displayValue) {
            emptyValues++;
          }
        });
      });

      setDataStats({ totalCells, numericCells, limitValues, emptyValues });
    }
  }, [data, columns]);

  // Fetch table data if tableId and workspaceId are provided
  useEffect(() => {
    if (tableId && workspaceId && !initialData) {
      setLoading(true);
      setError(null);
      
      // Fetch table data
      fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Tablo verileri yüklenemedi');
          }
          return response.json();
        })
        .then(responseData => {
          if (responseData && responseData.data) {
            // Map the raw data to DataRow format
            const rowData: DataRow[] = Array.isArray(responseData.data.data) 
              ? responseData.data.data.map((row: Array<string | number | null>, rowIndex: number) => {
                  const dataObj: DataRow = { id: `row-${rowIndex}` };
                  
                  // Map columns to data values
                  if (Array.isArray(responseData.data.columns)) {
                    responseData.data.columns.forEach((colName: string, colIndex: number) => {
                      if (colName && typeof colName === 'string') {
                        dataObj[colName] = row[colIndex];
                      }
                    });
                  }
                  
                  return dataObj;
                })
              : [];
            
            // Map columns to Column format
            const columnData: Column[] = Array.isArray(responseData.data.columns)
              ? responseData.data.columns.map((colName: string) => ({
                  id: colName,
                  name: colName,
                  type: typeof rowData[0]?.[colName] === 'number' ? 'number' : 'string'
                }))
              : [];
            
            setData(rowData);
            setColumns(columnData);
            setTitle(responseData.data.name || 'Tablo');
          } else {
            throw new Error('Geçersiz veri formatı');
          }
        })
        .catch(err => {
          console.error('Tablo verisi yükleme hatası:', err);
          setError(err.message || 'Tablo verileri yüklenemedi');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (initialData && initialColumns) {
      setData(initialData);
      setColumns(initialColumns);
      if (initialTitle) setTitle(initialTitle);
    } else if (!tableId && workspaceId) {
      setError('Lütfen bir tablo seçin');
      setLoading(false);
    }
  }, [tableId, workspaceId, initialData, initialColumns, initialTitle]);

  // Fetch formulas when tableId changes
  useEffect(() => {
    if (tableId && workspaceId) {
      fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/formulas`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Formüller yüklenemedi');
          }
          return response.json();
        })
        .then(formulasData => {
          setFormulas(formulasData);
        })
        .catch(err => {
          console.error('Formüller yüklenirken hata:', err);
        });
    }
  }, [tableId, workspaceId]);

  // Evaluate formulas whenever data or formulas change
  useEffect(() => {
    console.log('🔄 DataTable: Formulas or data changed, re-evaluating...');
    console.log('📊 Current data:', data.length, 'rows');
    console.log('📝 Current formulas:', formulas.length, 'formulas');
    console.log('📋 Current columns:', columns.map(col => col.id));
    
    if (data.length > 0 && columns.length > 0 && formulas.length > 0) {
      // Only evaluate active formulas
      const activeFormulas = formulas.filter(f => f.active !== false);
      console.log('✅ Active formulas:', activeFormulas.length);
      
      if (activeFormulas.length > 0) {
        try {
          console.log('🚀 Starting formula evaluation...');
          const highlights = evaluateFormulasWithDataRows(
            activeFormulas.map(f => ({
              ...f,
              active: f.active ?? true // undefined'ı true'ya çevir
            })),
            data,
            columns.map(col => col.id)
          );
          console.log('✨ Formula evaluation completed, highlights:', highlights.length);
          setCalculatedHighlights(highlights);
          
          // Show user feedback with more detailed information
          if (highlights.length === 0) {
            console.log('ℹ️ No cells matched the formula criteria');
            setError(`ℹ️ ${activeFormulas.length} formül(ler)i uygulandı ancak hiçbir hücre belirtilen kriterleri karşılamadı. Bu normal bir durumdur.`);
            // Clear error message after 5 seconds
            setTimeout(() => setError(null), 5000);
          } else {
            console.log(`🎯 ${highlights.length} cells highlighted by formulas`);
            setError(`✅ ${highlights.length} hücre ${activeFormulas.length} formül tarafından vurgulandı.`);
            // Clear success message after 3 seconds
            setTimeout(() => setError(null), 3000);
          }
        } catch (err) {
          console.error('❌ Formula evaluation error:', err);
          setCalculatedHighlights([]);
          setError(`❌ Formül değerlendirme hatası: ${(err as Error).message}`);
        }
      } else {
        console.log('⚠️ No active formulas found');
        setCalculatedHighlights([]);
        setError('⚠️ Aktif formül bulunamadı. Formülleri kontrol edin.');
        setTimeout(() => setError(null), 3000);
      }
    } else {
      console.log('⚠️ Missing data, columns, or formulas for evaluation');
      setCalculatedHighlights([]);
      
      // Provide specific feedback about what's missing
      if (data.length === 0) {
        setError('⚠️ Tablo verisi yüklenmedi.');
      } else if (columns.length === 0) {
        setError('⚠️ Tablo sütunları yüklenmedi.');
      } else if (formulas.length === 0) {
        setError('ℹ️ Bu tablo için tanımlanmış formül bulunmuyor.');
      }
    }
  }, [data, columns, formulas]);
  
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  const sortedData = Array.isArray(data) 
    ? [...data].sort((a, b) => {
        if (!sortColumn) return 0;
        
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        
        // Use enhanced value processing for sorting
        const processedA = processTableCellValue(aValue);
        const processedB = processTableCellValue(bValue);
        
        // Sort by numeric values when available
        if (processedA.numericValue !== null && processedB.numericValue !== null) {
          return sortDirection === 'asc' 
            ? processedA.numericValue - processedB.numericValue 
            : processedB.numericValue - processedA.numericValue;
        }
        
        // Fallback to string comparison
        const aString = processedA.displayValue.toLowerCase();
        const bString = processedB.displayValue.toLowerCase();
        
        return sortDirection === 'asc' 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      })
    : [];
  
  const filteredData = searchTerm && Array.isArray(sortedData)
    ? sortedData.filter(row => 
        Object.entries(row).some(([key, value]) => {
          if (key === 'id') return false;
          const processed = processTableCellValue(value);
          return processed.displayValue.toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : sortedData;
    
  const handleCellClick = (rowId: string, colId: string, value: string | number | null) => {
    setSelectedCell({ row: rowId, col: colId });
    if (onCellSelect) {
      onCellSelect(rowId, colId, value);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Combine provided highlightedCells with calculated ones
  const allHighlights = [...(highlightedCells || []), ...calculatedHighlights];
  
  if (error && !error.startsWith('✅') && !error.startsWith('ℹ️')) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={tableRef}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 p-4' : ''}`}
    >
      {/* Enhanced table header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {/* Data statistics */}
            <div className="flex space-x-4 text-xs text-gray-600 mt-1">
              <span>📊 Toplam: {dataStats.totalCells} hücre</span>
              <span>🔢 Sayısal: {dataStats.numericCells}</span>
              <span>📉 Limit: {dataStats.limitValues}</span>
              <span>⬜ Boş: {dataStats.emptyValues}</span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {/* Search and controls row */}
            <div className="flex space-x-2 items-center">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <AiOutlineSearch className="absolute left-2 top-2.5 text-gray-500" size={18} />
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-1">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="İndir"
                  >
                    <FcDownload size={20} />
                  </a>
                )}
                
                {printable && (
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Yazdır"
                  >
                    <FcPrint size={20} />
                  </button>
                )}
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={isFullscreen ? "Küçült" : "Büyüt"}
                >
                  {isFullscreen ? <FcCollapse size={20} /> : <FcExpand size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status message */}
      {error && (
        <div className={`p-3 border-b ${
          error.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-200' :
          error.startsWith('ℹ️') ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id)}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
                    style={{ 
                      border: `${cellBorderWidth}px solid #1e40af`,
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }}
                  >
                    <div className="flex items-center">
                      <span>{column.name}</span>
                      {sortColumn === column.id && (
                        <span className="ml-1 text-yellow-300">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.map((row, rowIndex) => (
                <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {columns.map((column) => (
                    <EnhancedTableCell
                      key={`${row.id}-${column.id}`}
                      rowId={row.id}
                      colId={column.id}
                      value={row[column.id]}
                      highlights={allHighlights}
                      onClick={handleCellClick}
                      isSelected={selectedCell?.row === row.id && selectedCell?.col === column.id}
                      showDataTypes={showDataTypes}
                      cellBorderWidth={cellBorderWidth}
                    />
                  ))}
                </tr>
              ))}
              
              {filteredData.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {searchTerm ? 'Arama sonucu bulunamadı.' : 'Veri bulunamadı.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 