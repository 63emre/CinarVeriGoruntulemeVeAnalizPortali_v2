import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string; tableId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id: workspaceId, tableId } = params;

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

    // Check if table exists and belongs to the workspace
    const table = await prisma.dataTable.findFirst({
      where: {
        id: tableId,
        workspaceId,
      },
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Tablo bulunamadı' },
        { status: 404 }
      );
    }

    // Get formulas for the workspace
    const formulas = await prisma.formula.findMany({
      where: {
        workspaceId,
        OR: [
          { tableId: null },
          { tableId },
        ],
      },
    });

    // Return data for PDF generation on the client side
    // The actual PDF generation will be handled by the frontend
    // using libraries like jsPDF and html2canvas
    return NextResponse.json({
      table: {
        id: table.id,
        name: table.name,
        sheetName: table.sheetName,
        columns: table.columns,
        data: table.data,
      },
      formulas,
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating PDF data:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 