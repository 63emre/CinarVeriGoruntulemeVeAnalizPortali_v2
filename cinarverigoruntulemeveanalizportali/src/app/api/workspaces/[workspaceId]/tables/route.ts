import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// Get all tables for a specific workspace
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    
    console.log(`GET /api/workspaces/${workspaceId}/tables called`);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: workspaceId,
        userId: currentUser.id,
      },
    });

    const isCreator = workspace.createdBy === currentUser.id;

    if (!workspaceUser && !isCreator) {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Get all tables for this workspace
    const tables = await prisma.dataTable.findMany({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        id: true,
        name: true,
        sheetName: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error getting tables:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new table in a workspace
export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    console.log(`POST /api/workspaces/${params.workspaceId}/tables called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId }
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
          workspaceId: params.workspaceId,
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
        workspaceId: params.workspaceId,
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