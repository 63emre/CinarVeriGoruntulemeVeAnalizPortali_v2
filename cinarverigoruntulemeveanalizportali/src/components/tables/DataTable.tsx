'use client';

import { useState, useEffect } from 'react';
import { 
  FcSearch, 
  FcViewDetails, 
  FcPrint
} from 'react-icons/fc';

type Column = {
  id: string;
  name: string;
  type: string;
};

type DataRow = {
  [key: string]: string | number | null;
  id: string;
};

interface DataTableProps {
  data?: DataRow[];
  columns?: Column[];
  title?: string;
  loading?: boolean;
  downloadUrl?: string;
  printable?: boolean;
  tableId?: string;
  workspaceId?: string;
}

export default function DataTable({ 
  data: initialData, 
  columns: initialColumns, 
  title: initialTitle, 
  loading: initialLoading = false,
  downloadUrl,
  printable = false,
  tableId,
  workspaceId
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

  // Fetch table data if tableId and workspaceId are provided
  useEffect(() => {
    if (tableId && workspaceId && !initialData) {
      const fetchTableData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
          if (!response.ok) {
            throw new Error('Tablo verileri yüklenemedi');
          }
          const tableData = await response.json();
          
          if (tableData && tableData.columns && tableData.data) {
            // Convert data structure to match component's expectations
            const columnDefs: Column[] = tableData.columns.map((col: string, index: number) => ({
              id: col,
              name: col,
              type: 'string'
            }));
            
            // Add ID column if not present
            columnDefs.unshift({
              id: 'id',
              name: '#',
              type: 'number'
            });
            
            // Add row IDs to data
            const rowsWithIds: DataRow[] = tableData.data.map((row: any[], index: number) => {
              const rowData: DataRow = { id: String(index + 1) };
              tableData.columns.forEach((col: string, colIndex: number) => {
                rowData[col] = row[colIndex];
              });
              return rowData;
            });
            
            setColumns(columnDefs);
            setData(rowsWithIds);
            setTitle(tableData.name || 'Tablo');
          } else {
            throw new Error('Tablo yapısı geçersiz');
          }
        } catch (err) {
          console.error('Error fetching table data:', err);
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTableData();
    }
  }, [tableId, workspaceId, initialData]);
  
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
    
  const handleCellClick = (rowId: string, colId: string) => {
    setSelectedCell({ row: rowId, col: colId });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Hata!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FcViewDetails className="mr-2" />
          {title}
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara..."
              className="pl-9 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
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
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {searchTerm 
              ? 'Arama kriterlerine uygun sonuç bulunamadı.' 
              : 'Gösterilecek veri bulunmuyor.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                    
                    return (
                      <td
                        key={`${row.id}-${column.id}`}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${isSelected ? 'bg-blue-100' : ''}`}
                        onClick={() => handleCellClick(row.id, column.id)}
                      >
                        {cellValue === null ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className="text-gray-800">{String(cellValue)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-gray-800 text-sm">
        {Array.isArray(filteredData) ? (
          <>
            {filteredData.length} satır gösteriliyor
            {searchTerm && Array.isArray(data) && ` (toplam ${data.length} satırdan)`}
          </>
        ) : (
          'Veri yok'
        )}
      </div>
    </div>
  );
} 