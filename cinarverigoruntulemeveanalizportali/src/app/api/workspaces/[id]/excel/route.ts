import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';
import { parseExcelFile, saveExcelData } from '@/lib/excel/excel-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id: workspaceId } = params;

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
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
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı veya erişim izniniz yok' },
        { status: 403 }
      );
    }

    // Check if request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Multipart form data gereklidir' },
        { status: 400 }
      );
    }

    // Process form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { message: 'Dosya gereklidir' },
        { status: 400 }
      );
    }

    // Check if file is Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { message: 'Sadece Excel dosyaları (.xlsx, .xls) desteklenmektedir' },
        { status: 400 }
      );
    }

    // Parse Excel file
    const excelData = await parseExcelFile(file);
    
    if (excelData.length === 0) {
      return NextResponse.json(
        { message: 'Excel dosyasında işlenebilir veri bulunamadı' },
        { status: 400 }
      );
    }

    // Validate Excel structure
    for (const sheet of excelData) {
      const requiredColumns = ['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'];
      const missingColumns = requiredColumns.filter(
        (col) => !sheet.columns.includes(col)
      );

      if (missingColumns.length > 0) {
        return NextResponse.json({
          message: `'${sheet.sheetName}' sayfasında gerekli sütunlar eksik: ${missingColumns.join(', ')}`,
          status: 400,
        });
      }
    }

    // Save Excel data to database
    const tableIds = await saveExcelData(workspaceId, file.name, excelData);

    return NextResponse.json({
      message: 'Excel dosyası başarıyla yüklendi',
      sheets: excelData.map((sheet) => sheet.sheetName),
      tableIds,
    });
  } catch (error) {
    console.error('Excel upload error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 