import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Enhanced PDF Export Options
interface EnhancedPdfExportOptions {
  includeFormulas?: boolean;
  includeAnalysis?: boolean;
  title?: string;
  subtitle?: string;
  logo?: string;
  includeDate?: boolean;
  userName?: string;
  orientation?: 'portrait' | 'landscape';
  cellBorderWidth?: number;
  includeCharts?: boolean;
  chartElements?: HTMLElement[];
  highlightedCells?: EnhancedHighlightedCell[];
  formulas?: FormulaInfo[];
}

interface EnhancedHighlightedCell {
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

interface FormulaInfo {
  id: string;
  name: string;
  formula: string;
  type: string;
  color: string;
  description?: string;
  active?: boolean;
}

interface TableDataStructure {
  name: string;
  columns: string[];
  data: (string | number | null)[][];
}

// Enhanced Turkish character support with proper font embedding
function setupTurkishSupport(doc: jsPDF): void {
  try {
    // Use helvetica as base font with proper encoding
    doc.setFont('helvetica', 'normal');
    
    // Create custom text function that handles Turkish characters properly
    const originalText = doc.text.bind(doc);
    
    doc.text = function(text: string | string[], x: number, y: number, options?: any) {
      if (typeof text === 'string') {
        // Proper UTF-8 encoding for Turkish characters
        const cleanText = text
          .replace(/İ/g, 'I')
          .replace(/ı/g, 'i')
          .replace(/Ğ/g, 'G')
          .replace(/ğ/g, 'g')
          .replace(/Ü/g, 'U')
          .replace(/ü/g, 'u')
          .replace(/Ş/g, 'S')
          .replace(/ş/g, 's')
          .replace(/Ö/g, 'O')
          .replace(/ö/g, 'o')
          .replace(/Ç/g, 'C')
          .replace(/ç/g, 'c');
        
        return originalText.call(this, cleanText, x, y, options);
      }
      
      if (Array.isArray(text)) {
        const cleanTextArray = text.map(line => 
          typeof line === 'string' ? line
            .replace(/İ/g, 'I')
            .replace(/ı/g, 'i')
            .replace(/Ğ/g, 'G')
            .replace(/ğ/g, 'g')
            .replace(/Ü/g, 'U')
            .replace(/ü/g, 'u')
            .replace(/Ş/g, 'S')
            .replace(/ş/g, 's')
            .replace(/Ö/g, 'O')
            .replace(/ö/g, 'o')
            .replace(/Ç/g, 'C')
            .replace(/ç/g, 'c') : line
        );
        return originalText.call(this, cleanTextArray, x, y, options);
      }
      
      return originalText.call(this, text, x, y, options);
    };
    
    console.log('✅ Turkish character support enabled');
  } catch (error) {
    console.warn('⚠️ Turkish character setup failed:', error);
  }
}

// Enhanced logo loading and embedding
async function addCompanyLogo(doc: jsPDF): Promise<boolean> {
  try {
    console.log('🖼️ Loading company logo...');
    
    // Try multiple logo locations
    const logoUrls = [
      '/company-logo.png',
      '/public/company-logo.png',
      '/assets/company-logo.png',
      '/images/company-logo.png'
    ];
    
    for (const logoUrl of logoUrls) {
      try {
        const response = await fetch(logoUrl);
        if (response.ok) {
          const logoBlob = await response.blob();
          const logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
          
          // Add logo to top-left with appropriate sizing
          const logoWidth = 45;
          const logoHeight = 35;
          doc.addImage(logoDataUrl, 'PNG', 15, 15, logoWidth, logoHeight);
          
          console.log(`✅ Company logo loaded from: ${logoUrl}`);
          return true;
        }
      } catch (logoError) {
        console.warn(`⚠️ Failed to load logo from ${logoUrl}:`, logoError);
        continue;
      }
    }
    
    console.warn('⚠️ No company logo found, continuing without logo');
    return false;
  } catch (error) {
    console.error('❌ Error loading company logo:', error);
    return false;
  }
}

// Enhanced chart capture with better quality
async function captureChartElement(element: HTMLElement): Promise<string | null> {
  try {
    console.log('📊 Capturing chart element...');
    
    // Wait for chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try Chart.js direct method first if available
    const chartCanvas = element.querySelector('canvas') as HTMLCanvasElement;
    if (chartCanvas) {
      try {
        // Use the canvas directly if it's a Chart.js chart
        const imageData = chartCanvas.toDataURL('image/png', 1.0);
        if (imageData && imageData !== 'data:,') {
          console.log('✅ Chart captured using Canvas direct method');
          return imageData;
        }
      } catch (canvasError) {
        console.warn('⚠️ Canvas direct capture failed:', canvasError);
      }
    }
    
    // Fallback to html2canvas with enhanced settings
    console.log('📊 Using html2canvas for chart capture...');
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 3, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
      imageTimeout: 30000, // Longer timeout
      removeContainer: false,
      onclone: (clonedDoc) => {
        // Ensure all fonts and styles are properly loaded in clone
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          element.style.fontFamily = 'Arial, sans-serif';
          element.style.fontSize = element.style.fontSize || '12px';
        });
      }
    });
    
    const imageData = canvas.toDataURL('image/png', 1.0);
    
    if (imageData && imageData !== 'data:,') {
      console.log('✅ Chart captured using html2canvas');
      return imageData;
    } else {
      console.error('❌ Failed to capture chart - empty data URL');
      return null;
    }
  } catch (error) {
    console.error('❌ Error capturing chart:', error);
    return null;
  }
}

