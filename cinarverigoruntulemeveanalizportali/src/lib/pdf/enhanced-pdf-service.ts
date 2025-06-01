/**
 * Enhanced PDF Service with Turkish Character Support and Chart Integration
 * 
 * This service provides advanced PDF generation capabilities including:
 * - Enhanced Turkish character encoding and display
 * - Chart capture and integration
 * - Multi-page layout with headers/footers
 * - Formula highlighting and explanations
 * - High-quality image rendering
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Define interfaces for better type safety
export interface EnhancedDataTable {
  id: string;
  name: string;
  sheetName?: string;
  workspaceId: string;
  uploadedAt: Date;
  updatedAt: Date;
  columns: string[];
  data: (string | number | null)[][];
  workspace?: {
    name: string;
    description?: string | null;
  };
}

export interface EnhancedHighlightedCell {
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

interface EnhancedFormula {
  id: string;
  name: string;
  description?: string | null;
  formula: string;
  color: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active: boolean;
}

export interface ChartElement {
  id: string;
  type: 'line' | 'bar' | 'scatter' | 'area';
  title: string;
  element: HTMLElement;
  filters?: {
    dateRange?: { start: string; end: string };
    variables?: string[];
    workspace?: string;
    table?: string;
  };
}

interface EnhancedPdfOptions {
  includeFormulas?: boolean;
  includeAnalysis?: boolean;
  includeCharts?: boolean;
  charts?: ChartElement[];
  title?: string;
  subtitle?: string;
  logo?: string;
  includeDate?: boolean;
  userName?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'a3' | 'letter';
  quality?: 'low' | 'medium' | 'high';
}

interface AutoTableCellData {
  section: string;
  row: { index: number };
  column: { index: number };
  cell: {
    styles: Record<string, unknown>;
    text?: string;
  };
}

/**
 * Enhanced Turkish text encoding with full Unicode support
 */
function enhancedTurkishTextEncoding(text: string): string {
  if (typeof text !== 'string') return '';
  
  try {
    // First pass: normalize Unicode representation
    let processedText = text.normalize('NFC');
    
    // Enhanced Turkish character mapping - only map problematic variants
    const turkishCharacterMap: { [key: string]: string } = {
      // Normalize problematic Unicode variants to standard Turkish characters
      '\u0131': 'ı', // LATIN SMALL LETTER DOTLESS I
      '\u0130': 'İ', // LATIN CAPITAL LETTER I WITH DOT ABOVE
      '\u011F': 'ğ', // LATIN SMALL LETTER G WITH BREVE
      '\u011E': 'Ğ', // LATIN CAPITAL LETTER G WITH BREVE
      '\u015F': 'ş', // LATIN SMALL LETTER S WITH CEDILLA
      '\u015E': 'Ş', // LATIN CAPITAL LETTER S WITH CEDILLA
      '\u00E7': 'ç', // LATIN SMALL LETTER C WITH CEDILLA
      '\u00C7': 'Ç', // LATIN CAPITAL LETTER C WITH CEDILLA
      '\u00FC': 'ü', // LATIN SMALL LETTER U WITH DIAERESIS
      '\u00DC': 'Ü', // LATIN CAPITAL LETTER U WITH DIAERESIS
      '\u00F6': 'ö', // LATIN SMALL LETTER O WITH DIAERESIS
      '\u00D6': 'Ö', // LATIN CAPITAL LETTER O WITH DIAERESIS
      
      // Remove problematic typographic characters
      '\u201C': '"', '\u201D': '"', // Smart quotes
      '\u2018': "'", '\u2019': "'", // Smart apostrophes
      '\u2013': '-', '\u2014': '-', // En/em dashes
      '\u2026': '...', // Ellipsis
      '\u00A0': ' ', // Non-breaking space
      '\u200B': '', '\u200C': '', '\u200D': '', // Zero-width characters
      '\uFEFF': '', // Byte order mark
    };
    
    // Apply character normalization
    Object.entries(turkishCharacterMap).forEach(([char, replacement]) => {
      const regex = new RegExp(char, 'g');
      processedText = processedText.replace(regex, replacement);
    });
    
    // Clean up extra whitespace and punctuation
    processedText = processedText
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/,+/g, ',')
      .replace(/^\s*,\s*/, '')
      .replace(/\s*,\s*$/, '');
    
    console.log(`📝 Enhanced Turkish encoding: "${text}" -> "${processedText}"`);
    return processedText;
    
  } catch (error) {
    console.warn('Turkish text encoding failed, using fallback:', error);
    // Fallback to ASCII transliteration
    return text
      .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g')
      .replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o')
      .replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
      .replace(/[^\x00-\x7F]/g, '') // Remove any remaining non-ASCII
      .replace(/\s+/g, ' ').trim();
  }
}

