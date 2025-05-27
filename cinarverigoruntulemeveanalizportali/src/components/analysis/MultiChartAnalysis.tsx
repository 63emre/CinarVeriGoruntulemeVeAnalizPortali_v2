'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { FcLineChart, FcPlus, FcPrint, FcRules, FcApproval } from 'react-icons/fc';
import { MdDragIndicator, MdDelete } from 'react-icons/md';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';
import { evaluateFormulasForTable } from '@/lib/enhancedFormulaEvaluator';
import EditableDataTable from '@/components/tables/EditableDataTable';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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
      const colIndex = columns.indexOf(dateColumn);
      
      if (colIndex === -1) {
        console.log(`Date column ${dateColumn} not found in table columns`);
        continue;
      }
      
      // Use the first matching row for this variable
      const rawValue = variableRows[0][colIndex];
      let numValue: number | null = null;
      
      if (rawValue !== null && rawValue !== undefined) {
        if (typeof rawValue === 'number') {
          numValue = rawValue;
        } else if (typeof rawValue === 'string') {
          // Handle various string formats
          let cleanValue = rawValue.trim();
          
          // Handle values that start with '<', '>', '≤', '≥', etc.
          cleanValue = cleanValue.replace(/^[<>≤≥]+/, '').trim();
          
          // Handle comma decimal separators
          cleanValue = cleanValue.replace(',', '.');
          
          const parsed = parseFloat(cleanValue);
          if (!isNaN(parsed)) {
            numValue = parsed;
          } else {
            console.log(`Could not parse value: "${rawValue}" for date ${dateColumn}`);
          }
        }
      }
      
      labels.push(dateColumn);
      values.push(numValue);
    }
    
    console.log(`Chart data for ${chartConfig.variable}:`, { 
      labels: labels.slice(0, 5), // Show first 5 for brevity
      values: values.slice(0, 5),
      totalPoints: values.length,
      validPoints: values.filter(v => v !== null).length
    });
    
    // Ensure we have some valid data
    const validDataCount = values.filter(v => v !== null).length;
    if (validDataCount === 0) {
      console.log('No valid numeric data found for chart');
      return { labels: [], datasets: [] };
    }
    
    return {
      labels,
      datasets: [
        {
          label: chartConfig.variable,
          data: values,
          borderColor: chartConfig.color,
          backgroundColor: chartConfig.color + '20',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: chartConfig.type === 'line',
          connectNulls: false, // Don't connect null values
          spanGaps: false, // Don't span gaps
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
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set Turkish character support
      pdf.setFont('helvetica', 'normal');
      pdf.setLanguage('tr');
      
      // Add title page
      pdf.setFontSize(20);
      pdf.text('Cinar Cevre Laboratuvari', pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text('Kapsamli Analiz Raporu', pageWidth / 2, 45, { align: 'center' });
      
      const selectedTableName = tables.find(t => t.id === selectedTable)?.name || 'Bilinmeyen Tablo';
      pdf.setFontSize(12);
      pdf.text(`Tablo: ${selectedTableName}`, pageWidth / 2, 60, { align: 'center' });
      pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, 70, { align: 'center' });
      
      // Add formulas applied section
      if (formulas.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Uygulanan Formuller:', 15, 90);
        
        const formulaTableData = formulas.map((formula, index) => [
          (index + 1).toString(),
          formula.name,
          formula.formula,
          formula.active ? 'Aktif' : 'Pasif'
        ]);
        
        autoTable(pdf, {
          startY: 100,
          head: [['#', 'Formul Adi', 'Formul', 'Durum']],
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
      
      // Add charts with improved capture
      if (charts.length > 0) {
        for (let i = 0; i < charts.length; i++) {
          const chart = charts[i];
          const chartElement = document.getElementById(`chart-${chart.id}`);
          
          if (chartElement) {
            // Add new page for each chart
            if (currentPage > 1) pdf.addPage();
            currentPage++;
            
            // Add page header
            pdf.setFontSize(14);
            pdf.text(`Grafik ${i + 1}: ${chart.title}`, 15, 20);
            
            try {
              console.log(`📊 Capturing chart ${i + 1}: ${chart.title}`);
              
              // Enhanced chart capture with better settings
              const canvas = await html2canvas(chartElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: false,
                foreignObjectRendering: false,
                width: chartElement.offsetWidth,
                height: chartElement.offsetHeight,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                // Remove problematic CSS handling
                onclone: (clonedDoc) => {
                  const allElements = clonedDoc.querySelectorAll('*');
                  allElements.forEach((el) => {
                    const element = el as HTMLElement;
                    
                    // Fix any CSS color issues
                    if (element.style.color && element.style.color.includes('oklch')) {
                      element.style.color = '#333333';
                    }
                    if (element.style.backgroundColor && element.style.backgroundColor.includes('oklch')) {
                      element.style.backgroundColor = '#ffffff';
                    }
                    
                    // Remove any transforms that might cause issues
                    element.style.transform = 'none';
                    element.style.filter = 'none';
                  });
                  
                  // Force redraw of canvas elements
                  const canvasElements = clonedDoc.querySelectorAll('canvas');
                  canvasElements.forEach((canvas) => {
                    canvas.style.display = 'block';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                  });
                }
              });
              
              console.log(`✅ Chart ${i + 1} captured successfully - ${canvas.width}x${canvas.height}`);
              
              const imgData = canvas.toDataURL('image/png', 1.0);
              const imgWidth = pageWidth - 30;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              
              // Ensure image fits on page
              const maxHeight = pageHeight - 80;
              const finalHeight = Math.min(imgHeight, maxHeight);
              const finalWidth = (canvas.width * finalHeight) / canvas.height;
              
              // Add chart to PDF
              pdf.addImage(imgData, 'PNG', 15, 30, finalWidth, finalHeight);
              
              console.log(`📄 Chart ${i + 1} added to PDF successfully`);
              
            } catch (chartError) {
              console.error(`❌ Error capturing chart ${i + 1}:`, chartError);
              
              // Add error message to PDF
              pdf.setFontSize(12);
              pdf.setTextColor(255, 0, 0);
              pdf.text(`Grafik yakalama hatasi: ${(chartError as Error).message}`, 15, 50);
              pdf.setTextColor(0, 0, 0);
            }
            
            // Add chart details
            pdf.setFontSize(10);
            pdf.text(`Degisken: ${chart.variable}`, 15, pageHeight - 30);
            pdf.text(`Tarih Araligi: ${chart.startDate} - ${chart.endDate}`, 15, pageHeight - 20);
            pdf.text(`Grafik Turu: ${chart.type === 'line' ? 'Cizgi' : 'Sutun'} Grafik`, 15, pageHeight - 10);
          } else {
            console.error(`❌ Chart element not found: chart-${chart.id}`);
          }
        }
      }
      
      // Add highlighted table if enabled
      if (showTable && analysisData.tableData) {
        if (currentPage > 1) pdf.addPage();
        currentPage++;
        
        // Add table header
        pdf.setFontSize(14);
        pdf.text('Veri Tablosu (Formul Vurgulamali)', 15, 20);
        
        if (formulas.length > 0) {
          pdf.setFontSize(10);
          pdf.text(`Uygulanan Formuller: ${formulas.map(f => f.name).join(', ')}`, 15, 30);
        }
        
        // Prepare table data for PDF
        const { columns, data } = analysisData.tableData;
        const tableData = data.map((row: (string | number | null)[]) => {
          return row.map((cell: string | number | null) => {
            if (cell === null) return '';
            // Handle Turkish characters properly
            const cellStr = String(cell);
            return cellStr
              .replace(/ç/g, 'c').replace(/Ç/g, 'C')
              .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
              .replace(/ı/g, 'i').replace(/İ/g, 'I')
              .replace(/ö/g, 'o').replace(/Ö/g, 'O')
              .replace(/ş/g, 's').replace(/Ş/g, 'S')
              .replace(/ü/g, 'u').replace(/Ü/g, 'U');
          });
        });
        
        // Create row tracking for highlights
        const rowIds: string[] = [];
        data.forEach((_, rowIndex) => {
          rowIds.push(`row-${rowIndex}`);
        });
        
        // Generate the table with highlighting
        autoTable(pdf, {
          head: [columns],
          body: tableData,
          startY: 40,
          margin: { top: 40 },
          styles: {
            fontSize: 7,
            cellPadding: 1.5,
            font: 'helvetica'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            font: 'helvetica'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
          didParseCell: function(data: CellHookData) {
            if (data.section === 'body') {
              const actualRowId = rowIds[data.row.index];
              const colName = columns[data.column.index];
              
              if (!colName) return;
              
              // Check if this cell is highlighted
              const highlight = highlightedCells.find(cell => 
                (cell.row === actualRowId || cell.row === `${data.row.index}`) && cell.col === colName
              );
              
              if (highlight) {
                const rgb = hexToRgb(highlight.color);
                
                // Apply highlighting with proper type handling
                if (data.cell.styles) {
                  (data.cell.styles as unknown as Record<string, unknown>).fillColor = [rgb.r, rgb.g, rgb.b, 0.3];
                  (data.cell.styles as unknown as Record<string, unknown>).textColor = [0, 0, 0];
                  (data.cell.styles as unknown as Record<string, unknown>).fontStyle = 'bold';
                  (data.cell.styles as unknown as Record<string, unknown>).lineWidth = 0.5;
                  (data.cell.styles as unknown as Record<string, unknown>).lineColor = [rgb.r, rgb.g, rgb.b];
                }
              }
            }
          }
        });
        
        // Add legend for highlighted cells
        if (highlightedCells.length > 0) {
          const lastTableY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 40;
          let yPos = lastTableY + 15;
          
          // Check if we need a new page for the legend
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFontSize(12);
          pdf.text('Formul Vurgulamalari:', 15, yPos);
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
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(15, yPos - 4, 6, 6, 'F');
            
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
        pdf.text('Kullanilan Formuller:', 15, 20);
        
        let yPos = 35;
        
        formulas.forEach((formula, index) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
          }
          
          const rgb = hexToRgb(formula.color);
          
          // Draw color indicator
          pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          pdf.rect(15, yPos - 4, 6, 6, 'F');
          
          // Add formula details
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${formula.name}`, 25, yPos);
          
          if (formula.description) {
            yPos += 6;
            pdf.setFontSize(8);
            pdf.text(`Aciklama: ${formula.description}`, 25, yPos);
          }
          
          yPos += 6;
          pdf.setFontSize(8);
          pdf.text(`Formul: ${formula.formula}`, 25, yPos);
          pdf.text(`Tip: ${formula.type === 'CELL_VALIDATION' ? 'Hucre Dogrulama' : 'Iliskisel'}`, 25, yPos + 6);
          
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
          'Cinar Cevre Laboratuvari - Kapsamli Analiz Raporu',
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
          <FcLineChart className="mr-2 h-6 w-6" />
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
        <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={addChart}
              disabled={!analysisData?.variables.length}
              className={`flex items-center px-4 py-2 rounded-md ${
                !analysisData?.variables.length
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <FcPlus className="mr-2" />
              Grafik Ekle
            </button>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTable}
                onChange={(e) => setShowTable(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">Tabloyu Göster</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            {formulas.length > 0 && (
              <div className="flex items-center space-x-2">
                <FcRules className="h-5 w-5" />
                <span className="text-sm text-gray-600">
                  {formulas.length} formül aktif
                </span>
                {highlightedCells.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {highlightedCells.length} hücre vurgulandı
                  </span>
                )}
              </div>
            )}

            <button
              onClick={exportComprehensivePDF}
              disabled={(!charts.length && !showTable) || loading}
              className={`flex items-center px-4 py-2 rounded-md ${
                (!charts.length && !showTable) || loading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <FcPrint className="mr-2" />
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

      {/* Charts Container */}
      <div ref={chartsContainerRef} className="space-y-6 mb-6">
        {charts.length === 0 && selectedTable ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              &ldquo;Grafik Ekle&rdquo; butonuna tıklayarak analiz grafiklerinizi oluşturmaya başlayın.
            </p>
          </div>
        ) : null}

        {charts.map((chart, index) => (
          <div key={chart.id} id={`chart-${chart.id}`} className="bg-white rounded-lg shadow-md p-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MdDragIndicator className="text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold">Grafik {index + 1}</h3>
              </div>
              <button
                onClick={() => removeChart(chart.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <MdDelete className="h-5 w-5" />
              </button>
            </div>

            {/* Chart Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                  Başlangıç Tarihi
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
                  Bitiş Tarihi
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

            {/* Chart Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grafik Başlığı
              </label>
              <input
                type="text"
                value={chart.title}
                onChange={(e) => updateChart(chart.id, { title: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Grafik başlığını girin"
              />
            </div>

            {/* Chart Display */}
            <div className="h-[400px]">
              {chart.type === 'line' ? (
                <Line data={getChartData(chart)} options={getChartOptions(chart)} />
              ) : (
                <Bar data={getChartData(chart)} options={getChartOptions(chart)} />
              )}
            </div>
          </div>
        ))}
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