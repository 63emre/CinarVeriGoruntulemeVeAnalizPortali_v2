import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

// GET /api/workspaces/[workspaceId]/formulas/[formulaId]
export async function GET(
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
    
    // Get the formula
    const formula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId: workspaceId
      }
    });
    
    if (!formula) {
      return NextResponse.json({ message: 'Formula not found' }, { status: 404 });
    }
    
    return NextResponse.json(formula);
  } catch (error) {
    console.error('Error fetching formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/[workspaceId]/formulas/[formulaId]
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
    
    // Get request body
    const body = await request.json();
    
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
    
    // Update the formula
    const updatedFormula = await prisma.formula.update({
      where: {
        id: formulaId
      },
      data: {
        name: body.name ?? existingFormula.name,
        description: body.description ?? existingFormula.description,
        color: body.color ?? existingFormula.color,
        active: body.active !== undefined ? body.active : existingFormula.active,
      }
    });
    
    return NextResponse.json(updatedFormula);
  } catch (error) {
    console.error('Error updating formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[workspaceId]/formulas/[formulaId]
export async function DELETE(
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
    
    // Make sure the formula exists and belongs to this workspace
    const existingFormula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId: workspaceId
      }
    });
    
    if (!existingFormula) {
      return NextResponse.json({ message: 'Formula not found' }, { status: 404 });
    }
    
    // Delete the formula
    await prisma.formula.delete({
      where: {
        id: formulaId
      }
    });
    
    return NextResponse.json({ message: 'Formula deleted successfully' });
  } catch (error) {
    console.error('Error deleting formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 