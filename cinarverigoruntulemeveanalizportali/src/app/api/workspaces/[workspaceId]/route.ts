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
      
      // Correctly access params in Next.js 14
      const workspaceId = params.workspaceId;

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
        },
        formulas: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            tables: true,
            formulas: true
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

// PATCH: Update a workspace
export async function PATCH(
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

    // Access params directly without awaiting
    const { workspaceId } = params;

    // Check if workspace exists
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

    // Only admin, creator, or members can update workspace
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const isMember = workspace.users.length > 0;

    if (!isAdmin && !isCreator && !isMember) {
      return NextResponse.json(
        { message: 'You do not have permission to update this workspace' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Update workspace
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name,
        description
      }
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workspace
export async function DELETE(
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

    // Access params directly without awaiting
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

    // Only admin or creator can delete workspace
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this workspace' },
        { status: 403 }
      );
    }

    // Delete workspace
    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    return NextResponse.json({
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 