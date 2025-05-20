import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';
import { parseExcelFile, saveExcelData } from '@/lib/excel/excel-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { createdBy: user.id },
          {
            users: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      }
    });

    if (!workspace && user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu çalışma alanına erişim izniniz yok' },
        { status: 403 }
      );
    }

    // Get the uploaded Excel file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'Lütfen bir Excel dosyası yükleyin' },
        { status: 400 }
      );
    }

    // Parse the Excel file
    const sheetData = await parseExcelFile(file);
    
    // Check if there's any data
    if (!sheetData || Object.keys(sheetData).length === 0) {
      return NextResponse.json(
        { message: 'Excel dosyasında veri bulunamadı' },
        { status: 400 }
      );
    }

    // Save the data to the database
    const result = await saveExcelData(sheetData, workspaceId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Excel upload error:', error);
    return NextResponse.json(
      { message: 'Excel dosyası işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 