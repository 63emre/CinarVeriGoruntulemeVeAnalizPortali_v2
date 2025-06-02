import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import { encodeTurkishTextForPDF, setupTurkishPDFDocument } from '@/lib/pdf/enhanced-pdf-service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// ENHANCED: Pizza Slice Visualization Interface
interface PizzaSliceData {
  colors: string[];
  messages: string[];
  count: number;
}

// ENHANCED: Helper function to draw pizza slice cell
function drawPizzaSliceCell(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  sliceData: PizzaSliceData
): void {
  const { colors, count } = sliceData;
  
  if (count === 1) {
    // Single formula - normal rectangle
    const rgb = hexToRgb(colors[0]);
    if (rgb) {
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(x, y, width, height, 'F');
    }
    return;
  }
  
  // Multiple formulas - create visual segments
  if (count === 2) {
    // Split vertically (2 halves)
    const halfWidth = width / 2;
    
    colors.forEach((color, index) => {
      const rgb = hexToRgb(color);
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(x + (index * halfWidth), y, halfWidth, height, 'F');
      }
    });
  } else if (count === 3) {
    // Split into 3 segments: 1/3, 1/3, 1/3 vertical
    const segmentWidth = width / 3;
    
    colors.forEach((color, index) => {
      const rgb = hexToRgb(color);
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(x + (index * segmentWidth), y, segmentWidth, height, 'F');
      }
    });
  } else if (count === 4) {
    // Split into 4 quadrants
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    colors.forEach((color, index) => {
      const rgb = hexToRgb(color);
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        const quadX = x + (index % 2) * halfWidth;
        const quadY = y + Math.floor(index / 2) * halfHeight;
        doc.rect(quadX, quadY, halfWidth, halfHeight, 'F');
      }
    });
  } else {
    // More than 4 formulas - create a gradient-like blend
    const blendedColor = blendMultipleColors(colors);
    const rgb = hexToRgb(blendedColor);
    if (rgb) {
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(x, y, width, height, 'F');
      
      // Add indicator for multiple formulas
      doc.setFillColor(255, 255, 255);
      doc.setFontSize(6);
      doc.text(`${count}`, x + width - 3, y + 3);
    }
  }
  
  // Add subtle border to all segments
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  doc.rect(x, y, width, height, 'S');
}

