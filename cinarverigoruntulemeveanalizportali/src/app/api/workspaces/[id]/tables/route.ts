import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// Get all tables for a specific workspace
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/workspaces/${params.id}/tables called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Check access if not admin
    if (currentUser.role !== 'ADMIN') {
      const hasAccess = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId: params.id,
        },
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { message: 'Bu çalışma alanına erişim izniniz yok' },
          { status: 403 }
        );
      }
    }

    // Get all tables for this workspace
    const tables = await prisma.dataTable.findMany({
      where: {
        workspaceId: params.id,
      },
      select: {
        id: true,
        name: true,
        sheetName: true,
        uploadedAt: true,
        updatedAt: true,
        // We don't select columns and data here to keep the response size smaller
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    return NextResponse.json(tables);

  } catch (error) {
    console.error('Error getting workspace tables:', error);
    return NextResponse.json(
      { message: 'Tablolar yüklenemedi' },
      { status: 500 }
    );
  }
}

// Create a new table in a workspace
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`POST /api/workspaces/${params.id}/tables called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Check access if not admin
    if (currentUser.role !== 'ADMIN') {
      const hasAccess = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId: params.id,
        },
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { message: 'Bu çalışma alanına erişim izniniz yok' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { name, sheetName, columns, data } = body;
    
    if (!name || !sheetName || !columns || !data) {
      return NextResponse.json(
        { message: 'Tüm gerekli alanları sağlamanız gerekir' },
        { status: 400 }
      );
    }

    // Create a new table
    const newTable = await prisma.dataTable.create({
      data: {
        name,
        sheetName,
        columns,
        data,
        workspaceId: params.id,
      },
    });
    
    return NextResponse.json(newTable);

  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { message: 'Tablo oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 