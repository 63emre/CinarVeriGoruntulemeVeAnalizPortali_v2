'use client';

import { useState, useEffect, useRef } from 'react';
import { FcPrint, FcFullTrash, FcCheckmark, FcCancel } from 'react-icons/fc';
import { AiOutlineSearch, AiOutlineSave } from 'react-icons/ai';
import TableCell from './TableCell'; // ENHANCED: Import TableCell for pizza slice effect

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
  onDataChange?: (updatedData: DataRow[]) => void;
}

export default function EditableDataTable({ 
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
  onDataChange
}: EditableDataTableProps) {
  const [data, setData] = useState<DataRow[]>(initialData || []);
  const [originalData, setOriginalData] = useState<DataRow[]>(initialData || []);
  const [columns, setColumns] = useState<Column[]>(initialColumns || []);
  const [title, setTitle] = useState(initialTitle || 'Tablo');
  const [loading, setLoading] = useState(initialLoading || false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCell, setSelectedCell] = useState<{row: string, col: string} | null>(null);
  const [editingCell, setEditingCell] = useState<{row: string, col: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
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
            
            setColumns(columnDefs);
            setData(rowsWithIds);
            setOriginalData(JSON.parse(JSON.stringify(rowsWithIds)));
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
    } else if (!tableId && workspaceId) {
      setError('Lütfen bir tablo seçin');
      setLoading(false);
    }
  }, [tableId, workspaceId, initialData]);
  
  // Update data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setOriginalData(JSON.parse(JSON.stringify(initialData)));
      setHasChanges(false);
    }
  }, [initialData]);

  // Update columns when initialColumns changes
  useEffect(() => {
    if (initialColumns) {
      setColumns(initialColumns);
    }
  }, [initialColumns]);
  
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
  
  const handleCellDoubleClick = (rowId: string, colId: string, value: string | number | null, isEditable: boolean) => {
    if (!isEditable) return;
    
    setEditingCell({ row: rowId, col: colId });
    setEditValue(value !== null ? String(value) : '');
  };
  
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const handleEditSave = (rowId: string, colId: string) => {
    // Find the row in the data array
    const updatedData = data.map(row => {
      if (row.id === rowId) {
        // Parse number if the original value was a number
        const originalValue = row[colId];
        let newValue: string | number | null = editValue;
        
        if (typeof originalValue === 'number' && !isNaN(Number(editValue))) {
          newValue = Number(editValue);
        }
        
        return { ...row, [colId]: newValue };
      }
      return row;
    });
    
    setData(updatedData);
    setEditingCell(null);
    setEditValue('');
    setHasChanges(true);
    
    if (onDataChange) {
      onDataChange(updatedData);
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
      setSavingError('Tablo ID veya Workspace ID eksik');
      return;
    }
    
    setIsSaving(true);
    setSavingError(null);
    
    try {
      // Convert data back to the format expected by the API
      const apiData = {
        name: title,
        columns: columns.filter(col => col.id !== 'id').map(col => col.id),
        data: data.map(row => {
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
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setHasChanges(false);
      
    } catch (err) {
      console.error('Error saving table data:', err);
      setSavingError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Discard all changes and revert to original data
  const discardChanges = () => {
    setData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="p-4 flex justify-between items-center border-b bg-gray-50">
        <h2 className="text-xl font-bold text-black">{title}</h2>
        
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
        </div>
      </div>
      
      {savingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <p className="text-red-800 font-medium">{savingError}</p>
        </div>
      )}
      
      <div className={`overflow-x-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[80vh]'}`} ref={tableContainerRef}>
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
          <table className="w-full divide-y divide-gray-200 border-collapse table-fixed">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {columns.map((column) => {
                  // Determine column width based on type
                  let colWidth = "auto";
                  
                  // ID columns should be narrow
                  if (column.id === 'id') {
                    colWidth = "60px";
                  } 
                  // Fixed columns get appropriate width
                  else if (['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'].includes(column.id)) {
                    colWidth = "150px";
                  } 
                  // Date columns (all others) should be compact
                  else {
                    colWidth = "120px";
                  }
                  
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      style={{ width: colWidth }}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-b border-gray-300 sticky truncate"
                      onClick={() => handleSort(column.id)}
                      title={column.name}
                    >
                      <div className="flex items-center">
                        <span className="truncate">{column.name}</span>
                        {sortColumn === column.id && (
                          <span className="ml-1 flex-shrink-0">
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
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((column) => {
                    const cellValue = row[column.id];
                    const isSelected = selectedCell?.row === row.id && selectedCell?.col === column.id;
                    const isEditing = editingCell?.row === row.id && editingCell?.col === column.id;
                    const isEditable = column.editable !== false;
                    
                    // ENHANCED: Use TableCell component for better highlight support and pizza slice effect
                    if (isEditing) {
                      // Special case: show inline editing UI
                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          className="px-4 py-2 text-sm border border-gray-200"
                        >
                          <div className="flex items-center">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, row.id, column.id)}
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSave(row.id, column.id);
                              }}
                              className="ml-1 p-1 text-green-600"
                            >
                              <FcCheckmark className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCancel();
                              }}
                              className="ml-1 p-1 text-red-600"
                            >
                              <FcCancel className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      );
                    }
                    
                    // ENHANCED: Use TableCell component for all non-editing cells
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
                          // Handle double-click for editing
                          if (isEditable) {
                            // Simple click detection for edit mode with proper typing
                            const currentTime = Date.now();
                            const lastClickTime = (window as Window & { lastClickTime?: number }).lastClickTime || 0;
                            if (currentTime - lastClickTime < 300) {
                              // Double click detected
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
            </tbody>
          </table>
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