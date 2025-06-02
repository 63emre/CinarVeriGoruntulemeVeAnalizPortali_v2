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

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Define a custom DataTable interface since it's not exported from Prisma client
export interface DataTable {
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

// ENHANCED: Turkish Character Support
// Türkçe karakterlerin PDF'de doğru gösterilmesi için gelişmiş font yönetimi
const TURKISH_FONT_CONFIG = {
  fontName: 'helvetica',
  encoding: 'UTF-8',
  supportedChars: {
    'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G',
    'ş': 's', 'Ş': 'S', 'ç': 'c', 'Ç': 'C',
    'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O'
  }
};

/**
 * ENHANCED: Superior Turkish text encoding for PDF compatibility
 * Bu fonksiyon Türkçe karakterleri PDF'de doğru gösterilecek şekilde optimize eder
 */
function encodeTurkishTextForPDF(text: string): string {
  if (typeof text !== 'string') return '';
  
  try {
    // ENHANCED: Preserve Turkish characters instead of replacing them
    // Unicode normalizasyonu ve sadece problemli karakterleri temizle
    let processedText = text.normalize('NFC');
    
    // Sadece PDF'de sorun çıkaran özel karakterleri temizle, Türkçe karakterleri koru
    const problematicCharacterMap: { [key: string]: string } = {
      // Bozuk/alternatif karakter temizleme - Türkçe karakterleri KORUYORUZ
      '\u201C': '"', '\u201D': '"', // Tırnak işaretleri
      '\u2018': "'", '\u2019': "'", // Tek tırnak
      '\u2013': '-', '\u2014': '-', // En/em dash
      '\u2026': '...', // Üç nokta
      '\u00A0': ' ', // Kırılmaz boşluk -> normal boşluk
      '\u200B': '', '\u200C': '', '\u200D': '', '\uFEFF': '', // Görünmez karakterler
      '\u2212': '-', // Unicode minus sign -> regular dash
      '\u00AD': '' // Soft hyphen
    };
    
    // Sadece problemli karakterleri değiştir, Türkçe karakterleri koru
    Object.entries(problematicCharacterMap).forEach(([char, replacement]) => {
      const regex = new RegExp(char, 'g');
      processedText = processedText.replace(regex, replacement);
    });
    
    // Fazla boşlukları temizle
    processedText = processedText.replace(/\s+/g, ' ').trim();
    
    console.log(`🔤 Turkish text preserved for PDF: "${text}" -> "${processedText}"`);
    
    return processedText;
    
  } catch (error) {
    console.warn('Turkish text encoding failed, using safe fallback:', error);
    
    // FALLBACK: Sadece güvenlik için, normal durumda buraya girmemeli
    // Türkçe karakterleri ASCII karşılıklarıyla değiştir
    const safeFallbackMap: { [key: string]: string } = {
      'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G', 
      'ü': 'u', 'Ü': 'U', 'ç': 'c', 'Ç': 'C',
      'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O'
    };
    
    let fallbackText = text;
    Object.entries(safeFallbackMap).forEach(([char, replacement]) => {
      const regex = new RegExp(char, 'g');
      fallbackText = fallbackText.replace(regex, replacement);
    });
    
    return fallbackText.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, ' ').trim();
  }
}

/**
 * ENHANCED: PDF dokümanı için Türkçe font konfigürasyonu
 */
function setupTurkishPDFDocument(options: { orientation?: 'portrait' | 'landscape' } = {}): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });
  
  try {
    // Helvetica fontunu Türkçe karakter desteği ile ayarla
    doc.setFont(TURKISH_FONT_CONFIG.fontName, 'normal');
    doc.setFontSize(12);
    
    // ENHANCED: PDF metadata'yı Türkçe desteği ile ayarla
    doc.setProperties({
      title: encodeTurkishTextForPDF('Çınar Çevre Laboratuvarı - Veri Raporu'),
      subject: encodeTurkishTextForPDF('Analiz ve Değerlendirme Raporu'),
      author: encodeTurkishTextForPDF('Çınar Çevre Laboratuvarı'),
      creator: encodeTurkishTextForPDF('Çınar Veri Görüntüleme ve Analiz Portalı'),
      keywords: encodeTurkishTextForPDF('analiz, veri, çevre, laboratuvar, rapor')
    });
    
    console.log('✅ Turkish PDF document setup completed successfully');
    
  } catch (error) {
    console.warn('Turkish font setup failed, using default:', error);
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
  doc.text(encodeTurkishTextForPDF(title), pageWidth / 2, 15, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(encodeTurkishTextForPDF(subtitle), pageWidth / 2, 25, { align: 'center' });
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
    doc.text(encodeTurkishTextForPDF(`Hazırlayan: ${userName}`), pageWidth / 2, footerY, { align: 'center' });
  }
  
  // Page number
  doc.text(`Sayfa ${pageNumber} / ${totalPages}`, pageWidth - 14, footerY, { align: 'right' });
}

