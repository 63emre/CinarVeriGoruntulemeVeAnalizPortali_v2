'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FcBarChart, FcBullish, FcCalendar, FcAreaChart, FcRules } from 'react-icons/fc';
import FormulaManagementPage from '@/components/formulas/FormulaManagementPage';

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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-black flex items-center">
            <FcAreaChart className="mr-3 h-8 w-8" />
            Veri Analizi
          </h1>
          
          {/* Formula Management Button */}
          <button
            onClick={() => setShowFormulaModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition-colors"
          >
            <FcRules className="mr-2" />
            Formül Yönetimi
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Değişken Seçin
            </label>
            <select
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || variables.length === 0}
            >
              {variables.length === 0 ? (
                <option value="">Değişken bulunamadı</option>
              ) : (
                variables.map(variable => (
                  <option key={variable} value={variable}>
                    {variable}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Başlangıç Tarihi
            </label>
            <div className="relative">
              <FcCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || dateColumns.length === 0}
              >
                {dateColumns.length === 0 ? (
                  <option value="">Tarih sütunu bulunamadı</option>
                ) : (
                  dateColumns.map(date => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Bitiş Tarihi
            </label>
            <div className="relative">
              <FcCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || dateColumns.length === 0}
              >
                {dateColumns.length === 0 ? (
                  <option value="">Tarih sütunu bulunamadı</option>
                ) : (
                  dateColumns.map(date => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-lg border border-gray-300">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : analysisData && analysisData.labels.length > 0 ? (
            <div className="h-96 p-4">
              <Line options={chartOptions} data={chartData} />
            </div>
          ) : (
            <div className="text-center py-24 text-gray-800">
              <FcBullish className="h-16 w-16 mx-auto mb-4" />
              <p className="font-medium">Analiz için değişken ve tarih aralığı seçin</p>
              <p className="text-sm mt-2">Seçimleriniz değiştikçe grafik otomatik olarak güncellenecektir</p>
            </div>
          )}
        </div>
        
        {analysisData && (
          <div className="mt-6 text-right">
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  
                  if (!selectedVariable || !startDate || !endDate) {
                    throw new Error('Lütfen tüm parametreleri seçin');
                  }
                  
                  const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/analysis-pdf`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      variable: selectedVariable,
                      startDate,
                      endDate,
                      analysisData
                    }),
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `PDF oluşturulamadı (${response.status})`);
                  }
                  
                  // Check if response is actually a PDF
                  const contentType = response.headers.get('content-type');
                  if (!contentType || !contentType.includes('application/pdf')) {
                    throw new Error('Sunucudan geçersiz dosya formatı alındı');
                  }
                  
                  const blob = await response.blob();
                  
                  // Verify blob size
                  if (blob.size === 0) {
                    throw new Error('Boş PDF dosyası oluşturuldu');
                  }
                  
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedVariable}_analiz_${startDate}-${endDate}.pdf`;
                  a.style.display = 'none';
                  document.body.appendChild(a);
                  a.click();
                  
                  // Cleanup
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  
                  console.log('✅ PDF başarıyla indirildi');
                  
                  // Show success message
                  setError('✅ PDF başarıyla indirildi!');
                  setTimeout(() => setError(null), 3000);
                  
                } catch (err) {
                  console.error('PDF indirme hatası:', err);
                  setError('PDF indirilemedi: ' + (err as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !selectedVariable || !startDate || !endDate}
              className={`px-4 py-2 rounded-md transition ${
                loading || !selectedVariable || !startDate || !endDate
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İndiriliyor...
                </div>
              ) : (
                'Analizi PDF Olarak İndir'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Formula Management Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <FcRules className="mr-2" />
                Formül Yönetimi
              </h2>
              <button
                onClick={() => setShowFormulaModal(false)}
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