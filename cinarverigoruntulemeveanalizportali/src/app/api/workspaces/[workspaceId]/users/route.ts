import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// GET: Get users for a workspace
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Use await to properly access params
    const workspaceId = await params.workspaceId;
    console.log(`GET /api/workspaces/${workspaceId}/users called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if workspace exists and validate permissions
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }
    
    // Check if the current user is the workspace owner
    // or an admin or is a member of this workspace
    const isAuthorized = currentUser.role === 'ADMIN' || 
                          workspace.createdBy === currentUser.id ||
                          await prisma.workspaceUser.findFirst({
                            where: {
                              userId: currentUser.id,
                              workspaceId: workspaceId,
                            }
                          });
    
    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }
    
    // Get workspace users
    const workspaceUsers = await prisma.workspaceUser.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    });
    
    // Return just the user information
    return NextResponse.json(
      workspaceUsers.map(wu => ({
        ...wu.user,
        addedAt: wu.addedAt
      }))
    );
    
  } catch (error) {
    console.error('Error getting workspace users:', error);
    return NextResponse.json(
      { message: 'Error fetching workspace users' },
      { status: 500 }
    );
  }
}

// POST: Add a user to a workspace
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Use await to properly access params
    const workspaceId = await params.workspaceId;
    console.log(`POST /api/workspaces/${workspaceId}/users called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only workspace owner or admin can add users
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }
    
    // Check if user is admin or workspace owner
    if (currentUser.role !== 'ADMIN' && workspace.createdBy !== currentUser.id) {
      return NextResponse.json(
        { message: 'You do not have permission to add users to this workspace' },
        { status: 403 }
      );
    }
    
    // Get the email from the request
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find the user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!userToAdd) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is already in workspace
    const existingWorkspaceUser = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId: userToAdd.id,
          workspaceId: workspaceId,
        }
      }
    });
    
    if (existingWorkspaceUser) {
      return NextResponse.json(
        { message: 'User already has access to this workspace' },
        { status: 400 }
      );
    }
    
    // Add user to workspace
    await prisma.workspaceUser.create({
      data: {
        userId: userToAdd.id,
        workspaceId: workspaceId,
      }
    });
    
    return NextResponse.json({
      message: 'User added to workspace successfully',
      user: {
        id: userToAdd.id,
        email: userToAdd.email,
        name: userToAdd.name,
      }
    });
    
  } catch (error) {
    console.error('Error adding user to workspace:', error);
    return NextResponse.json(
      { message: 'Error adding user to workspace' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user from a workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Use await to properly access params
    const workspaceId = await params.workspaceId;
    console.log(`DELETE /api/workspaces/${workspaceId}/users called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the userId from the request
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
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
    
    // Only workspace owner or admin can remove users
    // A user can also remove themselves
    if (currentUser.role !== 'ADMIN' && 
        workspace.createdBy !== currentUser.id && 
        userId !== currentUser.id) {
      return NextResponse.json(
        { message: 'You do not have permission to remove users from this workspace' },
        { status: 403 }
      );
    }
    
    // Cannot remove the workspace owner
    if (userId === workspace.createdBy) {
      return NextResponse.json(
        { message: 'Cannot remove the workspace owner' },
        { status: 400 }
      );
    }
    
    // Remove user from workspace
    await prisma.workspaceUser.delete({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        }
      }
    });
    
    return NextResponse.json({ message: 'User removed from workspace successfully' });
    
  } catch (error) {
    console.error('Error removing user from workspace:', error);
    return NextResponse.json(
      { message: 'Error removing user from workspace' },
      { status: 500 }
    );
  }
} 