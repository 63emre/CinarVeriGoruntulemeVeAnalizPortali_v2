import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// GET: Get a specific table
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Next.js 15: await params
    const { workspaceId, tableId } = await params;

    console.log(`GET /api/workspaces/${workspaceId}/tables/${tableId} called`);

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
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    
    if (!isAdmin && !isCreator) {
      const userWorkspace = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId,
        },
      });
      
      if (!userWorkspace) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }

    // Check if table exists
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

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update a table
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Next.js 15: await params
    const { workspaceId, tableId } = await params;
    
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
          where: {
            userId: currentUser.id
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

    // Check permissions
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const hasAccess = workspace.users.length > 0;
    
    if (!isAdmin && !isCreator && !hasAccess) {
      return NextResponse.json(
        { message: 'You do not have permission to update this table' },
        { status: 403 }
      );
    }

    // Get the existing table
    const existingTable = await prisma.dataTable.findUnique({
      where: { 
        id: tableId,
        workspaceId: workspaceId
      }
    });

    if (!existingTable) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const data = await request.json();
    
    // Update the table
    const updatedTable = await prisma.dataTable.update({
      where: { id: tableId },
      data: {
        name: data.name || existingTable.name,
        columns: data.columns || existingTable.columns,
        data: data.data || existingTable.data,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Table updated successfully',
      table: updatedTable
    });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a table
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Next.js 15: await params
    const { workspaceId, tableId } = await params;

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
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    
    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this table' },
        { status: 403 }
      );
    }

    // Check if table exists
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

    // Delete the table
    await prisma.dataTable.delete({
      where: { id: tableId }
    });

    return NextResponse.json({
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 