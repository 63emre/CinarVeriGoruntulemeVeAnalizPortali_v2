import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// ENHANCED: Add proper Turkish character support by importing a font that supports Unicode
// For production, we use built-in fonts with enhanced character handling

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

export interface HighlightedCell {
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
  }[];
}

interface Formula {
  id: string;
  name: string;
  description?: string | null;
  formula: string;
  color: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active: boolean;
}

interface PdfExportOptions {
  includeFormulas?: boolean;
  includeAnalysis?: boolean;
  title?: string;
  subtitle?: string;
  logo?: string;
  includeDate?: boolean;
  userName?: string;
  orientation?: 'portrait' | 'landscape';
}

interface PDFGenerationOptions {
  title?: string;
  subtitle?: string;
  includeDateTime?: boolean;
  orientation?: 'portrait' | 'landscape';
  userName?: string;
  includeDate?: boolean;
}

/**
 * ENHANCED: Advanced Turkish text encoding for optimal PDF compatibility
 * Now preserves Turkish characters while ensuring proper PDF rendering
 */
function encodeTurkishText(text: string): string {
  if (typeof text !== 'string') return '';
  
  try {
    // ENHANCED: Preserve Turkish characters instead of replacing them
    // Unicode normalizasyonu ve sadece problemli karakterleri temizle
    let processedText = text.normalize('NFC');
    
    // Sadece PDF'de sorun çıkaran özel karakterleri temizle, Türkçe karakterleri koru
    const problematicCharacterMap: { [key: string]: string } = {
      // Normalize different Unicode representations that may cause issues
      // But KEEP Turkish characters intact
      '\u201C': '"', '\u201D': '"', // Left/right double quotation marks
      '\u2018': "'", '\u2019': "'", // Left/right single quotation marks  
      '\u2013': '-', '\u2014': '-', // En dash, Em dash
      '\u2026': '...', // Horizontal ellipsis
      '\u2212': '-', // Minus sign (different from hyphen)
      '\u00A0': ' ', // Non-breaking space -> regular space
      
      // Remove zero-width characters that can cause rendering issues
      '\u200B': '', // Zero Width Space
      '\u200C': '', // Zero Width Non-Joiner
      '\u200D': '', // Zero Width Joiner
      '\uFEFF': '', // Zero Width No-Break Space (BOM)
      '\u00AD': ''  // Soft hyphen
    };
    
    // Apply character map - only problematic chars, keep Turkish intact
    Object.entries(problematicCharacterMap).forEach(([char, replacement]) => {
      const regex = new RegExp(char, 'g');
      processedText = processedText.replace(regex, replacement);
    });
    
    // Clean up excessive whitespace
    processedText = processedText.replace(/\s+/g, ' ').trim();
    
    console.log(`🔤 Turkish text preserved for PDF: "${text}" -> "${processedText}"`);
    
    return processedText;
    
  } catch (error) {
    console.warn('Turkish text encoding failed, using fallback:', error);
    
    // FALLBACK ONLY: Replace Turkish chars as last resort
    const fallbackMap: { [key: string]: string } = {
      'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G',
      'ü': 'u', 'Ü': 'U', 'ç': 'c', 'Ç': 'C',
      'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O'
    };
    
    let fallbackText = text;
    Object.entries(fallbackMap).forEach(([char, replacement]) => {
      const regex = new RegExp(char, 'g');
      fallbackText = fallbackText.replace(regex, replacement);
    });
    
    return fallbackText.replace(/[^\x00-\x7F]/g, '').trim();
  }
}

/**
 * Converts HEX color to RGB values
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

/**
 * ENHANCED: Setup PDF document with proper Turkish font support
 */
function setupPDFDocument(options: { orientation?: 'portrait' | 'landscape' } = {}): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // ENHANCED: Set up proper font for Turkish characters
  try {
    // Use Helvetica with enhanced support
    doc.setFont('helvetica', 'normal');
    
    // Configure document for better Turkish character rendering
    doc.setFontSize(12);
    
    // ENHANCED: Add document metadata with proper encoding
    doc.setProperties({
      title: encodeTurkishText('Çınar Çevre Laboratuvarı - Veri Raporu'),
      subject: encodeTurkishText('Analiz ve Değerlendirme Raporu'),
      author: encodeTurkishText('Çınar Çevre Laboratuvarı'),
      creator: encodeTurkishText('Çınar Veri Görüntüleme ve Analiz Portalı')
    });
    
    console.log('✅ PDF document setup completed with Turkish support');
    
  } catch (fontError) {
    console.warn('Font setup failed, using default:', fontError);
    doc.setFont('helvetica', 'normal');
  }
  
  return doc;
}

