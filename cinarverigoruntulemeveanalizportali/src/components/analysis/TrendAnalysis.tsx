'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FcPrint } from 'react-icons/fc';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TrendAnalysisProps {
  tableId: string;
  workspaceId: string;
}

interface TableData {
  id: string;
  name: string;
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

export default function TrendAnalysis({ tableId, workspaceId }: TrendAnalysisProps) {
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [startDateColumn, setStartDateColumn] = useState<string>('');
  const [chartColor, setChartColor] = useState<string>('#3b82f6'); // Default blue color
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTableData() {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}`);
        if (!response.ok) {
          throw new Error('Tablo verisi yüklenemedi');
        }

        const data = await response.json();
        setTableData(data);

        // Extract variables (from the "Variable" column)
        const variableColumnIndex = data.columns.findIndex(
          (col: string) => col.toLowerCase() === 'variable'
        );

        if (variableColumnIndex !== -1) {
          const uniqueVariables = Array.from(
            new Set(
              data.data
                .map((row: (string | number | null)[]) => row[variableColumnIndex])
                .filter((val: string | number | null) => val !== null && val !== '')
            )
          ) as string[];

          setVariables(uniqueVariables);
          if (uniqueVariables.length > 0) {
            setSelectedVariable(uniqueVariables[0]);
          }
        }

        // Extract date columns (all columns except standard ones)
        const standardColumns = ['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'];
        const dates = data.columns.filter((col: string) => !standardColumns.includes(col));
        
        setDateColumns(dates);
        if (dates.length > 0) {
          setStartDateColumn(dates[0]);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching table data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTableData();
  }, [tableId, workspaceId]);

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
    const startIdx = dateColumns.indexOf(startDateColumn);
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
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.text(`${selectedVariable} Trend Analizi`, 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 15, 22);
      pdf.text(`Birim: ${getUnitForVariable(selectedVariable)}`, 15, 27);
      
      pdf.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);
      pdf.save(`trend-analizi-${selectedVariable.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
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
      <div className="mb-6">
        <h2 className="text-xl font-bold">Trend Analizi - {tableData.name}</h2>
        <p className="text-gray-600">{tableData.sheetName}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="variable" className="block text-sm font-medium text-gray-700 mb-1">
              Değişken Seçin
            </label>
            <select
              id="variable"
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {variables.map((variable) => (
                <option key={variable} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <select
              id="startDate"
              value={startDateColumn}
              onChange={(e) => setStartDateColumn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {dateColumns.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="chartColor" className="block text-sm font-medium text-gray-700 mb-1">
              Grafik Rengi
            </label>
            <div className="flex items-center">
              <input
                id="chartColor"
                type="color"
                value={chartColor}
                onChange={(e) => setChartColor(e.target.value)}
                className="p-1 border border-gray-300 rounded mr-2"
              />
              <span className="text-sm text-gray-600">{chartColor}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={exportAsPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <FcPrint className="mr-2 bg-white rounded" /> PDF İndir
          </button>
        </div>
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