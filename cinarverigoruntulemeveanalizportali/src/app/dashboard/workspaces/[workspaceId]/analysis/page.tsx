'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FcBarChart, FcBullish, FcCalendar, FcAreaChart, FcRules, FcDataSheet, FcFolder } from 'react-icons/fc';
import FormulaManagementPage from '@/components/formulas/FormulaManagementPage';
import Link from 'next/link';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AnalysisData {
  labels: string[];
  values: number[];
}

export default function AnalysisPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId');
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showScopeSelector, setShowScopeSelector] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'table' | 'workspace'>('table');
  const [selectedTableForFormula, setSelectedTableForFormula] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/tables`);
        if (response.ok) {
          const data = await response.json();
          setTables(data);
          console.log(`📊 Loaded ${data.length} tables for analysis page`);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (workspaceId) {
      fetchTables();
    }
  }, [workspaceId]);
  
  const handleAddFormula = () => {
    setShowScopeSelector(true);
  };
  
  const handleScopeSelection = (scope: 'table' | 'workspace', tableId?: string) => {
    setSelectedScope(scope);
    setSelectedTableForFormula(tableId || '');
    setShowScopeSelector(false);
    setShowFormulaModal(true);
  };
  
  const handleCloseModals = () => {
    setShowFormulaModal(false);
    setShowScopeSelector(false);
    setSelectedScope('table');
    setSelectedTableForFormula('');
  };
  
  // Fetch table data and extract variables
  useEffect(() => {
    if (!tableId || !workspaceId) {
      setError('Tablo ID veya çalışma alanı ID eksik');
      return;
    }

    async function fetchTableData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/analysis`);
        
        if (!response.ok) {
          throw new Error('Tablo verileri yüklenirken hata oluştu');
        }
        
        const data = await response.json();
        
        setVariables(data.variables || []);
        setDateColumns(data.dateColumns || []);
        
        // Set default dates if available
        if (data.dateColumns && data.dateColumns.length > 0) {
          setStartDate(data.dateColumns[0]);
          setEndDate(data.dateColumns[data.dateColumns.length - 1]);
        }
        
      } catch (err) {
        console.error('Error fetching table data:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchTableData();
  }, [tableId, workspaceId]);
  
  // Generate analysis data when parameters change
  useEffect(() => {
    if (!tableId || !workspaceId || !selectedVariable || !startDate || !endDate) {
      return;
    }
    
    // Validate date order
    const startIndex = dateColumns.indexOf(startDate);
    const endIndex = dateColumns.indexOf(endDate);
    
    if (startIndex > endIndex) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }
    
    async function generateAnalysis() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
        
        if (!response.ok) {
          throw new Error('Tablo verileri yüklenirken hata oluştu');
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.columns) || !Array.isArray(data.data)) {
          throw new Error('Geçersiz tablo verisi');
        }
        
        // Get column indices
        const columns = data.columns;
        const variableColumnIndex = columns.findIndex((col: string) => col === 'Variable');
        
        // Determine the date columns to include
        const startIndex = columns.indexOf(startDate);
        const endIndex = columns.indexOf(endDate);
        
        if (variableColumnIndex === -1 || startIndex === -1 || endIndex === -1) {
          throw new Error('Gerekli sütunlar bulunamadı');
        }
        
        // Get the range of date columns
        const dateRange = columns.slice(
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex) + 1
        );
        
        // Filter data rows for the selected variable
        const variableRows = data.data.filter((row: (string | number | null)[]) => 
          row[variableColumnIndex] === selectedVariable
        );
        
        if (variableRows.length === 0) {
          throw new Error('Seçilen değişken için veri bulunamadı');
        }
        
        // Extract values for the selected variable across date range
        const values = dateRange.map((dateCol: string) => {
          const dateColIndex = columns.indexOf(dateCol);
          // Get the first row's value for this date
          const row = variableRows[0];
          const value = row[dateColIndex];
          
          // Convert to number or return 0 if invalid
          if (typeof value === 'number') {
            return value;
          }
          
          if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            return parseFloat(value);
          }
          
          return 0;
        });
        
        setAnalysisData({
          labels: dateRange,
          values
        });
        
      } catch (err) {
        console.error('Analysis generation error:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    generateAnalysis();
  }, [workspaceId, tableId, selectedVariable, startDate, endDate, dateColumns]);
  
  // Chart configuration
  const chartData = {
    labels: analysisData?.labels || [],
    datasets: [
      {
        label: selectedVariable,
        data: analysisData?.values || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#000000',  // Black for better contrast
          font: {
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: true,
        text: `${selectedVariable} Trend Analizi`,
        color: '#000000',  // Black for better contrast
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#000000'  // Black for better contrast
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'  // Darker grid lines
        }
      },
      x: {
        ticks: {
          color: '#000000'  // Black for better contrast
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'  // Darker grid lines
        }
      }
    },
  };
  
  if (!tableId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FcBarChart className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Analiz yapmak için bir tablo seçmelisiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcAreaChart className="mr-3 w-8 h-8" />
          Analiz Paneli
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddFormula}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FcRules className="mr-2 h-5 w-5" />
            Formül Ekle
          </button>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FcRules className="mr-2 h-5 w-5" />
            Formül Yönetimi
          </button>
        </div>
      </div>

      {/* Table Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Analiz Edilecek Tablo Seçin</h2>
        {tables.length === 0 ? (
          <div className="text-center py-8">
            <FcDataSheet className="mx-auto text-4xl mb-2 opacity-50" />
            <p className="text-gray-500">Bu çalışma alanında henüz tablo bulunmamaktadır.</p>
            <Link 
              href={`/dashboard/workspaces/${workspaceId}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Excel Dosyası Yükle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTable === table.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTable(table.id)}
              >
                <div className="flex items-center mb-2">
                  <FcDataSheet className="mr-2 h-5 w-5" />
                  <h3 className="font-medium text-gray-800">{table.name}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {Array.isArray(table.data) ? table.data.length : 0} satır
                </p>
                <p className="text-sm text-gray-600">
                  {Array.isArray(table.columns) ? table.columns.length : 0} sütun
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {selectedTable && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Analiz Sonuçları</h2>
          <div className="text-center py-8 text-gray-500">
            Seçili tablo için analiz sonuçları burada görünecek.
          </div>
        </div>
      )}

      {/* ENHANCED: Formula Scope Selection Modal */}
      {showScopeSelector && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <FcRules className="mr-2" />
                Formül Kapsamı Seçimi
              </h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Formülünüzün hangi kapsamda uygulanacağını seçin:
              </p>
              
              <div className="space-y-4">
                {/* Table Scope Option */}
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <FcDataSheet className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800">Belirli Tablo Kapsamı</h3>
                  </div>
                  <p className="text-blue-700 mb-4">
                    Formülü sadece seçtiğiniz tabloya uygular. Tek yönlü formüller önerilir.
                  </p>
                  
                  {tables.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-blue-700">
                        Hedef Tablo Seçin:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleScopeSelection('table', table.id)}
                            className="text-left p-3 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <div className="font-medium text-blue-800">{table.name}</div>
                            <div className="text-sm text-blue-600">
                              {Array.isArray(table.data) ? table.data.length : 0} satır
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-blue-600 italic">Henüz tablo bulunmamaktadır.</div>
                  )}
                </div>
                
                {/* Workspace Scope Option */}
                <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <FcFolder className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Workspace Kapsamı</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    Formülü çalışma alanındaki tüm tablolara uygular. Karmaşık koşullar kullanabilirsiniz.
                  </p>
                  <button
                    onClick={() => handleScopeSelection('workspace')}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Workspace Kapsamını Seç
                  </button>
                </div>
              </div>
              
              {/* Information Box */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Kapsam Seçimi Rehberi:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>Tablo Kapsamı:</strong> Hücre düzeyinde validasyon için idealdir</li>
                  <li><strong>Workspace Kapsamı:</strong> Genel kurallar ve karşılaştırmalar için</li>
                  <li><strong>Örnek:</strong> &quot;[İletkenlik] &gt; 300&quot; → Tablo kapsamı</li>
                  <li><strong>Örnek:</strong> &quot;[pH] &gt; 7 AND [İletkenlik] &lt; 500&quot; → Workspace kapsamı</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Management Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <FcRules className="mr-2" />
                Formül Yönetimi
                {selectedScope === 'table' && selectedTableForFormula && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Tablo: {tables.find(t => t.id === selectedTableForFormula)?.name}
                  </span>
                )}
                {selectedScope === 'workspace' && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Workspace Kapsamı
                  </span>
                )}
              </h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <FormulaManagementPage workspaceId={workspaceId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 