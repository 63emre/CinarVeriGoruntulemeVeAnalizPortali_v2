'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FcLineChart, FcCalendar, FcInfo } from 'react-icons/fc';

interface Workspace {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
}

interface AnalysisData {
  variables: string[];
  dateColumns: string[];
  tableData: {
    columns: string[];
    data: (string | number | null)[][];
    name: string;
  };
}

export default function AnalysisContent() {
  const router = useRouter();
  const [selectedVariable, setSelectedVariable] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartColor, setChartColor] = useState('#3b82f6'); // Default blue color
  
  // Add workspace and table selection states
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch workspaces on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        setError(null);
        
        const response = await fetch('/api/workspaces');
        
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setWorkspaces(data);
        } else {
          throw new Error('Beklenmeyen API yanıt formatı');
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError((err as Error).message);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    
    fetchWorkspaces();
  }, []);
  
  // Fetch tables when workspace selection changes
  useEffect(() => {
    if (!selectedWorkspace) {
      setTables([]);
      return;
    }
    
    const fetchTables = async () => {
      try {
        setLoadingTables(true);
        setError(null);
        
        const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables`);
        
        if (!response.ok) {
          throw new Error('Tablolar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTables(data);
        } else {
          throw new Error('Beklenmeyen API yanıt formatı');
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError((err as Error).message);
      } finally {
        setLoadingTables(false);
      }
    };
    
    fetchTables();
  }, [selectedWorkspace]);

  // Fetch analysis data when table is selected
  useEffect(() => {
    if (!selectedWorkspace || !selectedTable) {
      setAnalysisData(null);
      return;
    }
    
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables/${selectedTable}`);
        
        if (!response.ok) {
          throw new Error('Tablo verileri yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        // Extract variables from the table data
        const variableColumnIndex = data.columns.findIndex((col: string) => col === 'Variable');
        let variables: string[] = [];
        
        if (variableColumnIndex !== -1) {
          const uniqueVars = new Set<string>();
          data.data.forEach((row: (string | number | null)[]) => {
            const varValue = row[variableColumnIndex];
            if (varValue && typeof varValue === 'string' && varValue.trim() !== '') {
              uniqueVars.add(varValue);
            }
          });
          variables = Array.from(uniqueVars);
        }
        
        // Identify date columns
        const standardColumns = ['id', 'Variable', 'Data Source', 'Method', 'Unit', 'LOQ'];
        const dateColumns = data.columns.filter(
          (col: string) => !standardColumns.includes(col)
        );
        
        setAnalysisData({
          variables,
          dateColumns,
          tableData: data
        });
        
        // Set default selections
        if (variables.length > 0 && !selectedVariable) {
          setSelectedVariable(variables[0]);
        }
        if (dateColumns.length > 0) {
          if (!startDate) setStartDate(dateColumns[0]);
          if (!endDate) setEndDate(dateColumns[dateColumns.length - 1]);
        }
        
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [selectedWorkspace, selectedTable]);
  
  // Handle workspace change
  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workspaceId = e.target.value;
    setSelectedWorkspace(workspaceId);
    setSelectedTable(''); // Reset table selection when workspace changes
    setAnalysisData(null); // Reset analysis data
    setSelectedVariable('');
    setStartDate('');
    setEndDate('');
  };
  
  // Handle table change
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tableId = e.target.value;
    setSelectedTable(tableId);
    setSelectedVariable('');
    setStartDate('');
    setEndDate('');
  };

  // Validate date selection
  const isDateSelectionValid = () => {
    if (!startDate || !endDate || !analysisData?.dateColumns) return false;
    
    const startIndex = analysisData.dateColumns.indexOf(startDate);
    const endIndex = analysisData.dateColumns.indexOf(endDate);
    
    return startIndex <= endIndex;
  };

  // Handle view analysis - navigate to detailed analysis page
  const handleViewAnalysis = () => {
    if (selectedWorkspace && selectedTable) {
      router.push(`/dashboard/workspaces/${selectedWorkspace}/analysis?tableId=${selectedTable}`);
    }
  };

  // Get table data for display
  const getTableDataForDisplay = () => {
    if (!analysisData?.tableData || !selectedVariable) return [];
    
    const { columns, data } = analysisData.tableData;
    const variableColumnIndex = columns.findIndex((col: string) => col === 'Variable');
    
    if (variableColumnIndex === -1) return [];
    
    // Filter rows for selected variable
    const variableRows = data.filter((row: (string | number | null)[]) => 
      row[variableColumnIndex] === selectedVariable
    );
    
    if (variableRows.length === 0) return [];
    
    // Get date range
    const dateColumns = analysisData.dateColumns;
    let startIndex = 0;
    let endIndex = dateColumns.length - 1;
    
    if (startDate && endDate) {
      startIndex = dateColumns.indexOf(startDate);
      endIndex = dateColumns.indexOf(endDate);
      
      if (startIndex === -1) startIndex = 0;
      if (endIndex === -1) endIndex = dateColumns.length - 1;
    }
    
    // Create display data
    const displayData = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const dateColumn = dateColumns[i];
      const colIndex = columns.indexOf(dateColumn);
      const value = variableRows[0][colIndex];
      
      displayData.push({
        date: dateColumn,
        value: value,
        unit: 'µS/cm', // This should be extracted from table data
        status: typeof value === 'number' && value > 0 ? 'Normal' : 'Veri Yok'
      });
    }
    
    return displayData;
  };
  
  return (
    <div className="container mx-auto p-6">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FcLineChart className="mr-2 h-6 w-6" />
          Trend Analizi
        </h1>
        
        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FcInfo className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Analize başlamak için lütfen bir çalışma alanı ve tablo seçin.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çalışma Alanı Seçimi
              </label>
              <select
                value={selectedWorkspace}
                onChange={handleWorkspaceChange}
                disabled={loadingWorkspaces}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Çalışma alanı seçin</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tablo Seçimi
              </label>
              <select
                value={selectedTable}
                onChange={handleTableChange}
                disabled={!selectedWorkspace || loadingTables}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Tablo seçin</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleViewAnalysis}
              disabled={!selectedWorkspace || !selectedTable}
              className={`px-4 py-2 rounded-md flex items-center ${
                !selectedWorkspace || !selectedTable
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Detaylı Analiz Yap
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Değişken Seçimi
            </label>
            <select 
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              disabled={!analysisData?.variables.length}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Değişken seçin</option>
              {analysisData?.variables.map((variable) => (
                <option key={variable} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FcCalendar className="inline mr-1" /> Başlangıç Tarihi
            </label>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!analysisData?.dateColumns.length}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Tarih seçin</option>
              {analysisData?.dateColumns.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FcCalendar className="inline mr-1" /> Bitiş Tarihi
            </label>
            <select
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!analysisData?.dateColumns.length}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Tarih seçin</option>
              {analysisData?.dateColumns.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
            {startDate && endDate && !isDateSelectionValid() && (
              <p className="text-red-500 text-xs mt-1">
                Bitiş tarihi başlangıç tarihinden sonra olmalıdır
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grafik Rengi
            </label>
            <input 
              type="color" 
              value={chartColor}
              onChange={(e) => setChartColor(e.target.value)}
              disabled={!selectedTable}
              className="h-10 w-full border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 rounded-md p-10 flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          ) : !selectedWorkspace || !selectedTable ? (
            <p className="text-gray-500">
              Lütfen önce çalışma alanı ve tablo seçimi yapın
            </p>
          ) : !analysisData ? (
            <p className="text-gray-500">Veri yükleniyor...</p>
          ) : selectedVariable && startDate && endDate && isDateSelectionValid() ? (
            <div className="text-center">
              <p className="text-xl mb-4">
                {selectedVariable} Trend Grafiği
              </p>
              <p className="text-gray-600">
                {startDate} - {endDate} dönemi için analiz
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Detaylı grafik için &quot;Detaylı Analiz Yap&quot; butonunu kullanın
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              Grafik görüntülemek için lütfen tüm parametreleri seçin
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Veri Önizleme</h2>
          <button
            disabled={!selectedWorkspace || !selectedTable || !selectedVariable}
            className={`flex items-center ${
              !selectedWorkspace || !selectedTable || !selectedVariable
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } font-medium py-2 px-4 rounded-md transition`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            PDF İndir
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birim</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const tableData = getTableDataForDisplay();
                
                if (!selectedWorkspace || !selectedTable) {
                  return (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Veri görmek için çalışma alanı ve tablo seçimi yapın
                      </td>
                    </tr>
                  );
                }
                
                if (!selectedVariable) {
                  return (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Veri görmek için değişken seçimi yapın
                      </td>
                    </tr>
                  );
                }
                
                if (tableData.length === 0) {
                  return (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Seçilen kriterlere uygun veri bulunamadı
                      </td>
                    </tr>
                  );
                }
                
                return tableData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.value !== null && row.value !== undefined ? row.value : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.unit}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      row.status === 'Normal' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {row.status}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 