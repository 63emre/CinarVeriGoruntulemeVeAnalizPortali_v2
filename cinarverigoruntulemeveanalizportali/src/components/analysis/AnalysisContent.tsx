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

export default function AnalysisContent() {
  const router = useRouter();
  const [selectedVariable, setSelectedVariable] = useState('');
  const [startDate, setStartDate] = useState('');
  const [chartColor, setChartColor] = useState('#3b82f6'); // Default blue color
  
  // Add workspace and table selection states
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Handle workspace change
  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workspaceId = e.target.value;
    setSelectedWorkspace(workspaceId);
    setSelectedTable(''); // Reset table selection when workspace changes
  };
  
  // Handle table change
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tableId = e.target.value;
    setSelectedTable(tableId);
  };
    // Handle view analysis
  const handleViewAnalysis = () => {
    if (selectedWorkspace && selectedTable) {
      router.push(`/dashboard/workspaces/${selectedWorkspace}/tables/${selectedTable}`);
    }
  };
  
  // Connect to real data
  const [loading, setLoading] = useState(false);
  
  const fetchAnalysisData = async (workspaceId: string, tableId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/analysis`);
      
      if (!response.ok) {
        throw new Error('Analiz verileri yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // Process the data for analysis
      console.log("Analysis data received:", data);
      // You would set state variables for analysis data here
      
      return data;
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Use effect to load analysis data when workspace and table are selected from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tableIdFromURL = searchParams.get('tableId');
    const workspaceIdFromURL = window.location.pathname.split('/').find(
      segment => segment.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
    );
    
    if (workspaceIdFromURL && tableIdFromURL) {
      setSelectedWorkspace(workspaceIdFromURL);
      setSelectedTable(tableIdFromURL);
      
      // Load real analysis data
      fetchAnalysisData(workspaceIdFromURL, tableIdFromURL);
    }
  }, []);
  
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
              Analiz Yap
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6 opacity-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Değişken Seçimi
            </label>
            <select 
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              disabled={!selectedTable}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Değişken seçin</option>
              <option value="İletkenlik">İletkenlik</option>
              <option value="Orto Fosfat">Orto Fosfat</option>
              <option value="Toplam Fosfor">Toplam Fosfor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FcCalendar className="inline mr-1" /> Başlangıç Tarihi
            </label>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!selectedTable}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Tarih seçin</option>
              <option value="Nisan 22">Nisan 22</option>
              <option value="Haziran 22">Haziran 22</option>
              <option value="Eylül 22">Eylül 22</option>
            </select>
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
          {!selectedWorkspace || !selectedTable ? (
            <p className="text-gray-500">
              Lütfen önce çalışma alanı ve tablo seçimi yapın
            </p>
          ) : selectedVariable && startDate ? (
            <p className="text-xl">
              Grafik alanı: {selectedVariable} değerlerinin {startDate} tarihinden itibaren trendi
            </p>
          ) : (
            <p className="text-gray-500">
              Grafik görüntülemek için lütfen değişken ve başlangıç tarihi seçin
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-end mb-4">
          <button
            disabled={!selectedWorkspace || !selectedTable}
            className={`flex items-center ${
              !selectedWorkspace || !selectedTable
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
              {!selectedWorkspace || !selectedTable ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Veri görmek için çalışma alanı ve tablo seçimi yapın
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Eylül 22</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">348</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">µS/cm</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Normal</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Aralık 22</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">342</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">µS/cm</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Normal</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 