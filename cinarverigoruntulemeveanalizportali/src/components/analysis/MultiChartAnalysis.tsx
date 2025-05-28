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
  Filler
} from 'chart.js';
import { FcAreaChart, FcRules, FcApproval, FcPlus, FcPrint } from 'react-icons/fc';
import { MdDelete, MdDragIndicator } from 'react-icons/md';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { evaluateFormulasForTable } from '@/lib/enhancedFormulaEvaluator';
import EditableDataTable from '@/components/tables/EditableDataTable';
import FormulaBuilder from '@/components/formulas/FormulaBuilder';

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

  // Enhanced PDF export with both charts and tables
  const exportComprehensivePDF = async () => {
    if ((!charts.length && !showTable) || !analysisData) {
      setError('PDF oluşturmak için en az bir grafik veya tablo gereklidir.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Enhanced Turkish character support for PDF
      try {
        // Try to use a Unicode-compatible font if available
        pdf.setFont('helvetica', 'normal');
        // Set language for better character support
        if (typeof (pdf as { setLanguage?: (lang: string) => void }).setLanguage === 'function') {
          (pdf as { setLanguage: (lang: string) => void }).setLanguage('tr');
        }
      } catch (fontError) {
        console.warn('Font setting failed, using default:', fontError);
        pdf.setFont('helvetica', 'normal');
      }
      
      // FIXED: Enhanced Turkish text encoding with proper UTF-8 support
      const encodeTurkishText = (text: string): string => {
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
      
      // Add title page with proper encoding
      pdf.setFontSize(20);
      pdf.text(encodeTurkishText('Çınar Çevre Laboratuvarı'), pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text(encodeTurkishText('Kapsamlı Analiz Raporu'), pageWidth / 2, 45, { align: 'center' });
      
      const selectedTableName = tables.find(t => t.id === selectedTable)?.name || 'Bilinmeyen Tablo';
      pdf.setFontSize(12);
      pdf.text(encodeTurkishText(`Tablo: ${selectedTableName}`), pageWidth / 2, 60, { align: 'center' });
      pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, 70, { align: 'center' });
      
      // Add formulas applied section
      if (formulas.length > 0) {
        pdf.setFontSize(14);
        pdf.text(encodeTurkishText('Uygulanan Formüller:'), 15, 90);
        
        const formulaTableData = formulas.map((formula, index) => [
          (index + 1).toString(),
          encodeTurkishText(formula.name),
          encodeTurkishText(formula.formula),
          encodeTurkishText(formula.active ? 'Aktif' : 'Pasif')
        ]);
        
        autoTable(pdf, {
          startY: 100,
          head: [[encodeTurkishText('#'), encodeTurkishText('Formül Adı'), encodeTurkishText('Formül'), encodeTurkishText('Durum')]],
          body: formulaTableData,
          styles: { 
            fontSize: 8,
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: [41, 128, 185],
            font: 'helvetica',
            fontStyle: 'bold'
          },
          margin: { left: 15, right: 15 }
        });
      }
      
      let currentPage = 1;
      let chartsAdded = 0;
      
      // Process each chart with enhanced error handling
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        
        try {
          console.log(`📊 Processing chart ${i + 1}: ${chart.title}`);
          
          // Find the chart element
          const chartElement = document.getElementById(`chart-${chart.id}`);
          
          if (chartElement) {
            // Add new page for each chart
            if (currentPage > 1) pdf.addPage();
            currentPage++;
            
            // Add page header
            pdf.setFontSize(14);
            pdf.text(encodeTurkishText(`Grafik ${i + 1}: ${chart.title}`), 15, 20);
            
            console.log(`📊 Capturing chart ${i + 1}: ${chart.title}`);
            
            // Wait for chart to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try Chart.js direct method first (more reliable for charts)
            let imgData: string | null = null;
            let captureMethod = 'unknown';
            
            try {
              const chartCanvas = chartElement.querySelector('canvas') as HTMLCanvasElement;
              if (chartCanvas) {
                // Try to get Chart.js instance and use toDataURL
                const chartInstance = ChartJS.getChart(chartCanvas);
                if (chartInstance) {
                  imgData = chartCanvas.toDataURL('image/png', 0.95);
                  captureMethod = 'chartjs-direct';
                  console.log(`✅ Chart ${i + 1} captured using Chart.js direct method`);
                }
              }
            } catch (directError) {
              console.warn(`⚠️ Chart.js direct capture failed for chart ${i + 1}:`, directError);
            }
            
            // Fallback to html2canvas if direct method failed
            if (!imgData) {
              console.log(`📊 Falling back to html2canvas for chart ${i + 1}`);
              const canvas = await html2canvas(chartElement, {
                backgroundColor: '#ffffff',
                scale: 2, // Increased scale for better quality
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: true,
                width: chartElement.offsetWidth,
                height: chartElement.offsetHeight,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                imageTimeout: 15000,
                // Enhanced CSS handling for modern color functions
                ignoreElements: (element) => {
                  const style = window.getComputedStyle(element);
                  // Skip elements with problematic CSS functions
                  if (style.color?.includes('oklch') || 
                      style.color?.includes('lch') || 
                      style.color?.includes('lab') ||
                      style.backgroundColor?.includes('oklch') ||
                      style.backgroundColor?.includes('lch') ||
                      style.backgroundColor?.includes('lab')) {
                    return true;
                  }
                  return false;
                },
                onclone: (clonedDoc) => {
                  const allElements = clonedDoc.querySelectorAll('*');
                  allElements.forEach((el) => {
                    const element = el as HTMLElement;
                    const computedStyle = window.getComputedStyle(element);
                    
                    // Convert modern color functions to fallback colors
                    if (computedStyle.color?.includes('oklch') || 
                        computedStyle.color?.includes('lch') || 
                        computedStyle.color?.includes('lab')) {
                      element.style.color = '#333333'; // Fallback to dark gray
                    }
                    if (computedStyle.backgroundColor?.includes('oklch') || 
                        computedStyle.backgroundColor?.includes('lch') ||
                        computedStyle.backgroundColor?.includes('lab')) {
                      element.style.backgroundColor = '#ffffff'; // Fallback to white
                    }
                    if (computedStyle.borderColor?.includes('oklch') || 
                        computedStyle.borderColor?.includes('lch') ||
                        computedStyle.borderColor?.includes('lab')) {
                      element.style.borderColor = '#cccccc'; // Fallback to light gray
                    }
                    
                    // Also handle any CSS variables that might contain modern color functions
                    const cssText = element.style.cssText;
                    if (cssText.includes('oklch') || cssText.includes('lch') || cssText.includes('lab')) {
                      // Replace with safe fallback colors
                      element.style.cssText = cssText
                        .replace(/oklch\([^)]+\)/g, '#333333')
                        .replace(/lch\([^)]+\)/g, '#333333')
                        .replace(/lab\([^)]+\)/g, '#333333');
                    }
                  });
                }
              });
              
              console.log(`✅ Chart ${i + 1} captured successfully with html2canvas - ${canvas.width}x${canvas.height}`);
              imgData = canvas.toDataURL('image/png', 0.95);
              captureMethod = 'html2canvas';
            }
            
            // Process the captured image
            if (imgData) {
              // Create a temporary image to get dimensions
              const tempImg = new Image();
              tempImg.src = imgData;
              
              // Calculate image dimensions for PDF
              const imgWidth = pageWidth - 30;
              const imgHeight = (tempImg.height * imgWidth) / tempImg.width || 150; // fallback height
              
              // Ensure image fits on page
              const maxHeight = pageHeight - 80;
              const finalHeight = Math.min(imgHeight, maxHeight);
              const finalWidth = (tempImg.width * finalHeight) / tempImg.height || imgWidth;
            
                          // Add chart to PDF
              pdf.addImage(imgData, 'PNG', 15, 30, finalWidth, finalHeight);
              
              // Add chart details with proper encoding
              pdf.setFontSize(10);
              pdf.text(encodeTurkishText(`Değişken: ${chart.variable}`), 15, pageHeight - 30);
              pdf.text(`Tarih Aralığı: ${chart.startDate} - ${chart.endDate}`, 15, pageHeight - 20);
              pdf.text(encodeTurkishText(`Grafik Türü: ${chart.type === 'line' ? 'Çizgi' : 'Sütun'} Grafik`), 15, pageHeight - 10);
              
              chartsAdded++;
              console.log(`📄 Chart ${i + 1} added to PDF successfully using ${captureMethod}`);
            } else {
              console.warn(`⚠️ Failed to capture chart ${i + 1}: chart-${chart.id}`);
              
              // Add new page and error message
              if (currentPage > 1) pdf.addPage();
              currentPage++;
              
              pdf.setFontSize(14);
              pdf.text(encodeTurkishText(`Grafik ${i + 1}: ${chart.title}`), 15, 20);
              pdf.setFontSize(12);
              pdf.setTextColor(255, 140, 0); // Orange color for warnings
              pdf.text(encodeTurkishText('Grafik yakalama başarısız'), 15, 50);
              pdf.text(`Grafik ID: chart-${chart.id}`, 15, 65);
              pdf.setTextColor(0, 0, 0);
            }
          } else {
            console.warn(`⚠️ Chart element not found for chart ${i + 1}: chart-${chart.id}`);
            
            // Add new page and error message
            if (currentPage > 1) pdf.addPage();
            currentPage++;
            
            pdf.setFontSize(14);
            pdf.text(encodeTurkishText(`Grafik ${i + 1}: ${chart.title}`), 15, 20);
            pdf.setFontSize(12);
            pdf.setTextColor(255, 140, 0); // Orange color for warnings
            pdf.text(encodeTurkishText('Grafik bulunamadı veya yüklenemedi'), 15, 50);
            pdf.text(`Grafik ID: chart-${chart.id}`, 15, 65);
            pdf.setTextColor(0, 0, 0);
          }
          
        } catch (chartError) {
          console.error(`❌ Error capturing chart ${i + 1}:`, chartError);
          
          // Add new page and error message
          if (currentPage > 1) pdf.addPage();
          currentPage++;
          
          pdf.setFontSize(14);
          pdf.text(encodeTurkishText(`Grafik ${i + 1}: ${chart.title}`), 15, 20);
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text(encodeTurkishText(`Grafik yakalama hatası: ${(chartError as Error).message}`), 15, 50);
          pdf.setTextColor(0, 0, 0);
          
          // Try alternative capture method using Chart.js toBase64Image if available
          try {
            const chartCanvas = document.querySelector(`#chart-${chart.id} canvas`) as HTMLCanvasElement;
            if (chartCanvas) {
              const chartInstance = (window as { Chart?: { getChart?: (canvas: HTMLCanvasElement) => { toBase64Image?: () => string } } }).Chart?.getChart?.(chartCanvas);
              if (chartInstance && typeof chartInstance.toBase64Image === 'function') {
                const imgData = chartInstance.toBase64Image();
                pdf.addImage(imgData, 'PNG', 15, 70, pageWidth - 30, 150);
                pdf.setTextColor(0, 128, 0);
                pdf.text(encodeTurkishText('Grafik alternatif yöntemle eklendi'), 15, 65);
                pdf.setTextColor(0, 0, 0);
                chartsAdded++;
                console.log(`📄 Chart ${i + 1} added using Chart.js method`);
              }
            }
          } catch (fallbackError) {
            console.error(`❌ Fallback capture also failed:`, fallbackError);
          }
        }
      }
      
      // Add highlighted table if enabled
      if (showTable && analysisData.tableData) {
        if (currentPage > 1) pdf.addPage();
        currentPage++;
        
        // Add table header
        pdf.setFontSize(14);
        pdf.text('Veri Tablosu (Formül Vurgulamalı)', 15, 20);
        
        if (formulas.length > 0) {
          pdf.setFontSize(10);
          pdf.text(`Uygulanan Formüller: ${formulas.map(f => f.name).join(', ')}`, 15, 30);
        }
        
        // FIXED: Prepare table data for PDF with proper encoding and structure
        const { columns, data } = analysisData.tableData;
        
        // Ensure proper table structure and encoding
        const tableHeaders = columns.map(col => encodeTurkishText(col));
        
        const tableData = data.map((row: (string | number | null)[]) => {
          return row.map((cell: string | number | null) => {
            if (cell === null || cell === undefined) return '';
            
            // Handle different data types properly
            if (typeof cell === 'number') {
              return cell.toString();
            }
            
            if (typeof cell === 'string') {
              // Encode Turkish characters and clean the string
              return encodeTurkishText(cell.trim());
            }
            
            return encodeTurkishText(String(cell));
          });
        });
        
        // FIXED: Add table with proper highlighting support and row tracking
        autoTable(pdf, {
          startY: 40,
          head: [tableHeaders],
          body: tableData,
          styles: { 
            fontSize: 8,
            font: 'helvetica',
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: [41, 128, 185],
            font: 'helvetica',
            fontStyle: 'bold',
            textColor: [255, 255, 255]
          },
          bodyStyles: {
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: 15, right: 15 },
          // FIXED: Add cell highlighting based on formula results
          didParseCell: function(data) {
            const rowIndex = data.row.index;
            const colIndex = data.column.index;
            
            if (data.section === 'body' && rowIndex < tableData.length && colIndex < columns.length) {
              const rowId = `row-${rowIndex}`;
              const colId = columns[colIndex];
              
              // Check if this cell should be highlighted
              const highlight = highlightedCells.find(
                cell => cell.row === rowId && cell.col === colId
              );
              
              if (highlight) {
                const rgb = hexToRgb(highlight.color);
                if (rgb) {
                  // Apply highlight color with transparency
                  data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
                  data.cell.styles.textColor = [0, 0, 0]; // Ensure text is readable
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          }
        });
        
        const lastTableY = (pdf as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 40;
        
        // Add legend for highlighted cells
        if (highlightedCells.length > 0) {
          let yPos = lastTableY + 15;
          
          // Check if we need a new page for the legend
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFontSize(12);
          pdf.text('Formül Vurgulamaları:', 15, yPos);
          yPos += 10;
          
          // Group highlights by color and message
          const uniqueHighlights = highlightedCells.reduce((acc: Array<{ color: string; message: string }>, cell) => {
            const existing = acc.find(h => h.color === cell.color && h.message === cell.message);
            if (!existing) {
              acc.push({
                color: cell.color,
                message: cell.message
              });
            }
            return acc;
          }, []);
          
          uniqueHighlights.forEach((highlight, index) => {
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = 20;
            }
            
            const rgb = hexToRgb(highlight.color);
            
            // Draw color indicator
            if (rgb) {
              pdf.setFillColor(rgb.r, rgb.g, rgb.b);
              pdf.rect(15, yPos - 4, 6, 6, 'F');
            }
            
            // Add message
            pdf.setFontSize(9);
            pdf.text(`${index + 1}. ${highlight.message}`, 25, yPos);
            
            yPos += 8;
          });
        }
      }
      
      // Add formula explanations
      if (formulas.length > 0) {
        if (currentPage > 1) pdf.addPage();
        
        pdf.setFontSize(14);
        pdf.text('Kullanılan Formüller:', 15, 20);
        
        let yPos = 35;
        
        formulas.forEach((formula, index) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
          }
          
          const rgb = hexToRgb(formula.color);
          
          // Draw color indicator
          if (rgb) {
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(15, yPos - 4, 6, 6, 'F');
          }
          
          // Add formula details
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${formula.name}`, 25, yPos);
          
          if (formula.description) {
            yPos += 6;
            pdf.setFontSize(8);
            pdf.text(`Açıklama: ${formula.description}`, 25, yPos);
          }
          
          yPos += 6;
          pdf.setFontSize(8);
          pdf.text(`Formül: ${formula.formula}`, 25, yPos);
          pdf.text(`Tip: ${formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişkisel'}`, 25, yPos + 6);
          
          yPos += 18;
        });
      }
      
      // Add footer to all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          'Çınar Çevre Laboratuvarı - Kapsamlı Analiz Raporu',
          15,
          pageHeight - 10
        );
        
        pdf.text(
          `Sayfa ${i} / ${pageCount}`,
          pageWidth - 30,
          pageHeight - 10
        );
      }
      
      // Save PDF
      const fileName = `kapsamli-analiz-raporu-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log(`✅ PDF başarıyla oluşturuldu: ${fileName}`);
      console.log(`📊 ${chartsAdded}/${charts.length} grafik başarıyla eklendi`);
      
      // Show success message
      if (chartsAdded === charts.length) {
        setError(`✅ PDF başarıyla oluşturuldu! ${chartsAdded} grafik ve ${showTable ? '1 tablo' : '0 tablo'} eklendi.`);
      } else {
        setError(`⚠️ PDF oluşturuldu ancak ${charts.length - chartsAdded} grafik eklenemedi. ${chartsAdded} grafik başarıyla eklendi.`);
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
      
    } catch (err) {
      console.error('❌ PDF oluşturma hatası:', err);
      setError(`PDF oluşturulurken bir hata oluştu: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
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
        id: `row-${rowIndex}` 
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

            <button
              onClick={exportComprehensivePDF}
              disabled={(!charts.length && !showTable) || loading}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                (!charts.length && !showTable) || loading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <FcPrint className="mr-2 h-5 w-5" />
              {loading ? 'PDF Oluşturuluyor...' : 'Kapsamlı PDF İndir'}
            </button>
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