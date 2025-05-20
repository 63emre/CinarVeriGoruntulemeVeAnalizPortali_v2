import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// DELETE: Remove a specific user from a workspace
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string, userId: string } }
) {
  try {
    console.log(`DELETE /api/workspaces/${params.workspaceId}/users/${params.userId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { workspaceId, userId } = params;
    
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
    
    // Check if the user exists in the workspace
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        }
      }
    });
    
    if (!workspaceUser) {
      return NextResponse.json(
        { message: 'User is not a member of this workspace' },
        { status: 404 }
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