// ENHANCED: Blend multiple colors for 5+ formulas
function blendMultipleColors(colors: string[]): string {
  const rgbColors = colors.map(color => hexToRgb(color)).filter(rgb => rgb !== null);
  
  if (rgbColors.length === 0) return '#cccccc';
  
  const avgR = Math.round(rgbColors.reduce((sum, rgb) => sum + rgb!.r, 0) / rgbColors.length);
  const avgG = Math.round(rgbColors.reduce((sum, rgb) => sum + rgb!.g, 0) / rgbColors.length);
  const avgB = Math.round(rgbColors.reduce((sum, rgb) => sum + rgb!.b, 0) / rgbColors.length);
  
  return `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, '');
  
  if (cleaned.length !== 6) return null;
  
  const bigint = parseInt(cleaned, 16);
  if (isNaN(bigint)) return null;
  
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return { r, g, b };
}

// POST /api/workspaces/[workspaceId]/tables/[tableId]/pdf
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Access the currently logged in user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the parameters
    const { workspaceId, tableId } = await context.params;

    // First check if the table exists and if user has access to it
    const table = await prisma.dataTable.findUnique({
      where: {
        id: tableId,
        workspaceId: workspaceId,
      },
      include: {
        workspace: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // If not admin, check if user has access to the workspace
    if (currentUser.role !== 'ADMIN') {
      const hasAccess = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId,
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }
    
    // Get request body for optional parameters
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      console.error('Error parsing JSON body:', error);
      requestData = {}; // Default empty object if JSON parsing fails
    }
    
    const { title, subtitle, includeDate, highlightedCells = [] } = requestData;
    
    // Ensure highlightedCells is an array
    const validHighlightedCells = Array.isArray(highlightedCells) ? highlightedCells : [];
    
    console.log(`🎨 Generating enhanced PDF with ${validHighlightedCells.length} highlighted cells`);
    
    // ENHANCED: Create PDF with Turkish support and pizza slice visualization
    const doc = setupTurkishPDFDocument({ orientation: 'landscape' });
    
    // Add title with Turkish encoding
    const pdfTitle = encodeTurkishTextForPDF(title || table.name);
    const pdfSubtitle = encodeTurkishTextForPDF(subtitle || table.workspace.name);
    const date = new Date().toLocaleDateString('tr-TR');
    const time = new Date().toLocaleTimeString('tr-TR');
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(pdfTitle, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(pdfSubtitle, 14, 30);
    
    if (includeDate !== false) {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Rapor Tarihi: ${date} Saat: ${time}`, 14, 38);
    }
    
    // Process table data with Turkish encoding
    const columns = Array.isArray(table.columns) ? table.columns : Object.values(table.columns as any || {});
    const rawData = Array.isArray(table.data) ? table.data : Object.values(table.data as any || {});
    
    const processedColumns = columns.map(col => encodeTurkishTextForPDF(String(col)));
    const processedData = rawData.map((row: any) => {
      if (Array.isArray(row)) {
        return row.map((cell: any) => encodeTurkishTextForPDF(cell === null ? '' : String(cell)));
      }
      return Object.values(row || {}).map((cell: any) => encodeTurkishTextForPDF(cell === null ? '' : String(cell)));
    });
    
    // ENHANCED: Process highlighted cells for pizza slice visualization
    const pizzaSliceMap = new Map<string, PizzaSliceData>();
    
    validHighlightedCells.forEach((cell: any) => {
      const cellKey = `${cell.row}-${cell.col}`;
      
      if (pizzaSliceMap.has(cellKey)) {
        const existing = pizzaSliceMap.get(cellKey)!;
        existing.colors.push(cell.color);
        existing.messages.push(cell.message || '');
        existing.count++;
      } else {
        pizzaSliceMap.set(cellKey, {
          colors: [cell.color],
          messages: [cell.message || ''],
          count: 1
        });
      }
    });
    
    console.log(`🍕 Created pizza slice map with ${pizzaSliceMap.size} unique cells`);
    
    // Helper function to get pizza slice data for a cell
    function getPizzaSliceData(rowIndex: number, colIndex: number): PizzaSliceData | null {
      const rowId = `row-${rowIndex}`;
      const colName = processedColumns[colIndex];
      
      if (!colName) return null;
      
      const possibleRowIds = [
        rowId,
        `row-${rowIndex + 1}`,
        `${rowIndex}`,
        `${rowIndex + 1}`
      ];
      
      for (const testRowId of possibleRowIds) {
        const cellKey = `${testRowId}-${colName}`;
        if (pizzaSliceMap.has(cellKey)) {
          return pizzaSliceMap.get(cellKey)!;
        }
      }
      
      return null;
    }
    
    // Generate the table with enhanced highlighting
    autoTable(doc, {
      head: [processedColumns],
      body: processedData,
      startY: 45,
      margin: { top: 45, left: 14, right: 14 },
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
      // ENHANCED: Custom cell rendering with pizza slice support
      didDrawCell: function(data: any) {
        if (data.section === 'body') {
          const pizzaData = getPizzaSliceData(data.row.index, data.column.index);
          
          if (pizzaData && pizzaData.count > 1) {
            // Draw pizza slice visualization over the cell
            const cellX = data.cell.x;
            const cellY = data.cell.y;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            
            drawPizzaSliceCell(doc, cellX, cellY, cellWidth, cellHeight, pizzaData);
            
            console.log(`🍕 Drew pizza slice for cell [${data.row.index}, ${data.column.index}] with ${pizzaData.count} formulas`);
          }
        }
      },
      didParseCell: function(data: any) {
        if (data.section === 'body') {
          const pizzaData = getPizzaSliceData(data.row.index, data.column.index);
          
          if (pizzaData) {
            if (pizzaData.count === 1) {
              // Single formula - normal highlighting
              const rgb = hexToRgb(pizzaData.colors[0]);
              if (rgb) {
                data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b, 0.3];
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.lineWidth = 0.8;
                data.cell.styles.lineColor = [rgb.r, rgb.g, rgb.b];
              }
            } else {
              // Multiple formulas - special preparation for pizza slice
              data.cell.styles.fillColor = [255, 255, 255, 0]; // Transparent background
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.lineWidth = 1.2;
              data.cell.styles.lineColor = [100, 100, 100];
            }
            
            console.log(`🎨 Prepared cell [${data.row.index}, ${data.column.index}] for ${pizzaData.count} formula(s)`);
          }
        }
      }
    });
    
    // ENHANCED: Add comprehensive explanation of highlights
    if (pizzaSliceMap.size > 0) {
      const lastTableY = (doc as any).lastAutoTable.finalY + 15;
      let yPos = lastTableY;
      
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(encodeTurkishTextForPDF('🍕 Formül Sonuçları ve Çoklu Görselleştirme'), 14, yPos);
      yPos += 12;
      
      // Create grouped explanations
      const groupedExplanations = new Map<string, { 
        colors: string[]; 
        messages: string[];
        cellCount: number;
        cells: string[];
      }>();
      
      pizzaSliceMap.forEach((pizzaData, cellKey) => {
        const colorKey = pizzaData.colors.sort().join(',');
        
        if (groupedExplanations.has(colorKey)) {
          const existing = groupedExplanations.get(colorKey)!;
          existing.cellCount++;
          existing.cells.push(cellKey);
        } else {
          groupedExplanations.set(colorKey, {
            colors: pizzaData.colors,
            messages: pizzaData.messages,
            cellCount: 1,
            cells: [cellKey]
          });
        }
      });
      
      let explanationIndex = 1;
      groupedExplanations.forEach((group, colorKey) => {
        // Check page space
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        
        // Draw color indicators for each formula in the group
        let xOffset = 14;
        group.colors.forEach((color, idx) => {
          const rgb = hexToRgb(color);
          if (rgb) {
            doc.setFillColor(rgb.r, rgb.g, rgb.b);
            doc.rect(xOffset, yPos - 4, 8, 8, 'F');
            doc.setDrawColor(100, 100, 100);
            doc.rect(xOffset, yPos - 4, 8, 8, 'S');
            xOffset += 10;
          }
        });
        
        // Add explanation text
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        const explanationText = group.colors.length > 1 
          ? `${explanationIndex}. Çoklu Formül Eşleşmesi (${group.colors.length} formül)`
          : `${explanationIndex}. Tek Formül Eşleşmesi`;
        
        doc.text(encodeTurkishTextForPDF(explanationText), xOffset + 5, yPos);
        yPos += 7;
        
        // Add formula details
        group.messages.forEach((message, idx) => {
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.text(encodeTurkishTextForPDF(`   • ${message}`), 20, yPos);
          yPos += 5;
        });
        
        // Add affected cells count
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(encodeTurkishTextForPDF(`   Etkilenen hücre sayısı: ${group.cellCount}`), 20, yPos);
        yPos += 10;
        
        explanationIndex++;
      });
      
      // Add pizza slice legend
      if (Array.from(groupedExplanations.values()).some(group => group.colors.length > 1)) {
        yPos += 5;
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(encodeTurkishTextForPDF('🔍 Çoklu Formül Görselleştirme Rehberi:'), 14, yPos);
        yPos += 8;
        
        const legendItems = [
          '• 2 Formül: Hücre dikey olarak ikiye bölünür',
          '• 3 Formül: Hücre üç eşit dikey segmente bölünür', 
          '• 4 Formül: Hücre dört köşe kuadrantına bölünür',
          '• 5+ Formül: Karışık renk + formül sayısı göstergesi'
        ];
        
        legendItems.forEach(item => {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(encodeTurkishTextForPDF(item), 20, yPos);
          yPos += 5;
        });
      }
      
      // Add summary
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(encodeTurkishTextForPDF(`📊 Toplam vurgulanmış hücre sayısı: ${validHighlightedCells.length}`), 14, yPos);
    }
    
    // Add page numbers and footer with Turkish support
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        encodeTurkishTextForPDF('Çınar Çevre Laboratuvarı - Veri Görüntüleme ve Analiz Portalı'),
        14,
        doc.internal.pageSize.height - 10
      );
      
      doc.text(
        `Sayfa ${i} / ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    // Convert to buffer for response
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Create a new NextResponse with the PDF
    const response = new NextResponse(pdfBuffer);
    
    // Set the appropriate headers
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${String(table.name).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_enhanced_report.pdf"`);
    
    return response;
  } catch (error) {
    console.error('Error generating enhanced PDF:', error);
    return NextResponse.json(
      { message: 'Error generating PDF' },
      { status: 500 }
    );
  }
}