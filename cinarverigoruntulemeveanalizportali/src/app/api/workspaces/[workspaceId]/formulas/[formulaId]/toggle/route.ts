import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

// PUT /api/workspaces/[workspaceId]/formulas/[formulaId]/toggle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; formulaId: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Next.js 15: await params
    const { workspaceId, formulaId } = await params;
    
    // Get request body
    const body = await request.json();
    const { active } = body;
    
    if (typeof active !== 'boolean') {
      return NextResponse.json({ message: 'Active field must be boolean' }, { status: 400 });
    }
    
    // Check if user has access to the workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { createdBy: user.id },
          {
            users: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      }
    });
    
    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found or access denied' }, { status: 404 });
    }
    
    // Make sure the formula exists
    const existingFormula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId: workspaceId
      }
    });
    
    if (!existingFormula) {
      return NextResponse.json({ message: 'Formula not found' }, { status: 404 });
    }
    
    // Update the formula's active status
    const updatedFormula = await prisma.formula.update({
      where: {
        id: formulaId
      },
      data: {
        active: active
      }
    });
    
    return NextResponse.json(updatedFormula);
  } catch (error) {
    console.error('Error toggling formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 