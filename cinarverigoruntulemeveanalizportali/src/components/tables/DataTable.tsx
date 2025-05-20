'use client';

import { useState, useEffect, useRef } from 'react';
import { FcDownload, FcPrint, FcFullTrash, FcExpand, FcCollapse } from 'react-icons/fc';
import { AiOutlineFilter, AiOutlineSearch } from 'react-icons/ai';

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
              ? responseData.data.data.map((row: any[], index: number) => {
                  const dataObj: DataRow = { id: `row-${index}` };
                  
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
              ? responseData.data.columns.map((colName: string, index: number) => ({
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

  // Check if a cell has a highlight
  const getCellHighlight = (rowId: string, colId: string) => {
    return highlightedCells.find(cell => cell.row === rowId && cell.col === colId);
  };
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`bg-white rounded-lg shadow overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'max-w-full'}`}
      ref={tableRef}
    >
      <div className="p-4 flex flex-wrap justify-between items-center border-b bg-gray-50">
        <h2 className="text-xl font-bold text-black mb-2 md:mb-0">{title}</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara..."
              className="pl-9 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-md flex items-center transition"
            >
              <FcDownload className="mr-2 h-5 w-5" />
              İndir
            </a>
          )}
          
          {printable && (
            <button
              onClick={handlePrint}
              className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-md flex items-center transition"
            >
              <FcPrint className="mr-2 h-5 w-5" />
              Yazdır
            </button>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 rounded-md flex items-center transition"
          >
            {isFullscreen ? (
              <>
                <FcCollapse className="mr-2 h-5 w-5" />
                Küçült
              </>
            ) : (
              <>
                <FcExpand className="mr-2 h-5 w-5" />
                Tam Ekran
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[70vh]'}`}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-medium">
            {searchTerm 
              ? 'Arama kriterlerine uygun sonuç bulunamadı.' 
              : 'Gösterilecek veri bulunmuyor.'}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 border-collapse table-auto">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-b border-gray-300 sticky whitespace-nowrap"
                      onClick={() => handleSort(column.id)}
                    >
                      <div className="flex items-center">
                        {column.name}
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
                  <tr key={row.id} className="hover:bg-gray-50">
                    {columns.map((column) => {
                      const cellValue = row[column.id];
                      const isSelected = selectedCell?.row === row.id && selectedCell?.col === column.id;
                      const highlight = getCellHighlight(row.id, column.id);
                      
                      // Dynamic styles based on highlight, selection, and column type
                      let cellStyles = "px-4 py-2 whitespace-nowrap font-medium border ";
                      
                      // Base text color - darker for better readability
                      cellStyles += column.id === 'Variable' ? "text-blue-900 font-semibold " : "text-gray-900 ";
                      
                      // Highlight or selection backgrounds
                      if (highlight) {
                        cellStyles += `bg-${highlight.color}-100 border-${highlight.color}-300 `;
                      } else if (isSelected) {
                        cellStyles += "bg-blue-100 border-blue-300 ";
                      } else {
                        cellStyles += "border-gray-200 ";
                      }
                      
                      // Special column styling
                      if (column.id === 'id') {
                        cellStyles += "bg-gray-50 text-gray-600 ";
                      } else if (['Data Source', 'Method', 'Unit', 'LOQ'].includes(column.id)) {
                        cellStyles += "bg-gray-50 ";
                      }
                      
                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          className={cellStyles}
                          onClick={() => handleCellClick(row.id, column.id, cellValue)}
                          title={highlight?.message}
                        >
                          {cellValue === null ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span>{String(cellValue)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-gray-900 text-sm border-t border-gray-200 flex justify-between">
        <div>
          {Array.isArray(filteredData) ? (
            <>
              <span className="font-medium">{filteredData.length}</span> satır gösteriliyor
              {searchTerm && Array.isArray(data) && ` (toplam ${data.length} satırdan)`}
            </>
          ) : (
            'Veri yok'
          )}
        </div>
        {isFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="text-red-600 hover:text-red-800 flex items-center"
          >
            <FcFullTrash className="mr-1" />
            Tam Ekrandan Çık
          </button>
        )}
      </div>
    </div>
  );
} 