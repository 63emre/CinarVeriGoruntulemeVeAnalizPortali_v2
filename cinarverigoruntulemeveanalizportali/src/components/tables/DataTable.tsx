'use client';

import { useState, useEffect, useRef } from 'react';
import { FcDownload, FcPrint, FcExpand, FcCollapse } from 'react-icons/fc';
import { AiOutlineSearch } from 'react-icons/ai';
import TableCell from './TableCell';
import { evaluateFormulas } from '../../lib/formulaEvaluator';

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
  onCellSelect
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
  const tableRef = useRef<HTMLDivElement>(null);

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
    if (data.length > 0 && columns.length > 0 && formulas.length > 0) {
      // Only evaluate active formulas
      const activeFormulas = formulas.filter(f => f.active !== false);
      if (activeFormulas.length > 0) {
        try {
          const highlights = evaluateFormulas(
            activeFormulas,
            data,
            columns.map(col => col.id)
          );
          setCalculatedHighlights(highlights);
        } catch (err) {
          console.error('Formül değerlendirme hatası:', err);
        }
      } else {
        setCalculatedHighlights([]);
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
  
  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Combine provided highlightedCells with calculated ones
  const allHighlights = [...(highlightedCells || []), ...calculatedHighlights];
  
  if (error) {
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
      {/* Table header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <div className="flex space-x-2">
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
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-b">
          <p>{error}</p>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span>{column.name}</span>
                      {sortColumn === column.id && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id}-${column.id}`}
                      rowId={row.id}
                      colId={column.id}
                      value={row[column.id]}
                      highlights={allHighlights}
                      onClick={handleCellClick}
                      isSelected={selectedCell?.row === row.id && selectedCell?.col === column.id}
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