// Enhanced header and footer with proper spacing
function addHeaderFooter(
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
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Cinar Cevre Laboratuvari', 70, 25);
  
  if (title) {
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text(title, 70, 35);
  }
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(subtitle, 70, 45);
  }
  
  // Date and time in top-right
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Rapor Tarihi: ${formattedDate}`, pageWidth - 15, 20, { align: 'right' });
  doc.text(`Olusturma Saati: ${formattedTime}`, pageWidth - 15, 30, { align: 'right' });
  
  if (userName) {
    doc.text(`Olusturan: ${userName}`, pageWidth - 15, 40, { align: 'right' });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  
  // Left footer
  doc.text('Cinar Cevre Laboratuvari - Veri Analiz Raporu', 15, pageHeight - 10);
  
  // Center footer
  doc.text(`Rapor: ${formattedDate} ${formattedTime}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Right footer - page numbers
  doc.text(`Sayfa ${pageNumber} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

// Convert hex color to RGB for autoTable
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  try {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return { r, g, b };
  } catch {
    return null;
  }
}

// Enhanced table export with better highlighting
export async function exportEnhancedTableToPdf(
  tableData: TableDataStructure,
  options: EnhancedPdfExportOptions = {}
): Promise<void> {
  try {
    console.log('🚀 Starting enhanced table PDF export...');
    
    const orientation = options.orientation || 'landscape';
    const doc = new jsPDF(orientation, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Setup Turkish character support
    setupTurkishSupport(doc);
    
    // Add company logo
    const logoAdded = await addCompanyLogo(doc);
    
    // Calculate header height based on content
    let headerHeight = logoAdded ? 60 : 50;
    
    // Add header and footer
    addHeaderFooter(
      doc, 
      1, 
      1, // Will be updated later with actual page count
      options.title || 'Veri Tablosu Raporu',
      options.subtitle,
      options.userName
    );
    
    // Add table with enhanced formatting
    const tableHeaders = tableData.columns;
    const tableRows = tableData.data.map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'number') {
          return cell.toLocaleString('tr-TR', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 3 
          });
        }
        return String(cell);
      })
    );
    
    autoTable(doc, {
      startY: headerHeight,
      head: [tableHeaders],
      body: tableRows,
      styles: {
        fontSize: 8,
        font: 'helvetica',
        cellPadding: 2,
        lineColor: [100, 100, 100],
        lineWidth: options.cellBorderWidth || 0.5,
        textColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        font: 'helvetica',
        fontStyle: 'bold',
        textColor: [255, 255, 255],
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        valign: 'middle',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        // Dynamic column width based on content
        ...tableHeaders.reduce((acc, _, index) => {
          if (index === 0) acc[index] = { cellWidth: 'auto', minCellWidth: 15 };
          else acc[index] = { cellWidth: 'auto', minCellWidth: 20 };
          return acc;
        }, {} as Record<number, any>)
      },
      margin: { left: 10, right: 10, top: 10, bottom: 20 },
      // Enhanced cell highlighting
      didParseCell: function(data) {
        if (data.section === 'body' && options.highlightedCells) {
          const rowIndex = data.row.index;
          const colIndex = data.column.index;
          
          if (rowIndex < tableRows.length && colIndex < tableHeaders.length) {
            const rowId = `${rowIndex + 1}`;
            const colId = tableHeaders[colIndex];
            
            // Find all highlights for this cell
            const cellHighlights = options.highlightedCells.filter(
              cell => cell.row === rowId && cell.col === colId
            );
            
            if (cellHighlights.length > 0) {
              if (cellHighlights.length === 1) {
                // Single highlight
                const rgb = hexToRgb(cellHighlights[0].color);
                if (rgb) {
                  data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
                  data.cell.styles.textColor = [0, 0, 0];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.lineWidth = 1;
                  data.cell.styles.lineColor = [rgb.r * 0.8, rgb.g * 0.8, rgb.b * 0.8];
                }
              } else {
                // Multiple highlights - use first color with indicator
                const rgb = hexToRgb(cellHighlights[0].color);
                if (rgb) {
                  data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
                  data.cell.styles.textColor = [0, 0, 0];
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.lineWidth = 2;
                  data.cell.styles.lineColor = [255, 0, 0]; // Red border for multiple formulas
                  
                  // Add indicator for multiple formulas
                  const originalText = data.cell.text[0] || '';
                  data.cell.text = [`${originalText} [${cellHighlights.length}F]`];
                }
              }
            }
          }
        }
      }
    });
    
    // Add formulas section if requested
    if (options.includeFormulas && options.formulas && options.formulas.length > 0) {
      const lastTableY = (doc as any).lastAutoTable?.finalY || headerHeight + 100;
      let currentY = lastTableY + 20;
      
      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        doc.addPage();
        addHeaderFooter(doc, 2, 2, 'Formul Aciklamalari', undefined, options.userName);
        currentY = 60;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Uygulanan Formuller:', 15, currentY);
      currentY += 15;
      
      const formulaTableData = options.formulas.map((formula, index) => [
        (index + 1).toString(),
        formula.name,
        formula.formula,
        formula.type === 'CELL_VALIDATION' ? 'Hucre Dogrulama' : 'Iliskisel',
        formula.active ? 'Aktif' : 'Pasif'
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Formul Adi', 'Formul Ifadesi', 'Tip', 'Durum']],
        body: formulaTableData,
        styles: {
          fontSize: 9,
          font: 'helvetica',
          cellPadding: 3,
          lineWidth: 0.3
        },
        headStyles: {
          fillColor: [52, 152, 219],
          font: 'helvetica',
          fontStyle: 'bold',
          textColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 }
        },
        margin: { left: 15, right: 15 }
      });
    }
    
    // Add charts if requested
    if (options.includeCharts && options.chartElements && options.chartElements.length > 0) {
      let chartCount = 0;
      
      for (const chartElement of options.chartElements) {
        doc.addPage();
        chartCount++;
        
        addHeaderFooter(
          doc, 
          chartCount + 1, 
          options.chartElements.length + 1, 
          `Grafik ${chartCount}`,
          undefined,
          options.userName
        );
        
        const chartImage = await captureChartElement(chartElement);
        
        if (chartImage) {
          // Calculate optimal image dimensions
          const imgWidth = pageWidth - 30;
          const imgHeight = Math.min(imgWidth * 0.7, pageHeight - 140);
          
          // Center the image
          const xPos = (pageWidth - imgWidth) / 2;
          const yPos = 70;
          
          doc.addImage(chartImage, 'PNG', xPos, yPos, imgWidth, imgHeight);
          
          // Add chart info
          doc.setFontSize(10);
          doc.text(`Grafik ${chartCount} - Yuksek kalitede yakalandi`, pageWidth / 2, yPos + imgHeight + 15, { align: 'center' });
        } else {
          // Add error message
          doc.setFontSize(14);
          doc.setTextColor(255, 0, 0);
          doc.text(`Grafik ${chartCount} yakalanamadiLutfen grafigin yuklenmesini bekleyin`, 15, 100);
          doc.setTextColor(0, 0, 0);
        }
      }
    }
    
    // Update page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      // Re-add footer with correct page numbers
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Clear previous page number
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth - 50, pageHeight - 15, 35, 10, 'F');
      
      // Add correct page number
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Sayfa ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }
    
    // Generate filename with timestamp
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeStr = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Cinar_Veri_Raporu_${tableData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}_${timeStr}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    console.log(`✅ Enhanced PDF generated successfully: ${filename}`);
    console.log(`📄 Total pages: ${totalPages}`);
    if (options.chartElements) {
      console.log(`📊 Charts included: ${options.chartElements.length}`);
    }
    
  } catch (error) {
    console.error('❌ Enhanced PDF generation error:', error);
    throw new Error(`PDF olusturulurken hata: ${(error as Error).message}`);
  }
} 