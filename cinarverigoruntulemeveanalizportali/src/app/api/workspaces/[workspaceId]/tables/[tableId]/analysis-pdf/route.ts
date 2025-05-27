import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import PDFDocument from 'pdfkit';

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
    const { variable, startDate, endDate, analysisData } = body;

    if (!variable || !startDate || !endDate || !analysisData) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Add company logo and header
    doc.fontSize(20)
       .text('Çınar Çevre Laboratuvarı', 50, 50)
       .fontSize(16)
       .text('Veri Analiz Raporu', 50, 80);

    // Add analysis details
    doc.fontSize(12)
       .text(`Tablo: ${table.name}`, 50, 120)
       .text(`Değişken: ${variable}`, 50, 140)
       .text(`Analiz Dönemi: ${startDate} - ${endDate}`, 50, 160)
       .text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 50, 180);

    // Add data table
    let yPosition = 220;
    doc.fontSize(14)
       .text('Analiz Verileri', 50, yPosition);
    
    yPosition += 30;
    
    // Table headers
    doc.fontSize(10)
       .text('Tarih', 50, yPosition)
       .text('Değer', 200, yPosition)
       .text('Durum', 350, yPosition);
    
    yPosition += 20;
    
    // Add line under headers
    doc.moveTo(50, yPosition)
       .lineTo(500, yPosition)
       .stroke();
    
    yPosition += 10;

    // Add data rows
    if (analysisData.labels && analysisData.values) {
      for (let i = 0; i < analysisData.labels.length; i++) {
        const label = analysisData.labels[i];
        const value = analysisData.values[i];
        
        doc.text(label, 50, yPosition)
           .text(value?.toString() || '-', 200, yPosition)
           .text(value && value > 0 ? 'Normal' : 'Veri Yok', 350, yPosition);
        
        yPosition += 20;
        
        // Add new page if needed
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
      }
    }

    // Add footer
    doc.fontSize(8)
       .text('Bu rapor Çınar Veri Görüntüleme ve Analiz Portalı tarafından otomatik olarak oluşturulmuştur.', 
             50, doc.page.height - 50);

    // Finalize the PDF
    doc.end();

    const pdfBuffer = await pdfPromise;

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${variable}_analiz_${startDate}-${endDate}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating analysis PDF:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 