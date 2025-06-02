'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TrendAnalysisProps {
  tableId?: string;
  workspaceId: string;
  tables?: Array<{ id: string; name: string; sheetName: string }>;
  selectedTableId?: string;
  onTableSelect?: (tableId: string) => void;
}

interface TableData {
  id: string;
  name: string;
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

export default function TrendAnalysis({ 
  tableId, 
  workspaceId, 
  tables = [], 
  selectedTableId, 
  onTableSelect 
}: TrendAnalysisProps) {
  const [effectiveTableId, setEffectiveTableId] = useState<string | undefined>(tableId || selectedTableId);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [chartColor] = useState<string>('#3b82f6'); // Default blue color
  const chartRef = useRef<HTMLDivElement>(null);

  // Handle table selection
  const handleTableChange = (newTableId: string) => {
    setEffectiveTableId(newTableId);
    if (onTableSelect) {
      onTableSelect(newTableId);
    }
  };

  useEffect(() => {
    // Update effective table ID when props change
    setEffectiveTableId(tableId || selectedTableId);
  }, [tableId, selectedTableId]);

  useEffect(() => {
    async function fetchTableData() {
      if (!effectiveTableId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(''); // Clear previous errors
        const response = await fetch(`/api/workspaces/${workspaceId}/tables/${effectiveTableId}`);
        if (!response.ok) {
          throw new Error('Tablo verisi yüklenemedi');
        }

        const data = await response.json();
        setTableData(data);

        // Check if table has required structure
        if (!data.columns || !Array.isArray(data.columns) || data.columns.length === 0) {
          setError('Tablo yapısı uygun değil. Lütfen uygun formatta bir tablo seçin.');
          return;
        }

        // Extract variables (from the "Variable" column)
        const variableColumnIndex = data.columns.findIndex(
          (col: string) => col.toLowerCase() === 'variable'
        );

        if (variableColumnIndex === -1) {
          setError('Bu tablo analiz için uygun değil. "Variable" sütunu bulunamadı.');
          setVariables([]);
          setSelectedVariable('');
          return;
        }

        const uniqueVariables = Array.from(
          new Set(
            data.data
              .map((row: (string | number | null)[]) => row[variableColumnIndex])
              .filter((val: string | number | null) => val !== null && val !== '')
          )
        ) as string[];

        if (uniqueVariables.length === 0) {
          setError('Tabloda analiz edilecek değişken bulunamadı.');
          return;
        }

        setVariables(uniqueVariables);
        if (uniqueVariables.length > 0) {
          setSelectedVariable(uniqueVariables[0]);
        }

        // Extract date columns (all columns except standard ones)
        const standardColumns = ['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'];
        const dates = data.columns.filter((col: string) => !standardColumns.includes(col));
        
        if (dates.length === 0) {
          setError('Tabloda tarih sütunu bulunamadı. Trend analizi için en az bir tarih sütunu gereklidir.');
          return;
        }

        setDateColumns(dates);
        if (dates.length > 0) {
          setStartDate(dates[0]);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching table data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTableData();
  }, [effectiveTableId, workspaceId]);

  const getChartData = () => {
    if (!tableData || !selectedVariable || dateColumns.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const variableColumnIndex = tableData.columns.indexOf('Variable');
    const variableRowIndex = tableData.data.findIndex(
      row => row[variableColumnIndex] === selectedVariable
    );

    if (variableRowIndex === -1) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Get all date columns from the start date onwards
    const startIdx = dateColumns.indexOf(startDate);
    const relevantDateColumns = dateColumns.slice(startIdx);
    
    // Filter out columns that don't exist in the table
    const validDateColumns = relevantDateColumns.filter(
      date => tableData.columns.includes(date)
    );

    // Map column names to indices
    const dateIndices = validDateColumns.map(date => tableData.columns.indexOf(date));

    // Get data values for the selected variable across all dates
    const dataValues = dateIndices.map(index => {
      const value = tableData.data[variableRowIndex][index];
      
      // Convert string values with "<" prefix to numerical values
      if (typeof value === 'string' && value.startsWith('<')) {
        return parseFloat(value.substring(1));
      }
      
      // Convert to number or use 0 if null
      return typeof value === 'number' ? value : parseFloat(value as string) || 0;
    });

    return {
      labels: validDateColumns,
      datasets: [
        {
          label: selectedVariable,
          data: dataValues,
          borderColor: chartColor,
          backgroundColor: `${chartColor}33`, // Add transparency
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedVariable || ''} Trend Analizi`,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: TooltipItem<'line'>) {
            const value = tooltipItem.raw as number;
            const unit = getUnitForVariable(selectedVariable);
            return `${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const getUnitForVariable = (variableName: string) => {
    if (!tableData) return '';
    
    const variableColumnIndex = tableData.columns.indexOf('Variable');
    const unitColumnIndex = tableData.columns.indexOf('Unit');
    
    if (variableColumnIndex === -1 || unitColumnIndex === -1) return '';
    
    const variableRowIndex = tableData.data.findIndex(
      row => row[variableColumnIndex] === variableName
    );
    
    if (variableRowIndex === -1) return '';
    
    return tableData.data[variableRowIndex][unitColumnIndex] as string || '';
  };

  const exportAsPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      console.log('📊 Starting PDF export for trend analysis...');
      
      // Wait for chart to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      });
      
      console.log('✅ Chart captured successfully');
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Use helvetica font for better compatibility
      pdf.setFont('helvetica', 'normal');
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Helper function for Turkish characters
      const handleTurkishText = (text: string): string => {
        try {
          // Ensure the text is properly encoded as UTF-8
          const utf8Text = decodeURIComponent(encodeURIComponent(text));
          
          // Only replace problematic characters that cause PDF issues
          return utf8Text
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")
            .replace(/[–—]/g, '-')
            .replace(/…/g, '...')
            .replace(/[\u2212]/g, '-') // Unicode minus sign
            .replace(/[\u2013\u2014]/g, '-') // En dash, Em dash
            .replace(/[\u201C\u201D]/g, '"') // Smart quotes
            .replace(/[\u2018\u2019]/g, "'") // Smart apostrophes
            .replace(/[\u00A0]/g, ' '); // Non-breaking space
        } catch (error) {
          console.warn('Text encoding failed, using original:', error);
          return text;
        }
      };
      
      pdf.setFontSize(16);
      pdf.text(`${handleTurkishText(selectedVariable)} Trend Analizi`, 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 15, 22);
      pdf.text(`Birim: ${handleTurkishText(getUnitForVariable(selectedVariable))}`, 15, 27);
      
      pdf.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);
      
      // Create safe filename
      const safeVariableName = handleTurkishText(selectedVariable).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const filename = `trend-analizi-${safeVariableName}.pdf`;
      
      pdf.save(filename);
      
      console.log('✅ PDF exported successfully:', filename);
    } catch (err) {
      console.error('❌ PDF oluşturma hatası:', err);
      alert('PDF oluşturulurken bir hata oluştu: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!effectiveTableId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Lütfen analiz için bir tablo seçin</p>
        {tables.length > 0 && (
          <div className="max-w-md mx-auto">
            <label htmlFor="tableSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Tablo Seçin
            </label>
            <select
              id="tableSelect"
              onChange={(e) => handleTableChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Tablo seçin --</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} - {table.sheetName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>{error}</p>
        <button 
          onClick={() => setError('')}
          className="mt-2 px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Tablo verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4 text-black">Trend Analizi</h2>
        
        {/* Table selection */}
        {tables && tables.length > 0 && (
          <div className="mb-4">
            <label htmlFor="trend-table-select" className="block text-sm font-medium text-gray-800 mb-1">
              Tablo Seçin
            </label>
            <select
              id="trend-table-select"
              value={selectedTableId || ''}
              onChange={(e) => {
                const newTableId = e.target.value;
                handleTableChange(newTableId);
                // Reset variable selection when table changes
                setSelectedVariable('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Tablo Seçin</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} {table.sheetName ? `- ${table.sheetName}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* No table selected warning */}
        {!selectedTableId && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Lütfen analiz yapmak için önce bir tablo seçin.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTableId && (
          <>
            {/* Variable selection */}
            <div className="mb-4">
              <label htmlFor="variable-select" className="block text-sm font-medium text-gray-800 mb-1">
                Değişken Seçin
              </label>
              <select
                id="variable-select"
                value={selectedVariable || ''}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={!tableData || loading}
              >
                <option value="">Değişken Seçin</option>
                {variables.map((variable) => (
                  <option key={variable} value={variable}>
                    {variable}
                  </option>
                ))}
              </select>
            </div>

            {/* Date selection */}
            <div className="mb-4">
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-800 mb-1">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={!selectedVariable || loading}
              />
            </div>

            <button
              onClick={exportAsPDF}
              disabled={!selectedVariable || !startDate || loading}
              className={`w-full py-2 px-4 rounded-md ${
                !selectedVariable || !startDate || loading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Yükleniyor...' : 'Grafik Oluştur'}
            </button>
          </>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-[500px]" ref={chartRef}>
          <Line data={getChartData()} options={chartOptions} />
        </div>
        
        {selectedVariable && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <strong>Birim:</strong> {getUnitForVariable(selectedVariable)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 