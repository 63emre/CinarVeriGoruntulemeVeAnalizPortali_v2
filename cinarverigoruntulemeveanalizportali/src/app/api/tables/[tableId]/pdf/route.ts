import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';
import { generateAdvancedPDF } from '@/lib/pdf/new-pdf-service';
import type { JsonValue } from '@prisma/client/runtime/library';

// Helper function to safely parse JSON values
function parseJsonArray<T>(value: JsonValue): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tableId: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { tableId } = await context.params;
    const body = await request.json();
    
    // Get PDF options from request body
    const {
      title,
      subtitle = 'Çınar Çevre Laboratuvarı - Veri Analiz Raporu',
      includeFormulas = true,
      orientation = 'landscape',
      cellBorderWidth = 2,
      highlightedCells = [],
      formulas = []
    } = body;

    // Fetch table data
    const table = await prisma.dataTable.findFirst({
      where: {
        id: tableId,
        workspace: {
          OR: [
            { createdBy: user.id },
            {
              users: {
                some: {
                  userId: user.id,
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Tablo bulunamadı veya erişim yetkiniz yok' },
        { status: 404 }
      );
    }

    // Parse table data safely using helper function
    const columns = parseJsonArray<string>(table.columns);
    const data = parseJsonArray<(string | number | null)[]>(table.data);

    // Prepare table data for PDF service
    const tableData = {
      id: table.id,
      name: table.name,
      sheetName: table.sheetName || table.name,
      workspaceId: table.workspaceId,
      uploadedAt: table.uploadedAt,
      updatedAt: table.updatedAt,
      columns,
      data,
      workspace: table.workspace,
    };

    // Generate PDF
    console.log('📄 Starting PDF generation for table:', table.name);
    
    const pdfBuffer = await generateAdvancedPDF(
      tableData,
      highlightedCells,
      formulas,
      {
        title: title || table.name,
        subtitle,
        includeFormulas,
        orientation,
        cellBorderWidth,
        userName: user.name || user.email,
        includeDate: true,
      }
    );

    console.log('✅ PDF generation completed for table:', table.name);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${table.name.replace(/[^a-zA-Z0-9]/g, '_')}_analiz_raporu.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return NextResponse.json(
      { 
        message: 'PDF oluşturulurken hata oluştu', 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ tableId: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { tableId } = await context.params;

    // Fetch table data
    const table = await prisma.dataTable.findFirst({
      where: {
        id: tableId,
        workspace: {
          OR: [
            { createdBy: user.id },
            {
              users: {
                some: {
                  userId: user.id,
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Tablo bulunamadı veya erişim yetkiniz yok' },
        { status: 404 }
      );
    }

    // Also fetch formulas separately
    const tableFormulas = await prisma.formula.findMany({
      where: {
        tableId: tableId,
        active: true,
      },
    });

    // Parse table data safely using helper function
    const columns = parseJsonArray<string>(table.columns);
    const data = parseJsonArray<(string | number | null)[]>(table.data);

    // Prepare table data for PDF service
    const tableData = {
      id: table.id,
      name: table.name,
      sheetName: table.sheetName || table.name,
      workspaceId: table.workspaceId,
      uploadedAt: table.uploadedAt,
      updatedAt: table.updatedAt,
      columns,
      data,
      workspace: table.workspace,
    };

    // Transform formulas
    const pdfFormulas = tableFormulas.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      formula: f.formula,
      color: f.color || '#000000',
      type: f.type,
      active: f.active,
    }));

    // Generate PDF with default settings
    console.log('📄 Starting quick PDF generation for table:', table.name);
    
    const pdfBuffer = await generateAdvancedPDF(
      tableData,
      [], // No highlights for quick generation
      pdfFormulas,
      {
        title: table.name,
        subtitle: 'Çınar Çevre Laboratuvarı - Veri Analiz Raporu',
        includeFormulas: true,
        orientation: 'landscape',
        cellBorderWidth: 2,
        userName: user.name || user.email,
        includeDate: true,
      }
    );

    console.log('✅ Quick PDF generation completed for table:', table.name);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${table.name.replace(/[^a-zA-Z0-9]/g, '_')}_rapor.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Quick PDF generation error:', error);
    return NextResponse.json(
      { 
        message: 'PDF oluşturulurken hata oluştu', 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 