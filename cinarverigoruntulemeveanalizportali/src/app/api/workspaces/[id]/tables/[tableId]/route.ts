import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// Get a specific table
export async function GET(
  request: Request,
  { params }: { params: { id: string, tableId: string } }
) {
  try {
    console.log(`GET /api/workspaces/${params.id}/tables/${params.tableId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    const { id: workspaceId, tableId } = params;
    
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
  { params }: { params: { id: string, tableId: string } }
) {
  try {
    console.log(`PUT /api/workspaces/${params.id}/tables/${params.tableId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    const { id: workspaceId, tableId } = params;
    
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

    const body = await request.json();
    const { name, sheetName, columns, data } = body;
    
    // Update the table
    const updatedTable = await prisma.dataTable.update({
      where: {
        id: tableId,
      },
      data: {
        name: name !== undefined ? name : undefined,
        sheetName: sheetName !== undefined ? sheetName : undefined,
        columns: columns !== undefined ? columns : undefined,
        data: data !== undefined ? data : undefined,
      },
    });
    
    return NextResponse.json(updatedTable);

  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { message: 'Tablo güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Delete a table
export async function DELETE(
  request: Request,
  { params }: { params: { id: string, tableId: string } }
) {
  try {
    console.log(`DELETE /api/workspaces/${params.id}/tables/${params.tableId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    const { id: workspaceId, tableId } = params;
    
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