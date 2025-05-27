import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

// GET: Get all formulas the user has access to
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin users can see all formulas
    if (currentUser.role === 'ADMIN') {
      const formulas = await prisma.formula.findMany({
        include: {
          workspace: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json(formulas);
    }
    
    // Regular users can see formulas from workspaces they have access to
    const userWorkspaces = await prisma.workspaceUser.findMany({
      where: {
        userId: currentUser.id
      },
      select: {
        workspaceId: true
      }
    });
    
    const workspaceIds = userWorkspaces.map(uw => uw.workspaceId);
    
    const formulas = await prisma.formula.findMany({
      where: {
        workspaceId: {
          in: workspaceIds
        }
      },
      include: {
        workspace: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(formulas);
  } catch (error) {
    console.error('Error getting formulas:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 