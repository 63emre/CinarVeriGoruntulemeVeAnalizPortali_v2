import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Ensure we're using params correctly in Next.js 14
    const workspaceId = params.workspaceId;
    
    // Get current user for authorization
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
          select: {
            userId: true
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

    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const isMember = workspace.users.some(user => user.userId === currentUser.id);
    
    if (!isAdmin && !isCreator && !isMember) {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Get counts
    const userCount = await prisma.workspaceUser.count({
      where: { workspaceId }
    });

    const tableCount = await prisma.dataTable.count({
      where: { workspaceId }
    });

    const formulaCount = await prisma.formula.count({
      where: { workspaceId }
    });

    return NextResponse.json({
      userCount,
      tableCount,
      formulaCount
    });
  } catch (error) {
    console.error('Error getting workspace summary:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 