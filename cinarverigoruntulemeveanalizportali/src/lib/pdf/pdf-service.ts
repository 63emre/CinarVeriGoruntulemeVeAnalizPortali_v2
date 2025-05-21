import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Define a custom DataTable interface since it's not exported from Prisma client
export interface DataTable {
  id: string;
  name: string;
  sheetName: string;
  workspaceId: string;
  uploadedAt: Date;
  updatedAt: Date;
  columns: any;
  data: any;
  workspace?: {
    name: string;
    description?: string | null;
  };
}

export interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message?: string;
}

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  color: string | null;
}

interface PdfExportOptions {
  includeFormulas?: boolean;
  includeAnalysis?: boolean;
  title?: string;
  subtitle?: string;
  logo?: string;
  includeDate?: boolean;
  userName?: string;
}

/**
 * Converts HEX color to RGB values
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  // Default to black if no color provided
  if (!hex) return { r: 0, g: 0, b: 0 };
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Creates a PDF export of a data table with highlighted cells based on formulas
 */
export async function exportTableToPdf(
  table: DataTable,
  highlightedCells: HighlightedCell[] = [],
  formulas: Formula[] = [],
  options: PdfExportOptions = {}
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  const title = options.title || `${table.name} - ${table.sheetName}`;
  const subtitle = options.subtitle || 'Çınar Çevre Laboratuvarı';
  const date = new Date().toLocaleDateString('tr-TR');
  const time = new Date().toLocaleTimeString('tr-TR');
  
  // Add header
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  doc.setFontSize(12);
  doc.text(subtitle, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Tarih: ${date} Saat: ${time}`, 14, 38);
    // Create CellHooks object to handle cell highlighting
  const cellHooks = {    didParseCell: function(data: any) {
      // Skip header cells
      if (data.section === 'head') return;
      
      // Get the actual row ID from our tracked rowIds
      // Body rows start at index 0 in the PDF (since header is separate)
      const actualRowId = rowIds[data.row.index];
      
      // Get column name - make sure it's not undefined
      const colName = table.columns[data.column.index];
      
      if (!colName) {
        console.log(`Warning: Cannot get column name for index ${data.column.index}`);
        return;
      }
      
      // Log for debugging with reduced verbosity
      if (data.row.index === 0 && data.column.index === 0) {
        console.log(`Processing cells for PDF highlighting, total highlighted cells: ${highlightedCells.length}`);
      }
      
      // Check if this cell is highlighted
      const highlight = highlightedCells.find(cell => 
        (cell.row === actualRowId || cell.row === `${data.row.index}`) && cell.col === colName
      );
      
      if (highlight) {
        console.log(`Found highlight for row ${highlight.row}, col ${highlight.col}, color ${highlight.color}`);
        
        // Get RGB color from HEX
        const rgb = hexToRgb(highlight.color);
        
        // Apply color with reduced opacity for background
        if (rgb) {
          // Create a light version of the color for the background
          data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b, 0.2]; // 20% opacity for better visibility
          data.cell.styles.textColor = [Math.max(0, rgb.r - 100), Math.max(0, rgb.g - 100), Math.max(0, rgb.b - 100)]; // Darker text for better contrast
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.lineWidth = 0.5; // Add border
          data.cell.styles.lineColor = [rgb.r, rgb.g, rgb.b]; // Border color matches highlight
        }
      }
    },    willDrawCell: function(data: any) {
      // Add tooltip icon to highlighted cells
      if (data.section === 'body') {
        const actualRowId = rowIds[data.row.index];
        const colName = table.columns[data.column.index];
        
        if (!colName) return;
        
        const highlight = highlightedCells.find(cell => 
          (cell.row === actualRowId || cell.row === `${data.row.index}`) && cell.col === colName
        );
        
        if (highlight && highlight.message) {
          // Calc position for tooltip indicator
          const x = data.cell.x + data.cell.width - 2;
          const y = data.cell.y + 2;
          
          // Draw a small triangle in the corner to indicate there's a tooltip
          const doc = data.doc;
          const rgb = hexToRgb(highlight.color);
          if (rgb) {
            doc.setFillColor(rgb.r, rgb.g, rgb.b);
            doc.triangle(
              x, y,
              x - 3, y,
              x, y + 3,
              'F'
            );
          }
        }
      }
    }
  };
    // Parse data for the table and track row IDs for highlighting
  const rowIds: string[] = [];
  const tableData = table.data.map((row: any[], rowIndex: number) => {
    // Store the row ID for highlighting
    rowIds.push(`row-${rowIndex}`);
    return row.map((cell: any) => cell === null ? '' : String(cell));
  });
  
  // Generate the table
  autoTable(doc, {
    head: [table.columns],
    body: tableData,
    startY: 45,
    margin: { top: 45 },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    // @ts-ignore - type definition issue with jspdf-autotable
    didParseCell: cellHooks.didParseCell,
    // @ts-ignore
    willDrawCell: cellHooks.willDrawCell,
  });
  
  // Add explanation of cell highlights if there are any
  if (highlightedCells.length > 0) {
    const lastTableY = (doc as any).lastAutoTable.finalY || 45;
    let yPos = lastTableY + 15;
    
    doc.setFontSize(12);
    doc.text('Uyarılar ve Açıklamalar:', 14, yPos);
    yPos += 10;
    
    // Group highlightedCells by color and message
    const uniqueHighlights = highlightedCells.reduce((acc: any[], cell) => {
      const existing = acc.find(h => h.color === cell.color && h.message === cell.message);
      if (!existing) {
        acc.push({
          color: cell.color,
          message: cell.message
        });
      }
      return acc;
    }, []);
    
    // Add each unique highlight message with its color
    uniqueHighlights.forEach((highlight, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const rgb = hexToRgb(highlight.color);
      
      // Draw color indicator
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(14, yPos - 4, 6, 6, 'F');
      }
      
      // Add message
      doc.setFontSize(9);
      doc.text(`${index + 1}. ${highlight.message}`, 24, yPos);
      
      yPos += 8;
    });
  }
  
  // Add formula explanations if requested
  if (options.includeFormulas && formulas.length > 0) {
    const lastTableY = (doc as any).lastAutoTable.finalY || 45;
    
    doc.setFontSize(12);
    doc.text('Formül Açıklamaları:', 14, lastTableY + 15);
    
    let yPos = lastTableY + 25;
    
    formulas.forEach((formula, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Get color for formula
      const rgb = hexToRgb(formula.color || '#000000');
      
      // Draw color indicator
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(14, yPos - 4, 6, 6, 'F');
      }
      
      // Add formula name and formula text
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${formula.name}`, 24, yPos);
      
      if (formula.description) {
        yPos += 6;
        doc.setFontSize(8);
        doc.text(`Açıklama: ${formula.description}`, 24, yPos);
      }
      
      yPos += 6;
      doc.setFontSize(8);
      doc.text(`Formül: ${formula.formula}`, 24, yPos);
      
      yPos += 12;
    });
  }
  
  // Include company information and footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      'Çınar Çevre Laboratuvarı - Veri Görüntüleme ve Analiz Portalı',
      14,
      doc.internal.pageSize.height - 10
    );
    
    // Add page numbers
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );  }
  
  // Return the PDF as buffer (not blob, for server environment)
  return Buffer.from(doc.output('arraybuffer'));
}

export interface PDFGenerationOptions {
  title?: string;
  subtitle?: string;
  includeDateTime?: boolean;
  orientation?: 'portrait' | 'landscape';
  userName?: string;
  includeDate?: boolean;
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
      body: data,
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