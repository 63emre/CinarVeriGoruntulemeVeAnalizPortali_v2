import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Define a custom DataTable interface since it's not exported from Prisma client
export interface DataTable {
  id: string;
  name: string;
  sheetName: string;
  workspaceId: string;
  uploadedAt: Date;
  updatedAt: Date;
  columns: string[];
  data: (string | number)[][];
  workspace?: {
    name: string;
    description?: string;
  };
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