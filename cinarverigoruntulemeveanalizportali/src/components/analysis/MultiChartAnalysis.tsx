'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js';
import { FcAreaChart, FcRules, FcApproval, FcPlus, FcPrint } from 'react-icons/fc';
import { MdDelete, MdDragIndicator } from 'react-icons/md';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { evaluateFormulasForTable } from '@/lib/enhancedFormulaEvaluator';
import EditableDataTable from '@/components/tables/EditableDataTable';
import FormulaBuilder from '@/components/formulas/FormulaBuilder';
import { exportEnhancedTableToPdf } from '@/lib/pdf/enhanced-pdf-export';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface Workspace {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
}

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  color: string;
  active: boolean;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
  formulaIds: string[];
  formulaDetails?: {
    id: string;
    name: string;
    formula: string;
    leftResult?: number;
    rightResult?: number;
    color: string;
  }[];
}

interface ChartConfig {
  id: string;
  type: 'line' | 'bar';
  variable: string;
  startDate: string;
  endDate: string;
  color: string;
  title: string;
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

interface MultiChartAnalysisProps {
  workspaceId: string;
  tableId?: string;
}

export default function MultiChartAnalysis({ workspaceId, tableId }: MultiChartAnalysisProps) {
  // State for workspace and table management
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(workspaceId);
  const [selectedTable, setSelectedTable] = useState<string>(tableId || '');
  
  // State for analysis data
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for chart management
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [nextChartId, setNextChartId] = useState(1);
  
  // ENHANCED: Add chart selection for normal PDF export
  const [selectedChartsForPDF, setSelectedChartsForPDF] = useState<Set<string>>(new Set());
  
  // State for formula highlighting
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<HighlightedCell[]>([]);
  const [showTable, setShowTable] = useState(true);
  const [showFormulaManager, setShowFormulaManager] = useState(false);
  const [applyingFormulas, setApplyingFormulas] = useState(false);
  
  // Refs for PDF export
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const cleaned = hex.replace('#', '');
    const bigint = parseInt(cleaned, 16);
    
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  };

