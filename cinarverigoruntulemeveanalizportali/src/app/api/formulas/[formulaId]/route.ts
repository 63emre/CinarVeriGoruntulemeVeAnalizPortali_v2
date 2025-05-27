import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import * as z from 'zod';

// Schema for formula update
const FormulaUpdateSchema = z.object({
  name: z.string().min(1, 'Formül adı zorunludur').optional(),
  description: z.string().optional().nullable(),
  formula: z.string().min(1, 'Formül ifadesi zorunludur').optional(),
  tableId: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  type: z.enum(['CELL_VALIDATION', 'RELATIONAL']).optional(),
  active: z.boolean().optional(),
});

// GET: Get a specific formula
export async function GET(
  request: NextRequest,
  { params }: { params: { formulaId: string } }
) {
  try {
    const { formulaId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the formula
    const formula = await prisma.formula.findUnique({
      where: { id: formulaId },
      include: {
        workspace: {
          select: {
            name: true,
            createdBy: true,
            users: {
              where: {
                userId: currentUser.id
              }
            }
          }
        }
      }
    });

    if (!formula) {
      return NextResponse.json(
        { message: 'Formula not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this formula's workspace
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = formula.workspace.createdBy === currentUser.id;
    const hasAccess = formula.workspace.users.length > 0;
    
    if (!isAdmin && !isCreator && !hasAccess) {
      return NextResponse.json(
        { message: 'You do not have access to this formula' },
        { status: 403 }
      );
    }

    return NextResponse.json(formula);
  } catch (error) {
    console.error('Error getting formula:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update a formula
export async function PATCH(
  request: NextRequest,
  { params }: { params: { formulaId: string } }
) {
  try {
    const { formulaId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the formula to check permissions
    const formula = await prisma.formula.findUnique({
      where: { id: formulaId },
      include: {
        workspace: {
          select: {
            createdBy: true,
            users: {
              where: {
                userId: currentUser.id
              }
            }
          }
        }
      }
    });

    if (!formula) {
      return NextResponse.json(
        { message: 'Formula not found' },
        { status: 404 }
      );
    }

    // Check if user has access to update this formula
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = formula.workspace.createdBy === currentUser.id;
    const hasAccess = formula.workspace.users.length > 0;
    
    if (!isAdmin && !isCreator && !hasAccess) {
      return NextResponse.json(
        { message: 'You do not have permission to update this formula' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const data = await request.json();
    
    try {
      const validatedData = FormulaUpdateSchema.parse(data);
      
      // Update the formula
      const updatedFormula = await prisma.formula.update({
        where: { id: formulaId },
        data: validatedData,
      });

      return NextResponse.json(updatedFormula);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error', errors: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error updating formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a formula
export async function DELETE(
  request: NextRequest,
  { params }: { params: { formulaId: string } }
) {
  try {
    const { formulaId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the formula to check permissions
    const formula = await prisma.formula.findUnique({
      where: { id: formulaId },
      include: {
        workspace: {
          select: {
            createdBy: true,
            users: {
              where: {
                userId: currentUser.id
              }
            }
          }
        }
      }
    });

    if (!formula) {
      return NextResponse.json(
        { message: 'Formula not found' },
        { status: 404 }
      );
    }

    // Check if user has access to delete this formula
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = formula.workspace.createdBy === currentUser.id;
    
    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this formula' },
        { status: 403 }
      );
    }

    // Delete the formula
    await prisma.formula.delete({
      where: { id: formulaId },
    });

    return NextResponse.json({
      message: 'Formula deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting formula:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 