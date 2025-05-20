import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// Get a specific table
export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string, tableId: string } }
) {
  try {
    console.log(`GET /api/workspaces/${params.workspaceId}/tables/${params.tableId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    const { workspaceId, tableId } = params;
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
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
          workspaceId,
        },
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { message: 'Bu çalışma alanına erişim izniniz yok' },
          { status: 403 }
        );
      }
    }

    // Get the table
    const table = await prisma.dataTable.findUnique({
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
    
    return NextResponse.json(table);

  } catch (error) {
    console.error('Error getting table:', error);
    return NextResponse.json(
      { message: 'Tablo yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Update a table
export async function PUT(
  request: Request,
  { params }: { params: { workspaceId: string; tableId: string } }
) {
  try {
    const { workspaceId, tableId } = params;
    
    // Authenticate user
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
    
    // Check if the user has access to this workspace (unless they're an admin)
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    
    if (!isAdmin) {
      const workspaceUser = await prisma.workspaceUser.findFirst({
        where: {
          workspaceId: workspaceId,
          userId: currentUser.id,
        },
      });
      
      if (!workspaceUser && !isCreator) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }
    
    // Find the requested table
    const existingTable = await prisma.dataTable.findUnique({
      where: {
        id: tableId,
        workspaceId: workspaceId,
      },
    });
    
    if (!existingTable) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { columns, data, name } = body;
    
    if (!Array.isArray(columns) || !Array.isArray(data)) {
      return NextResponse.json(
        { message: 'Invalid request format. Columns and data must be arrays.' },
        { status: 400 }
      );
    }
    
    // Validate that the updated data structure matches the expected format
    if (columns.length === 0) {
      return NextResponse.json(
        { message: 'Columns array cannot be empty' },
        { status: 400 }
      );
    }
    
    // Update the table
    const updatedTable = await prisma.dataTable.update({
      where: {
        id: tableId,
      },
      data: {
        name: name || existingTable.name,
        columns: columns,
        data: data,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete a table
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string, tableId: string } }
) {
  try {
    console.log(`DELETE /api/workspaces/${params.workspaceId}/tables/${params.tableId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    const { workspaceId, tableId } = params;
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Only admin or workspace owner can delete tables
    if (currentUser.role !== 'ADMIN') {
      const hasAccess = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId,
        },
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { message: 'Bu işlem için yetkiniz yok' },
          { status: 403 }
        );
      }
    }

    // Check if table exists and belongs to this workspace
    const existingTable = await prisma.dataTable.findUnique({
      where: {
        id: tableId,
        workspaceId,
      },
    });
    
    if (!existingTable) {
      return NextResponse.json(
        { message: 'Tablo bulunamadı' },
        { status: 404 }
      );
    }

    // Delete the table
    await prisma.dataTable.delete({
      where: {
        id: tableId,
      },
    });
    
    return NextResponse.json({ message: 'Tablo başarıyla silindi' });

  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { message: 'Tablo silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 