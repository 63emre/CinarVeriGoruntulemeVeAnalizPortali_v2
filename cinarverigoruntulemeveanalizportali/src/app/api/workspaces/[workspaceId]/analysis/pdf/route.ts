import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import { encodeTurkishTextForPDF, setupTurkishPDFDocument } from '@/lib/pdf/enhanced-pdf-service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar';
  variable: string;
  startDate: string;
  endDate: string;
  color: string;
}

// POST /api/workspaces/[workspaceId]/analysis/pdf
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
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
    const { workspaceId } = await context.params;

    // Check if user has access to the workspace
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
    
    // Get request body
    const requestData = await request.json();
    const { 
      charts = [], 
      tableId, 
      tableName, 
      title, 
      subtitle, 
      includeDate = true, 
      userName = 'Portal Kullanıcısı' 
    } = requestData;
    
    console.log(`🎨 Generating analysis PDF with ${charts.length} charts for table: ${tableName}`);
    
    // Create PDF with Turkish support
    const doc = setupTurkishPDFDocument({ orientation: 'landscape' });
    
    // Add title with Turkish encoding
    const pdfTitle = encodeTurkishTextForPDF(title || `${tableName} - Grafik Analizi`);
    const pdfSubtitle = encodeTurkishTextForPDF(subtitle || 'Çınar Çevre Laboratuvarı Veri Görüntüleme ve Analiz Portalı');
    const date = new Date().toLocaleDateString('tr-TR');
    const time = new Date().toLocaleTimeString('tr-TR');
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(pdfTitle, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(pdfSubtitle, 14, 30);
    
    if (includeDate) {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Rapor Tarihi: ${date} Saat: ${time}`, 14, 38);
      doc.text(`Oluşturan: ${encodeTurkishTextForPDF(userName)}`, 14, 46);
    }
    
    let yPos = 60;
    
    // Add charts information
    if (charts.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(encodeTurkishTextForPDF(`📊 Seçili Grafikler (${charts.length} adet)`), 14, yPos);
      yPos += 12;
      
      // Create charts summary table
      const chartHeaders = ['Grafik Adı', 'Tür', 'Değişken', 'Başlangıç', 'Bitiş', 'Renk'];
      const chartRows = charts.map((chart: ChartData) => [
        encodeTurkishTextForPDF(chart.title),
        chart.type === 'line' ? 'Çizgi Grafik' : 'Sütun Grafik',
        encodeTurkishTextForPDF(chart.variable),
        encodeTurkishTextForPDF(chart.startDate),
        encodeTurkishTextForPDF(chart.endDate),
        chart.color
      ]);
      
      autoTable(doc, {
        head: [chartHeaders],
        body: chartRows,
        startY: yPos,
        margin: { top: yPos, left: 14, right: 14 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          font: 'helvetica',
          textColor: [40, 40, 40],
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        columnStyles: {
          5: { // Color column
            cellWidth: 20,
            halign: 'center',
          }
        },
        didDrawCell: function(data: any) {
          if (data.section === 'body' && data.column.index === 5) {
            // Draw color indicator
            const colorValue = data.cell.raw;
            if (colorValue && colorValue.startsWith('#')) {
              const rgb = hexToRgb(colorValue);
              if (rgb) {
                doc.setFillColor(rgb.r, rgb.g, rgb.b);
                const cellX = data.cell.x + 2;
                const cellY = data.cell.y + 2;
                const cellWidth = data.cell.width - 4;
                const cellHeight = data.cell.height - 4;
                doc.rect(cellX, cellY, cellWidth, cellHeight, 'F');
                
                // Add border
                doc.setDrawColor(100, 100, 100);
                doc.rect(cellX, cellY, cellWidth, cellHeight, 'S');
              }
            }
          }
        }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Add analysis summary
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(encodeTurkishTextForPDF('📈 Analiz Özeti'), 14, yPos);
    yPos += 12;
    
    // Add summary information
    const summaryData = [
      ['Analiz Edilen Tablo', encodeTurkishTextForPDF(tableName || 'Bilinmeyen')],
      ['Toplam Grafik Sayısı', charts.length.toString()],
      ['Grafik Türleri', charts.map((c: ChartData) => c.type === 'line' ? 'Çizgi' : 'Sütun').join(', ')],
      ['Analiz Edilen Değişkenler', charts.map((c: ChartData) => c.variable).join(', ')],
      ['Rapor Oluşturma Tarihi', `${date} ${time}`],
      ['Oluşturan Kullanıcı', encodeTurkishTextForPDF(userName)]
    ];
    
    autoTable(doc, {
      body: summaryData,
      startY: yPos,
      margin: { top: yPos, left: 14, right: 14 },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: 'helvetica',
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { 
          fillColor: [240, 240, 240],
          fontStyle: 'bold',
          cellWidth: 60
        },
        1: { 
          cellWidth: 'auto'
        }
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 20;
    
    // Add usage instructions
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(encodeTurkishTextForPDF('🔍 Grafik Analizi Bilgileri'), 14, yPos);
    yPos += 10;
    
    const instructions = [
      '• Bu rapor seçili grafiklerinizin özetini içerir.',
      '• Her grafik belirtilen değişken ve tarih aralığında oluşturulmuştur.',
      '• Grafik renkleriniz yukarıdaki tabloda belirtilmiştir.',
      '• Detaylı veri analizi için tabloları inceleyiniz.',
      '• Formül uygulamaları için tablo görünümünü kullanınız.'
    ];
    
    instructions.forEach(instruction => {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(encodeTurkishTextForPDF(instruction), 20, yPos);
      yPos += 6;
    });
    
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
    response.headers.set('Content-Disposition', `attachment; filename="grafik_analizi_${tableName?.replace(/[^a-z0-9]/gi, '_')}_${date.replace(/\//g, '_')}.pdf"`);
    
    return response;
  } catch (error) {
    console.error('Error generating analysis PDF:', error);
    return NextResponse.json(
      { message: 'Error generating analysis PDF', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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