/**
 * Setup PDF document with enhanced Turkish font support
 */
function setupEnhancedPDFDocument(options: { 
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'a3' | 'letter';
} = {}): jsPDF {
  const format = options.pageSize || 'a4';
  const orientation = options.orientation || 'landscape';
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format
  });
  
  try {
    // Use Helvetica with Unicode support
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Set document metadata with proper encoding
    doc.setProperties({
      title: enhancedTurkishTextEncoding('Çınar Çevre Laboratuvarı - Veri Raporu'),
      subject: enhancedTurkishTextEncoding('Analiz ve Değerlendirme Raporu'),
      author: enhancedTurkishTextEncoding('Çınar Çevre Laboratuvarı'),
      creator: enhancedTurkishTextEncoding('Çınar Veri Görüntüleme ve Analiz Portalı'),
      keywords: enhancedTurkishTextEncoding('veri analizi, çevre, laboratuvar, formül, grafik')
    });
    
    console.log('✅ Enhanced PDF document setup completed');
    
  } catch (fontError) {
    console.warn('Enhanced font setup failed, using default:', fontError);
    doc.setFont('helvetica', 'normal');
  }
  
  return doc;
}

/**
 * Convert HTML element containing charts to image with enhanced quality
 */
async function captureChartAsImage(
  element: HTMLElement, 
  quality: 'low' | 'medium' | 'high' = 'high'
): Promise<string> {
  const scaleMap = { low: 1, medium: 2, high: 3 };
  const scale = scaleMap[quality];
  
  try {
    console.log('📸 Capturing chart with quality:', quality, 'scale:', scale);
    
    // Wait for any pending animations or data loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      // Enhanced options for better chart capture
      ignoreElements: (elem) => {
        // Ignore tooltips, overlays, and other non-essential elements
        const isTooltip = elem.classList.contains('tooltip');
        const isOverlay = elem.classList.contains('overlay');
        
        // Type-safe check for style.display
        let isHidden = false;
        if (elem instanceof HTMLElement) {
          isHidden = elem.style.display === 'none';
        }
        
        return isTooltip || isOverlay || isHidden;
      },
      onclone: (clonedDocument) => {
        // Ensure all styles are properly applied to the cloned document
        const clonedElement = clonedDocument.querySelector(`[data-chart-id="${element.dataset.chartId}"]`);
        if (clonedElement) {
          // Force visibility and proper sizing
          (clonedElement as HTMLElement).style.visibility = 'visible';
          (clonedElement as HTMLElement).style.opacity = '1';
        }
      }
    });
    
    const dataURL = canvas.toDataURL('image/png');
    console.log('✅ Chart captured successfully, size:', dataURL.length);
    
    return dataURL;
  } catch (error) {
    console.error('❌ Error capturing chart:', error);
    throw new Error(`Chart capture failed: ${(error as Error).message}`);
  }
}

/**
 * Add enhanced header and footer to PDF pages
 */
function addEnhancedHeaderFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  title: string,
  subtitle?: string,
  userName?: string
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(enhancedTurkishTextEncoding(title), pageWidth / 2, 15, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(enhancedTurkishTextEncoding(subtitle), pageWidth / 2, 25, { align: 'center' });
  }
  
  // Header line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);
  
  // Footer
  const footerY = pageHeight - 15;
  
  // Footer line
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  
  // Date and time
  const date = new Date().toLocaleDateString('tr-TR');
  const time = new Date().toLocaleTimeString('tr-TR');
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`${date} ${time}`, 14, footerY);
  
  // User name (if provided)
  if (userName) {
    doc.text(enhancedTurkishTextEncoding(`Hazırlayan: ${userName}`), pageWidth / 2, footerY, { align: 'center' });
  }
  
  // Page number
  doc.text(`Sayfa ${pageNumber} / ${totalPages}`, pageWidth - 14, footerY, { align: 'right' });
}

