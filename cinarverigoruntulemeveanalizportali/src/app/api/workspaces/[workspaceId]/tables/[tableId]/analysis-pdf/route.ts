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
    const { variable, startDate, endDate, analysisData } = body;

    if (!variable || !startDate || !endDate || !analysisData) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create PDF document
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add company logo and header
    pdf.setFontSize(20);
    pdf.text('Çınar Çevre Laboratuvarı', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text('Veri Analiz Raporu', pageWidth / 2, 30, { align: 'center' });

    // Add analysis details
    pdf.setFontSize(12);
    pdf.text(`Tablo: ${table.name}`, 15, 50);
    pdf.text(`Değişken: ${variable}`, 15, 60);
    pdf.text(`Analiz Dönemi: ${startDate} - ${endDate}`, 15, 70);
    pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 15, 80);

    // Prepare data for table
    const tableData: string[][] = [];
    
    if (analysisData.labels && analysisData.values) {
      for (let i = 0; i < analysisData.labels.length; i++) {
        const label = analysisData.labels[i];
        const value = analysisData.values[i];
        
        tableData.push([
          label,
          value?.toString() || '-',
          value && value > 0 ? 'Normal' : 'Veri Yok'
        ]);
      }
    }

    // Add data table using autoTable
    autoTable(pdf, {
      head: [['Tarih', 'Değer', 'Durum']],
      body: tableData,
      startY: 100,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    // Add footer
    const finalY = (pdf as any).lastAutoTable?.finalY || 100;
    
    if (finalY < pageHeight - 30) {
      pdf.setFontSize(8);
      pdf.text(
        'Bu rapor Çınar Veri Görüntüleme ve Analiz Portalı tarafından otomatik olarak oluşturulmuştur.',
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );
    }

    // Get PDF as buffer
    const pdfOutput = pdf.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfOutput);

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