import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// GET: Get a specific workspace
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = await params;

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        tables: {
          select: {
            id: true,
            name: true,
            sheetName: true,
            uploadedAt: true
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

    // Check if user has access to this workspace
    if (currentUser.role !== 'ADMIN' && workspace.createdBy !== currentUser.id) {
      const userHasAccess = workspace.users.some(wu => wu.userId === currentUser.id);
      
      if (!userHasAccess) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT: Update a workspace
export async function PUT(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { workspaceId } = params;
    
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
    
    // Only the creator or admin can modify the workspace
    if (currentUser.role !== 'ADMIN' && workspace.createdBy !== currentUser.id) {
      return NextResponse.json(
        { message: 'You do not have permission to modify this workspace' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, description } = body;
    
    // Update the workspace
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      }
    });
    
    return NextResponse.json(updatedWorkspace);
    
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { message: 'Error updating workspace' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workspace
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { workspaceId } = params;
    
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
    
    // Only the creator or admin can delete the workspace
    if (currentUser.role !== 'ADMIN' && workspace.createdBy !== currentUser.id) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this workspace' },
        { status: 403 }
      );
    }
    
    // Delete related records first
    await prisma.workspaceUser.deleteMany({
      where: { workspaceId }
    });
    
    // Delete the workspace's tables
    await prisma.dataTable.deleteMany({
      where: { workspaceId }
    });
    
    // Delete formulas 
    await prisma.formula.deleteMany({
      where: { workspaceId }
    });
    
    // Finally delete the workspace
    await prisma.workspace.delete({
      where: { id: workspaceId }
    });
    
    return NextResponse.json({ message: 'Workspace deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { message: 'Error deleting workspace' },
      { status: 500 }
    );
  }
} 