/**
 * Enhanced PDF export with chart support
 */
export async function exportTableWithChartsToPdf(
  table: EnhancedDataTable,
  highlightedCells: EnhancedHighlightedCell[] = [],
  formulas: EnhancedFormula[] = [],
  options: EnhancedPdfOptions = {}
): Promise<Buffer> {
  console.log('🚀 Starting enhanced PDF export with charts...');
  
  const doc = setupEnhancedPDFDocument({ 
    orientation: options.orientation,
    pageSize: options.pageSize 
  });
  
  const title = enhancedTurkishTextEncoding(options.title || `${table.name} - ${table.sheetName || ''}`);
  const subtitle = enhancedTurkishTextEncoding(options.subtitle || 'Çınar Çevre Laboratuvarı');
  
  let currentPage = 1;
  let totalPages = 1; // Will be updated
  
  // Add main header
  addEnhancedHeaderFooter(doc, currentPage, totalPages, title, subtitle, options.userName);
  
  // Process table data with enhanced Turkish encoding
  const processedColumns = table.columns.map(col => enhancedTurkishTextEncoding(col));
  const processedData: (string | number)[][] = table.data.map(row => {
    return row.map(cell => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell === 'number') return cell;
      return enhancedTurkishTextEncoding(String(cell));
    });
  });
  
  console.log(`📊 Processing table: ${processedColumns.length} columns, ${processedData.length} rows`);

  // Enhanced cell highlighting with better visual representation
  const cellHooks = {
    didParseCell: function(data: AutoTableCellData) {
      const rowIndex = data.row.index;
      const colIndex = data.column.index;
      
      if (data.section === 'body' && rowIndex < processedData.length && colIndex < processedColumns.length) {
        const rowId = `row-${rowIndex + 1}`;
        const colId = processedColumns[colIndex];
        
        const highlight = highlightedCells.find(
          cell => cell.row === rowId && cell.col === colId
        );
        
        if (highlight) {
          console.log(`🎨 Applying enhanced highlight to cell [${rowId}, ${colId}]`);
          
          const rgb = hexToRgb(highlight.color);
          if (rgb) {
            data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
            
            // Enhanced text contrast calculation
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            data.cell.styles.textColor = brightness > 128 ? [0, 0, 0] : [255, 255, 255];
            
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.lineWidth = 1.5;
            
            // Special styling for multi-formula cells
            if (highlight.formulaIds && highlight.formulaIds.length > 1) {
              data.cell.styles.lineWidth = 2.5;
              data.cell.styles.lineColor = [Math.max(0, rgb.r - 40), Math.max(0, rgb.g - 40), Math.max(0, rgb.b - 40)];
              
              // Add visual indicator for multi-formula cells
              const originalText = data.cell.text || '';
              data.cell.text = `${originalText} ★`;
            }
          }
        }
      }
    }
  };

  // Generate the main table
  autoTable(doc, {
    head: [processedColumns],
    body: processedData,
    startY: 35,
    margin: { top: 35, left: 14, right: 14, bottom: 25 },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
    didParseCell: cellHooks.didParseCell,
  });

  // Add charts if provided
  if (options.includeCharts && options.charts && options.charts.length > 0) {
    console.log(`📈 Adding ${options.charts.length} charts to PDF`);
    
    for (const chart of options.charts) {
      // Add new page for each chart
      doc.addPage();
      currentPage++;
      
      addEnhancedHeaderFooter(doc, currentPage, totalPages, title, subtitle, options.userName);
      
      try {
        // Capture chart as image
        const chartImage = await captureChartAsImage(chart.element, options.quality);
        
        // Calculate optimal chart placement
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const availableWidth = pageWidth - 28; // Margins
        const availableHeight = pageHeight - 70; // Header + footer space
        
        // Chart title
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        const chartTitle = enhancedTurkishTextEncoding(chart.title);
        doc.text(chartTitle, pageWidth / 2, 50, { align: 'center' });
        
        // Add filter information if available
        if (chart.filters) {
          let filterText = '';
          if (chart.filters.dateRange) {
            filterText += `Tarih: ${chart.filters.dateRange.start} - ${chart.filters.dateRange.end}`;
          }
          if (chart.filters.variables && chart.filters.variables.length > 0) {
            if (filterText) filterText += ' | ';
            filterText += `Değişkenler: ${chart.filters.variables.join(', ')}`;
          }
          
          if (filterText) {
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(enhancedTurkishTextEncoding(filterText), pageWidth / 2, 60, { align: 'center' });
          }
        }
        
        // Add chart image
        const chartStartY = chart.filters ? 70 : 60;
        const maxChartHeight = availableHeight - (chartStartY - 35);
        
        // Calculate image dimensions maintaining aspect ratio
        const imgElement = new Image();
        imgElement.src = chartImage;
        
        const aspectRatio = imgElement.width / imgElement.height;
        let chartWidth = availableWidth;
        let chartHeight = chartWidth / aspectRatio;
        
        if (chartHeight > maxChartHeight) {
          chartHeight = maxChartHeight;
          chartWidth = chartHeight * aspectRatio;
        }
        
        const chartX = (pageWidth - chartWidth) / 2;
        
        doc.addImage(chartImage, 'PNG', chartX, chartStartY, chartWidth, chartHeight);
        
        console.log(`✅ Chart "${chart.title}" added successfully`);
        
      } catch (error) {
        console.error(`❌ Error adding chart "${chart.title}":`, error);
        
        // Add error message instead of chart
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69);
        doc.text(
          enhancedTurkishTextEncoding(`Grafik yüklenirken hata oluştu: ${chart.title}`),
          pageWidth / 2,
          100,
          { align: 'center' }
        );
      }
    }
  }

  // Add formula explanations (similar to original but enhanced)
  if (options.includeFormulas && formulas.length > 0) {
    doc.addPage();
    currentPage++;
    
    addEnhancedHeaderFooter(doc, currentPage, totalPages, title, subtitle, options.userName);
    
    let yPos = 50;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(enhancedTurkishTextEncoding('Kullanılan Formüller'), 14, yPos);
    yPos += 15;
    
    formulas.forEach((formula, index) => {
      if (yPos > 250) {
        doc.addPage();
        currentPage++;
        addEnhancedHeaderFooter(doc, currentPage, totalPages, title, subtitle, options.userName);
        yPos = 50;
      }
      
      const rgb = hexToRgb(formula.color || '#000000');
      
      // Color indicator
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(14, yPos - 6, 10, 10, 'F');
        doc.setDrawColor(Math.max(0, rgb.r - 50), Math.max(0, rgb.g - 50), Math.max(0, rgb.b - 50));
        doc.rect(14, yPos - 6, 10, 10, 'S');
      }
      
      // Formula details
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(`${index + 1}. ${enhancedTurkishTextEncoding(formula.name)}`, 28, yPos);
      
      if (formula.description) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(enhancedTurkishTextEncoding(formula.description), 28, yPos + 5);
        yPos += 5;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Formül: ${enhancedTurkishTextEncoding(formula.formula)}`, 28, yPos + 5);
      
      yPos += 15;
    });
  }

  // Update total pages and regenerate headers/footers
  totalPages = currentPage;
  
  // Go through all pages and update page numbers
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    // Re-add footer with correct page numbers
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const footerY = pageHeight - 15;
    
    // Clear previous page number area
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - 40, footerY - 5, 25, 8, 'F');
    
    // Add correct page number
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Sayfa ${page} / ${totalPages}`, pageWidth - 14, footerY, { align: 'right' });
  }
  
  console.log('✅ Enhanced PDF generation completed');
  
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Utility function to convert hex to RGB
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  if (!hex) return null;
  
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) return null;
  
  const bigint = parseInt(cleaned, 16);
  if (isNaN(bigint)) return null;
  
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export { enhancedTurkishTextEncoding, setupEnhancedPDFDocument, captureChartAsImage }; 