  // Fetch workspaces on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) throw new Error('Çalışma alanları yüklenirken bir hata oluştu');
        const data = await response.json();
        setWorkspaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError((err as Error).message);
      }
    };
    fetchWorkspaces();
  }, []);

  // Fetch tables when workspace changes
  useEffect(() => {
    if (!selectedWorkspace) {
      setTables([]);
      return;
    }
    
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables`);
        if (!response.ok) throw new Error('Tablolar yüklenirken bir hata oluştu');
        const data = await response.json();
        setTables(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, [selectedWorkspace]);

  // Fetch analysis data when table changes
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
        if (!response.ok) throw new Error('Tablo verileri yüklenirken bir hata oluştu');
        
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
        
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [selectedWorkspace, selectedTable]);

  // Fetch formulas when workspace/table changes
  useEffect(() => {
    if (selectedWorkspace) {
      fetchFormulas();
    }
  }, [selectedWorkspace, selectedTable]);

  const fetchFormulas = async () => {
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas`);
      if (!response.ok) throw new Error('Formüller yüklenirken bir hata oluştu');
      const data = await response.json();
      setFormulas(Array.isArray(data) ? data.filter((f: Formula) => f.active) : []);
    } catch (err) {
      console.error('Error fetching formulas:', err);
    }
  };

  // Apply formulas to table data
  const applyFormulasToTable = async () => {
    if (!analysisData?.tableData || formulas.length === 0) return;
    
    try {
      setApplyingFormulas(true);
      
      // Use the enhanced formula evaluator
      const highlighted = evaluateFormulasForTable(formulas, analysisData.tableData);
      setHighlightedCells(highlighted);
      
      console.log(`Applied ${formulas.length} formulas, got ${highlighted.length} highlighted cells`);
    } catch (err) {
      console.error('Error applying formulas:', err);
      setError('Formüller uygulanırken bir hata oluştu');
    } finally {
      setApplyingFormulas(false);
    }
  };

  // Auto-apply formulas when data or formulas change
  useEffect(() => {
    if (analysisData?.tableData && formulas.length > 0) {
      applyFormulasToTable();
    }
  }, [analysisData?.tableData, formulas]);

  // Add a new chart
  const addChart = () => {
    if (!analysisData?.variables.length) {
      console.error('No variables available for charting');
      setError('Grafik eklemek için önce bir tablo seçmelisiniz.');
      return;
    }
    
    const newChart: ChartConfig = {
      id: `chart-${nextChartId}`,
      type: 'line',
      variable: analysisData.variables[0],
      startDate: analysisData.dateColumns[0] || '',
      endDate: analysisData.dateColumns[analysisData.dateColumns.length - 1] || '',
      color: '#3B82F6',
      title: `${analysisData.variables[0]} Trend Grafiği`
    };
    
    console.log('Adding new chart:', newChart);
    setCharts([...charts, newChart]);
    setNextChartId(nextChartId + 1);
  };

  // Remove chart
  const removeChart = (chartId: string) => {
    setCharts(charts.filter(chart => chart.id !== chartId));
  };

  // Update chart configuration
  const updateChart = (chartId: string, updates: Partial<ChartConfig>) => {
    setCharts(charts.map(chart => 
      chart.id === chartId ? { ...chart, ...updates } : chart
    ));
  };

  // Get chart data for a specific chart configuration
  const getChartData = (chartConfig: ChartConfig) => {
    if (!analysisData?.tableData) {
      console.log('No analysis data available for chart:', chartConfig.id);
      return { labels: [], datasets: [] };
    }
    
    const { columns, data } = analysisData.tableData;
    const variableColumnIndex = columns.findIndex(col => col === 'Variable');
    
    if (variableColumnIndex === -1) {
      console.log('Variable column not found in table data');
      return { labels: [], datasets: [] };
    }
    
    console.log('Looking for variable:', chartConfig.variable);
    console.log('Available variables in data:', data.map(row => row[variableColumnIndex]).filter(Boolean));
    
    // Filter rows for selected variable - be more flexible with matching
    const variableRows = data.filter((row: (string | number | null)[]) => {
      const variableName = row[variableColumnIndex];
      if (!variableName) return false;
      
      // Convert both to strings and clean them for comparison
      const cleanRowVar = String(variableName).replace(/,+$/, '').trim();
      const cleanConfigVar = String(chartConfig.variable).replace(/,+$/, '').trim();
      
      // Try exact match first, then case-insensitive, then contains
      return cleanRowVar === cleanConfigVar || 
             cleanRowVar.toLowerCase() === cleanConfigVar.toLowerCase() ||
             cleanRowVar.includes(cleanConfigVar) ||
             cleanConfigVar.includes(cleanRowVar);
    });
    
    console.log(`Found ${variableRows.length} rows for variable: ${chartConfig.variable}`);
    
    if (variableRows.length === 0) {
      console.log(`No rows found for variable: ${chartConfig.variable}`);
      return { labels: [], datasets: [] };
    }
    
    // Get date columns and ensure they exist
    const availableDateColumns = analysisData.dateColumns;
    console.log('Available date columns:', availableDateColumns);
    console.log('Chart date range:', { start: chartConfig.startDate, end: chartConfig.endDate });
    
    // Find start and end indices
    let startIndex = availableDateColumns.indexOf(chartConfig.startDate);
    let endIndex = availableDateColumns.indexOf(chartConfig.endDate);
    
    // Fallback to first and last dates if specific dates not found
    if (startIndex === -1) {
      startIndex = 0;
      console.log('Start date not found, using first date:', availableDateColumns[0]);
    }
    if (endIndex === -1) {
      endIndex = availableDateColumns.length - 1;
      console.log('End date not found, using last date:', availableDateColumns[endIndex]);
    }
    
    const labels: string[] = [];
    const values: (number | null)[] = [];
    
    // Ensure we process dates in the correct order
    const actualStartIndex = Math.min(startIndex, endIndex);
    const actualEndIndex = Math.max(startIndex, endIndex);
    
    console.log(`Processing date range from index ${actualStartIndex} to ${actualEndIndex}`);
    
    for (let i = actualStartIndex; i <= actualEndIndex; i++) {
      const dateColumn = availableDateColumns[i];
      if (!dateColumn) continue;
      
      const dateColumnIndex = columns.findIndex(col => col === dateColumn);
      if (dateColumnIndex === -1) continue;
      
      labels.push(dateColumn);
      
      // Get value for this date from the first matching row
      const value = variableRows[0][dateColumnIndex];
      if (value !== null && value !== undefined && !isNaN(Number(value))) {
        values.push(Number(value));
      } else {
        values.push(null);
      }
    }
    
    console.log('Chart data prepared:', { labels: labels.length, values: values.length });
    console.log('Sample data:', { labels: labels.slice(0, 3), values: values.slice(0, 3) });
    
    // Create gradient for the chart
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let gradient = null;
    
    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, chartConfig.color);
      gradient.addColorStop(0.5, chartConfig.color + '80'); // 50% opacity
      gradient.addColorStop(1, chartConfig.color + '20'); // 12.5% opacity
    }
    
    return {
      labels,
      datasets: [
        {
          label: chartConfig.variable,
          data: values,
          borderColor: chartConfig.color,
          backgroundColor: gradient || (chartConfig.color + '20'),
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: chartConfig.type === 'line',
          connectNulls: false, // Don't connect null values
          spanGaps: false, // Don't span gaps
          pointBackgroundColor: chartConfig.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: chartConfig.color,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        }
      ]
    };
  };

  // Chart options
  const getChartOptions = (chartConfig: ChartConfig) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartConfig.title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Değer'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tarih'
        }
      }
    }
  });

  // ENHANCED: Use new PDF export service for comprehensive analysis
  const exportComprehensivePDF = async () => {
    if ((!charts.length && !showTable) || !analysisData) {
      setError('PDF oluşturmak için en az bir grafik veya tablo gereklidir.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting comprehensive PDF export with enhanced service...');
      
      // Prepare chart elements for export
      const chartElements: HTMLElement[] = [];
      
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const chartElement = document.getElementById(`chart-${chart.id}`);
        
        if (chartElement) {
          chartElements.push(chartElement);
          console.log(`📊 Chart ${i + 1} element found: ${chart.title}`);
        } else {
          console.warn(`⚠️ Chart ${i + 1} element not found: ${chart.title}`);
        }
      }
      
      // Prepare table data if table is shown
      let tableData = null;
      if (showTable && analysisData.tableData) {
        const selectedTableName = tables.find(t => t.id === selectedTable)?.name || 'Bilinmeyen Tablo';
        tableData = {
          name: selectedTableName,
          columns: analysisData.tableData.columns,
          data: analysisData.tableData.data
        };
      }
      
      // Prepare formula information
      const formulaInfo = formulas.map(formula => ({
        id: formula.id,
        name: formula.name,
        formula: formula.formula,
        type: formula.type,
        color: formula.color,
        description: formula.description || '',
        active: formula.active
      }));
      
      // Use enhanced PDF export
      if (tableData) {
        await exportEnhancedTableToPdf(tableData, {
          title: 'Kapsamli Veri Analiz Raporu',
          subtitle: `Analiz Edilen Tablo: ${tableData.name}`,
          orientation: 'landscape',
          includeFormulas: formulas.length > 0,
          formulas: formulaInfo,
          includeCharts: chartElements.length > 0,
          chartElements: chartElements,
          highlightedCells: highlightedCells,
          cellBorderWidth: 1.5,
          userName: 'Sistem Kullanicisi' // You can get this from user context
        });
        
        console.log(`✅ Comprehensive PDF exported successfully`);
        console.log(`📊 Charts included: ${chartElements.length}`);
        console.log(`📋 Formulas included: ${formulaInfo.length}`);
        console.log(`🎯 Highlighted cells: ${highlightedCells.length}`);
        
        setError(`Kapsamlı analiz PDF'i başarıyla oluşturuldu! ${chartElements.length} grafik ve ${formulaInfo.length} formül dahil edildi.`);
      } else {
        throw new Error('Tablo verisi bulunamadı');
      }
      
    } catch (err) {
      console.error('❌ Comprehensive PDF generation error:', err);
      setError(`Kapsamlı analiz PDF'i oluşturulurken bir hata oluştu: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Use new PDF export service for normal analysis  
  const exportNormalAnalysisPDF = async () => {
    const selectedCharts = charts.filter(chart => selectedChartsForPDF.has(chart.id));
    
    if (selectedCharts.length === 0) {
      setError('Normal analiz PDF\'i oluşturmak için en az bir grafik seçmelisiniz.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting normal analysis PDF export with enhanced service...');
      
      // Prepare selected chart elements for export
      const chartElements: HTMLElement[] = [];
      
      for (const chart of selectedCharts) {
        const chartElement = document.getElementById(`chart-${chart.id}`);
        
        if (chartElement) {
          chartElements.push(chartElement);
          console.log(`📊 Selected chart element found: ${chart.title}`);
        } else {
          console.warn(`⚠️ Selected chart element not found: ${chart.title}`);
        }
      }
      
      // Create a minimal table data structure for the PDF service
      const selectedTableName = tables.find(t => t.id === selectedTable)?.name || 'Bilinmeyen Tablo';
      const dummyTableData = {
        name: selectedTableName,
        columns: ['Grafik', 'Aciklama'],
        data: selectedCharts.map((chart, index) => [
          `Grafik ${index + 1}: ${chart.title}`,
          `Degisken: ${chart.variable}, Tarih: ${chart.startDate} - ${chart.endDate}`
        ])
      };
      
      // Use enhanced PDF export with selected charts only
      await exportEnhancedTableToPdf(dummyTableData, {
        title: 'Secili Grafik Analiz Raporu',
        subtitle: `Analiz Edilen Tablo: ${selectedTableName}`,
        orientation: 'landscape',
        includeFormulas: false, // Don't include formulas in normal analysis
        includeCharts: true,
        chartElements: chartElements,
        cellBorderWidth: 1.5,
        userName: 'Sistem Kullanicisi'
      });
      
      console.log(`✅ Normal analysis PDF exported successfully`);
      console.log(`📊 Selected charts included: ${chartElements.length}`);
      
      setError(`Grafik analiz PDF'i başarıyla oluşturuldu! ${chartElements.length} seçili grafik dahil edildi.`);
      
    } catch (err) {
      console.error('❌ Normal analysis PDF generation error:', err);
      setError(`Grafik analiz PDF'i oluşturulurken bir hata oluştu: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to toggle chart selection for PDF export
  const toggleChartSelection = (chartId: string) => {
    const newSelection = new Set(selectedChartsForPDF);
    if (newSelection.has(chartId)) {
      newSelection.delete(chartId);
    } else {
      newSelection.add(chartId);
    }
    setSelectedChartsForPDF(newSelection);
  };

  // Helper function to select all charts
  const selectAllCharts = () => {
    setSelectedChartsForPDF(new Set(charts.map(chart => chart.id)));
  };

  // Helper function to clear all chart selections
  const clearChartSelection = () => {
    setSelectedChartsForPDF(new Set());
  };

  // Convert table data for EditableDataTable
  const getTableForDisplay = () => {
    if (!analysisData?.tableData) return { columns: [], data: [] };
    
    const columns = analysisData.tableData.columns.map(col => ({
      id: col,
      name: col,
      type: 'string' as const
    }));
    
    const data = analysisData.tableData.data.map((row, rowIndex) => {
      const rowData: { [key: string]: string | number | null, id: string } = { 
        id: `row-${rowIndex + 1}` 
      };
      analysisData.tableData.columns.forEach((col, colIndex) => {
        rowData[col] = row[colIndex];
      });
      return rowData;
    });
    
    return { columns, data };
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

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FcAreaChart className="mr-2 h-6 w-6" />
          Kapsamlı Analiz ve Rapor
        </h1>

        {/* Workspace and Table Selection */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Alanı Seçimi
            </label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
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
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={!selectedWorkspace || loading}
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

        {/* Analysis Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={addChart}
              disabled={!analysisData?.variables.length}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !analysisData?.variables.length
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <FcPlus className="mr-2 h-5 w-5" />
              Yeni Grafik Ekle
            </button>

            <button
              onClick={() => setShowFormulaManager(!showFormulaManager)}
              disabled={!selectedTable}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !selectedTable
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <FcRules className="mr-2 h-4 w-4" />
              {showFormulaManager ? 'Formül Yönetimini Gizle' : 'Formül Yönetimi'}
            </button>

            <label className="flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={showTable}
                onChange={(e) => setShowTable(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">Veri Tablosunu Göster</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {formulas.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <FcRules className="h-5 w-5" />
                <span className="text-sm text-blue-700 font-medium">
                  {formulas.length} formül aktif
                </span>
                {highlightedCells.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    {highlightedCells.length} hücre vurgulandı
                  </span>
                )}
              </div>
            )}

            {/* ENHANCED: PDF Export Options with Chart Selection */}
            <div className="flex flex-col space-y-2">
              {/* Chart Selection for Normal PDF */}
              {charts.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Grafik Seçimi ({selectedChartsForPDF.size}/{charts.length})
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllCharts}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Tümünü Seç
                      </button>
                      <button
                        onClick={clearChartSelection}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {charts.map((chart) => (
                      <label
                        key={chart.id}
                        className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-100 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedChartsForPDF.has(chart.id)}
                          onChange={() => toggleChartSelection(chart.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="truncate" title={chart.title}>
                          {chart.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Export Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportNormalAnalysisPDF}
                  disabled={selectedChartsForPDF.size === 0 || loading}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedChartsForPDF.size === 0 || loading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                  title="Sadece seçili grafikler dahil edilir"
                >
                  <FcPrint className="mr-2 h-4 w-4" />
                  {loading ? 'PDF Oluşturuluyor...' : 'Grafik PDF İndir'}
                  {selectedChartsForPDF.size > 0 && (
                    <span className="ml-1 bg-white text-green-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                      {selectedChartsForPDF.size}
                    </span>
                  )}
                </button>

                <button
                  onClick={exportComprehensivePDF}
                  disabled={(!charts.length && !showTable) || loading}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    (!charts.length && !showTable) || loading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                  title="Tüm grafikler, formül vurgulamalı tablo ve detaylı analiz dahil edilir"
                >
                  <FcPrint className="mr-2 h-4 w-4" />
                  {loading ? 'PDF Oluşturuluyor...' : 'Kapsamlı PDF İndir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Status */}
      {analysisData && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-center">
            <FcApproval className="h-5 w-5 mr-2" />
            <div>
              <h4 className="text-blue-800 font-medium">Analiz Hazır</h4>
              <p className="text-blue-700 text-sm">
                {analysisData.variables.length} değişken, {analysisData.dateColumns.length} tarih kolonu mevcut.
                {formulas.length > 0 && ` ${formulas.length} formül uygulandı.`}
                {highlightedCells.length > 0 && ` ${highlightedCells.length} hücre vurgulandı.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formula Management Section - ENHANCED */}
      {showFormulaManager && selectedTable && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FcRules className="mr-2 h-6 w-6" />
              Gelişmiş Formül Yönetimi
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Tablo: {tables.find(t => t.id === selectedTable)?.name}
              </span>
              <button
                onClick={applyFormulasToTable}
                disabled={applyingFormulas || formulas.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  applyingFormulas || formulas.length === 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                }`}
              >
                {applyingFormulas ? 'Uygulanıyor...' : 'Formülleri Uygula'}
              </button>
            </div>
          </div>
          
          {/* Enhanced Formula Editor with Dropdown Support */}
          <div className="space-y-6">
            {/* Dropdown Formula Builder */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                Formül Oluşturucu
              </h3>
              <FormulaBuilder
                variables={analysisData?.variables || []}
                onSave={async (formula: string, name: string, color: string) => {
                  try {
                    // Create formula via API
                    const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name,
                        formula,
                        color,
                        type: 'CELL_VALIDATION',
                        description: `Analiz sayfasından oluşturulan formül: ${formula}`,
                        active: true
                      }),
                    });
                    
                    if (response.ok) {
                      const newFormula = await response.json();
                      const formulaWithDefaults: Formula = {
                        ...newFormula,
                        active: newFormula.active ?? true
                      };
                      setFormulas(prev => [...prev, formulaWithDefaults]);
                      // Auto-apply formulas when a new one is added
                      setTimeout(() => {
                        applyFormulasToTable();
                      }, 500);
                    }
                  } catch (error) {
                    console.error('Error creating formula:', error);
                  }
                }}
                onCancel={() => {
                  // Handle cancel if needed
                }}
                isVisible={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Charts Container */}
      <div ref={chartsContainerRef} className="space-y-6 mb-6">
        {charts.length === 0 && selectedTable ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              &ldquo;Yeni Grafik Ekle&rdquo; butonuna tıklayarak analiz grafiklerinizi oluşturmaya başlayın.
            </p>
          </div>
        ) : null}

        {/* Responsive Grid Layout for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <div key={chart.id} id={`chart-${chart.id}`} className="bg-white rounded-lg shadow-md p-6 min-h-[600px]">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MdDragIndicator className="text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold">Grafik {index + 1}</h3>
                </div>
                <button
                  onClick={() => removeChart(chart.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                  title="Grafiği Sil"
                >
                  <MdDelete className="h-5 w-5" />
                </button>
              </div>

              {/* Chart Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grafik Türü
                  </label>
                  <select
                    value={chart.type}
                    onChange={(e) => updateChart(chart.id, { type: e.target.value as 'line' | 'bar' })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                  >
                    <option value="line">Çizgi Grafik</option>
                    <option value="bar">Sütun Grafik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Değişken
                  </label>
                  <select
                    value={chart.variable}
                    onChange={(e) => updateChart(chart.id, { 
                      variable: e.target.value,
                      title: `${e.target.value} Trend Grafiği`
                    })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                  >
                    {analysisData?.variables.map((variable) => (
                      <option key={variable} value={variable}>
                        {variable}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç
                  </label>
                  <select
                    value={chart.startDate}
                    onChange={(e) => updateChart(chart.id, { startDate: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                  >
                    {analysisData?.dateColumns.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş
                  </label>
                  <select
                    value={chart.endDate}
                    onChange={(e) => updateChart(chart.id, { endDate: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                  >
                    {analysisData?.dateColumns.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chart Title and Color */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grafik Başlığı
                  </label>
                  <input
                    type="text"
                    value={chart.title}
                    onChange={(e) => updateChart(chart.id, { title: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                    placeholder="Grafik başlığını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renk
                  </label>
                  <input
                    type="color"
                    value={chart.color}
                    onChange={(e) => updateChart(chart.id, { color: e.target.value })}
                    className="w-full h-10 border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Chart Display */}
              <div className="h-80">
                {chart.type === 'line' ? (
                  <Line data={getChartData(chart)} options={getChartOptions(chart)} />
                ) : (
                  <Bar data={getChartData(chart)} options={getChartOptions(chart)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Container */}
      {showTable && analysisData?.tableData && (
        <div ref={tableContainerRef} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FcRules className="mr-2" />
              Veri Tablosu
              {highlightedCells.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  {highlightedCells.length} vurgulanmış hücre
                </span>
              )}
            </h3>
            
            {formulas.length > 0 && (
              <div className="text-sm text-gray-600">
                Aktif formüller: {formulas.map(f => f.name).join(', ')}
              </div>
            )}
          </div>
          
          <EditableDataTable
            columns={getTableForDisplay().columns}
            data={getTableForDisplay().data}
            loading={applyingFormulas}
            title={analysisData.tableData.name}
            workspaceId={selectedWorkspace}
            tableId={selectedTable}
            highlightedCells={highlightedCells}
            onCellSelect={() => {}}
            onDataChange={() => {}}
          />
        </div>
      )}
    </div>
  );
} 