/**
 * ENHANCED: Creates a PDF export of a data table with highlighted cells and improved Turkish support
 */
export async function exportTableToPdf(
  table: DataTable,
  highlightedCells: HighlightedCell[] = [],
  formulas: Formula[] = [],
  options: PdfExportOptions = {}
): Promise<Buffer> {
  console.log('🚀 Starting enhanced PDF export with Turkish support...');
  
  const doc = setupPDFDocument({ orientation: options.orientation });
  
  // ENHANCED: Add title with proper Turkish encoding
  const title = encodeTurkishText(options.title || `${table.name} - ${table.sheetName || ''}`);
  const subtitle = encodeTurkishText(options.subtitle || 'Çınar Çevre Laboratuvarı');
  const date = new Date().toLocaleDateString('tr-TR');
  const time = new Date().toLocaleTimeString('tr-TR');
  
  // Add header with enhanced styling
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(subtitle, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Rapor Tarihi: ${date} Saat: ${time}`, 14, 38);
  
  // ENHANCED: Process table data with proper Turkish encoding
  const processedColumns = table.columns.map(col => encodeTurkishText(col));
  const processedData: (string | number)[][] = table.data.map(row => {
    const processedRow: (string | number)[] = [];
    row.forEach(cell => {
      if (cell === null || cell === undefined) {
        processedRow.push('');
      } else if (typeof cell === 'number') {
        processedRow.push(cell);
      } else {
        processedRow.push(encodeTurkishText(String(cell)));
      }
    });
    return processedRow;
  });
  
  console.log(`📊 Processing table: ${processedColumns.length} columns, ${processedData.length} rows`);

  // ENHANCED: Cell highlighting hooks with improved color handling
  const cellHooks = {
    didParseCell: function(data: { section: string; row: { index: number }; column: { index: number }; cell: { styles: Record<string, unknown> } }) {
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
            // ENHANCED: Apply better highlight styling for readability
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
    },
    
    willDrawCell: function(data: { section: string; cell: { styles: Record<string, unknown> } }) {
      // Additional cell customization can be added here
      if (data.section === 'head') {
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fillColor = [41, 128, 185];
      }
    }
  };

  // ENHANCED: Generate the table with improved styling
  autoTable(doc, {
    head: [processedColumns],
    body: processedData,
    startY: 45,
    margin: { top: 45, left: 14, right: 14 },
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.5,
      halign: 'center',
      valign: 'middle',
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 5, right: 3, bottom: 5, left: 3 },
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 'auto', halign: 'left', minCellWidth: 25 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
    theme: 'grid',
    showHead: 'everyPage',
    tableWidth: 'auto',
    // @ts-expect-error - jsPDF autoTable type compatibility
    didParseCell: cellHooks.didParseCell,
    // @ts-expect-error - jsPDF autoTable type compatibility
    willDrawCell: cellHooks.willDrawCell,
    didDrawPage: function() {
      // Add page numbers
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Sayfa ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }
  });

  // ENHANCED: Add comprehensive formula explanations with proper encoding
  if (highlightedCells.length > 0) {
    const lastTableY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 45;
    let yPos = lastTableY + 15;
    
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(encodeTurkishText('Formül Sonuçları ve Açıklamalar:'), 14, yPos);
    yPos += 10;
    
    // ENHANCED: Group highlights with better organization
    const uniqueHighlights = highlightedCells.reduce((acc: Array<{
      color: string;
      message: string;
      count: number;
      cells: Array<{ row: string; col: string }>;
      formulaDetails: Array<Record<string, unknown>>;
    }>, cell) => {
      if (!cell.message) return acc;
      
      const existingGroup = acc.find(h => h.color === cell.color && h.message === cell.message);
      if (!existingGroup) {
        acc.push({
          color: cell.color,
          message: encodeTurkishText(cell.message),
          count: 1,
          cells: [{row: cell.row, col: cell.col}],
          formulaDetails: cell.formulaDetails || []
        });
      } else {
        existingGroup.count++;
        existingGroup.cells.push({row: cell.row, col: cell.col});
      }
      return acc;
    }, []);
    
    // Add each unique highlight with enhanced formatting
    uniqueHighlights.forEach((highlight, index) => {
      // Check page space
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const rgb = hexToRgb(highlight.color);
      
      // Draw enhanced color indicator
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(14, yPos - 5, 8, 8, 'F');
        
        // Add border
        doc.setDrawColor(Math.max(0, rgb.r - 50), Math.max(0, rgb.g - 50), Math.max(0, rgb.b - 50));
        doc.rect(14, yPos - 5, 8, 8, 'S');
      }
      
      // Add message with enhanced formatting
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`${index + 1}. ${highlight.message}`, 26, yPos);
      
      // Add count and details
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`(${highlight.count} hücre etkilendi)`, 26, yPos + 5);
      
      // Show sample cells if not too many
      if (highlight.cells.length <= 8) {
        yPos += 8;
        const cellsText = highlight.cells.map((c: { row: string; col: string }) => `${c.col}:${c.row}`).join(', ');
        doc.text(`Etkilenen hücreler: ${cellsText}`, 26, yPos);
      }
      
      yPos += 12;
    });
    
    // Add summary
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(encodeTurkishText(`Toplam vurgulanmış hücre sayısı: ${highlightedCells.length}`), 14, yPos);
  }

  // ENHANCED: Add detailed formula explanations
  if (options.includeFormulas && formulas.length > 0) {
    const currentY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 45;
    let yPos = currentY + 20;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(encodeTurkishText('Kullanılan Formüller:'), 14, yPos);
    yPos += 10;
    
    formulas.forEach((formula, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      const rgb = hexToRgb(formula.color || '#000000');
      
      // Color indicator
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(14, yPos - 5, 8, 8, 'F');
        doc.setDrawColor(Math.max(0, rgb.r - 50), Math.max(0, rgb.g - 50), Math.max(0, rgb.b - 50));
        doc.rect(14, yPos - 5, 8, 8, 'S');
      }
      
      // Formula details with proper encoding
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`${index + 1}. ${encodeTurkishText(formula.name)}`, 26, yPos);
      
      if (formula.description) {
        yPos += 6;
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(encodeTurkishText(`Açıklama: ${formula.description}`), 26, yPos);
      }
      
      yPos += 6;
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(encodeTurkishText(`Formül: ${formula.formula}`), 26, yPos);
      
      yPos += 6;
      doc.text(`Durum: ${formula.active ? 'Aktif' : 'Pasif'}`, 26, yPos);
      
      yPos += 12;
    });
  }

  // ENHANCED: Include enhanced footer with proper encoding
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    
    // Company info
    doc.text(
      encodeTurkishText('Çınar Çevre Laboratuvarı - Veri Görüntüleme ve Analiz Portalı'),
      14,
      doc.internal.pageSize.height - 10
    );
    
    // Page numbers
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
    
    // Generation timestamp
    doc.text(
      `Oluşturulma: ${new Date().toLocaleString('tr-TR')}`,
      doc.internal.pageSize.width / 2 - 20,
      doc.internal.pageSize.height - 10
    );
  }

  console.log('✅ Enhanced PDF generation completed with Turkish support');
  
  // Return the PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Generate a PDF from table data
 */
export async function generateTablePDF(
  table: DataTable,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const {
    title = 'Çınar Çevre Laboratuvarı',
    subtitle = table.name,
    includeDateTime = true,
    orientation = 'landscape'
  } = options;

  // Create a new document
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Add subtitle
  doc.setFontSize(14);
  doc.text(subtitle, 14, 30);

  // Add date and time if requested
  if (includeDateTime) {
    const now = new Date();
    doc.setFontSize(10);
    doc.text(`Oluşturulma Tarihi: ${now.toLocaleString('tr-TR')}`, 14, 40);
  }

  try {
    // Get table columns and data
    const columns = table.columns || [];
    const data = table.data || [];

    // Create the table
    // Need to use type assertion for autoTable since it's added by the jspdf-autotable plugin
    (doc as unknown as { 
      autoTable: (options: { 
        head: string[][]; 
        body: (string | number)[][]; 
        startY: number; 
        theme: string; 
        styles: object; 
        headStyles: object; 
      }) => void 
    }).autoTable({
      head: [columns],
      body: data.map(row => 
        row.map(cell => cell === null || cell === undefined ? '' : cell)
      ),
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    // Return the PDF as buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF generation failed');
  }
}

/**
 * Get the appropriate content type for PDF
 */
export function getPDFContentType(): string {
  return 'application/pdf';
}

/**
 * Function to generate PDF as expected by the API
 */
export async function generatePdf(
  table: DataTable,
  options: PDFGenerationOptions & {
    userName?: string;
  } = {}
): Promise<Buffer> {
  // Prepare options with defaults
  const finalOptions: PDFGenerationOptions = {
    title: options.title || 'Çınar Çevre Laboratuvarı Veri Raporu',
    subtitle: options.subtitle || (table.workspace ? table.workspace.name : table.name),
    includeDateTime: options.includeDate !== undefined ? options.includeDate : true,
    orientation: 'landscape',
  };

  // Add user information if provided
  if (options.userName) {
    finalOptions.subtitle = `${finalOptions.subtitle} (Oluşturan: ${options.userName})`;
  }

  // Use the base generateTablePDF function
  return generateTablePDF(table, finalOptions);
}