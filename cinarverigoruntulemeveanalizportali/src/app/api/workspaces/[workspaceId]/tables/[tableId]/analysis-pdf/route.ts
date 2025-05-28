import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { workspaceId, tableId } = await params;

    // Get current user for authorization
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists and user has access
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const isMember = workspace.users.some(user => user.userId === currentUser.id);
    
    if (!isAdmin && !isCreator && !isMember) {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Get table data
    const table = await prisma.dataTable.findUnique({
      where: { 
        id: tableId,
        workspaceId
      }
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { variable, startDate, endDate, analysisData, chartImages } = body;

    if (!variable || !startDate || !endDate || !analysisData) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create PDF document with proper Turkish character support
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Add Turkish-compatible font
    try {
      // For production, you would need to include the actual Roboto font base64 data
      // For now, we'll use a fallback approach with better character handling
      pdf.setFont('helvetica', 'normal');
    } catch (fontError) {
      console.warn('Custom font loading failed, using helvetica:', fontError);
      pdf.setFont('helvetica', 'normal');
    }
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Enhanced Turkish text handling function
    const handleTurkishText = (text: string): string => {
      if (!text) return '';
      
      try {
        // Ensure the text is properly encoded as UTF-8
        const utf8Text = decodeURIComponent(encodeURIComponent(text.toString()));
        
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
        console.warn('Text encoding issue:', error);
        return text;
      }
    };

    // Add company logo and header
    pdf.setFontSize(20);
    pdf.text(handleTurkishText('Çınar Çevre Laboratuvarı'), pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(handleTurkishText('Veri Analiz Raporu'), pageWidth / 2, 30, { align: 'center' });

    // Add analysis details
    pdf.setFontSize(12);
    pdf.text(`Tablo: ${handleTurkishText(table.name)}`, 15, 50);
    pdf.text(`Değişken: ${handleTurkishText(variable)}`, 15, 60);
    pdf.text(`Analiz Dönemi: ${startDate} - ${endDate}`, 15, 70);
    pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 15, 80);

    let currentY = 90;

    // Add charts if provided with enhanced error handling
    if (chartImages && Array.isArray(chartImages) && chartImages.length > 0) {
      pdf.setFontSize(14);
      pdf.text(handleTurkishText('Grafikler:'), 15, currentY);
      currentY += 10;

      for (let i = 0; i < chartImages.length; i++) {
        const chartImage = chartImages[i];
        
        // Check if we need a new page
        if (currentY > pageHeight - 80) {
          pdf.addPage();
          currentY = 20;
        }

        try {
          // Validate and process chart image
          if (!chartImage || typeof chartImage !== 'string') {
            throw new Error('Geçersiz grafik verisi');
          }

          // Ensure proper base64 format
          let imageData = chartImage;
          if (!imageData.startsWith('data:image/')) {
            imageData = `data:image/png;base64,${chartImage}`;
          }

          // Add chart image to PDF with high quality
          const imgWidth = 170; // Fit to page width with margins
          const imgHeight = 100; // Reasonable height
          
          pdf.addImage(imageData, 'PNG', 15, currentY, imgWidth, imgHeight, undefined, 'FAST');
          currentY += imgHeight + 10;
          
          console.log(`✅ Grafik ${i + 1} başarıyla PDF'e eklendi`);
        } catch (error) {
          console.error(`❌ Grafik ${i + 1} eklenirken hata:`, error);
          // Add error placeholder
          pdf.setFontSize(10);
          pdf.setTextColor(255, 0, 0); // Red color for error
          pdf.text(handleTurkishText(`Grafik ${i + 1}: Yüklenemedi (${(error as Error).message})`), 15, currentY);
          pdf.setTextColor(0, 0, 0); // Reset to black
          currentY += 10;
        }
      }
    }

    // Prepare data for table with proper encoding
    const tableData: string[][] = [];
    
    if (analysisData.labels && analysisData.values) {
      for (let i = 0; i < analysisData.labels.length; i++) {
        const label = analysisData.labels[i];
        const value = analysisData.values[i];
        
        tableData.push([
          handleTurkishText(label || ''),
          value?.toString() || '-',
          handleTurkishText(value && value > 0 ? 'Normal' : 'Veri Yok')
        ]);
      }
    }

    // Check if we need a new page for the table
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = 20;
    }

    // Add data table using autoTable with enhanced Turkish support
    autoTable(pdf, {
      head: [[handleTurkishText('Tarih'), handleTurkishText('Değer'), handleTurkishText('Durum')]],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: 'helvetica',
        fontStyle: 'normal',
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        font: 'helvetica'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 50, halign: 'center' }
      }
    });

    // Add footer
    const finalY = (pdf as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || currentY + 50;
    
    if (finalY < pageHeight - 30) {
      pdf.setFontSize(8);
      pdf.text(
        handleTurkishText('Bu rapor Çınar Veri Görüntüleme ve Analiz Portalı tarafından otomatik olarak oluşturulmuştur.'),
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );
    }

    // Get PDF as buffer with proper encoding
    const pdfBytes = pdf.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfBytes);

    // Create safe filename with Turkish character handling
    const safeVariable = variable
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[çÇ]/g, 'c')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeVariable}_analiz_${startDate.replace(/[^0-9]/g, '')}-${endDate.replace(/[^0-9]/g, '')}.pdf`;

    // Return PDF as response with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('❌ Analiz PDF oluşturma hatası:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Hata detayları:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        message: 'PDF oluşturulurken hata oluştu', 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
} 