/**
 * Enhanced PDF export with chart support
 */
export async function exportTableWithChartsToPdf(
  table: DataTable,
  highlightedCells: EnhancedHighlightedCell[] = [],
  formulas: EnhancedFormula[] = [],
  options: EnhancedPdfOptions = {}
): Promise<Buffer> {
  console.log('🚀 Starting enhanced PDF export with charts...');
  
  const doc = setupTurkishPDFDocument({ 
    orientation: options.orientation
  });
  
  const title = encodeTurkishTextForPDF(options.title || `${table.name} - ${table.sheetName || ''}`);
  const subtitle = encodeTurkishTextForPDF(options.subtitle || 'Çınar Çevre Laboratuvarı');
  
  let currentPage = 1;
  let totalPages = 1; // Will be updated
  
  // Add main header
  addEnhancedHeaderFooter(doc, currentPage, totalPages, title, subtitle, options.userName);
  
  // Process table data with enhanced Turkish encoding
  const processedColumns = table.columns.map(col => encodeTurkishTextForPDF(col));
  const processedData: (string | number)[][] = table.data.map(row => {
    return row.map(cell => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell === 'number') return cell;
      return encodeTurkishTextForPDF(String(cell));
    });
  });
  
  console.log(`📊 Processing table: ${processedColumns.length} columns, ${processedData.length} rows`);

  // ENHANCED: Cell highlighting with proper typing
  const cellHooks = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: function(data: any) {
      const rowIndex = data.row.index;
      const colIndex = data.column.index;
      
      if (data.section === 'body' && rowIndex < processedData.length && colIndex < processedColumns.length) {
        const rowId = `row-${rowIndex + 1}`;
        const colId = processedColumns[colIndex];
        
        // Find highlighting for this cell
        const highlight = highlightedCells.find(
          cell => cell.row === rowId && cell.col === colId
        );
        
        if (highlight) {
          console.log(`🎨 Applying highlight to cell [${rowId}, ${colId}] with color ${highlight.color}`);
          
          const rgb = hexToRgb(highlight.color);
          
          if (rgb) {
            // Apply better highlight styling for readability
            data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
            
            // Calculate optimal text color for contrast
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            data.cell.styles.textColor = brightness > 128 ? [0, 0, 0] : [255, 255, 255];
            
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.lineWidth = 1.5;
            
            // Enhanced border for multi-formula cells
            if (highlight.formulaIds && highlight.formulaIds.length > 1) {
              data.cell.styles.lineWidth = 2;
              data.cell.styles.lineColor = [Math.max(0, rgb.r - 30), Math.max(0, rgb.g - 30), Math.max(0, rgb.b - 30)];
            } else {
              data.cell.styles.lineColor = [Math.max(0, rgb.r - 50), Math.max(0, rgb.g - 50), Math.max(0, rgb.b - 50)];
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
        const chartTitle = encodeTurkishTextForPDF(chart.title);
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
            doc.text(encodeTurkishTextForPDF(filterText), pageWidth / 2, 60, { align: 'center' });
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
          encodeTurkishTextForPDF(`Grafik yüklenirken hata oluştu: ${chart.title}`),
          doc.internal.pageSize.width / 2,
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
    doc.text(encodeTurkishTextForPDF('Kullanılan Formüller'), 14, yPos);
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
      doc.text(`${index + 1}. ${encodeTurkishTextForPDF(formula.name)}`, 28, yPos);
      
      if (formula.description) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(encodeTurkishTextForPDF(formula.description), 28, yPos + 5);
        yPos += 5;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Formül: ${encodeTurkishTextForPDF(formula.formula)}`, 28, yPos + 5);
      
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

export { encodeTurkishTextForPDF, setupTurkishPDFDocument, captureChartAsImage }; 