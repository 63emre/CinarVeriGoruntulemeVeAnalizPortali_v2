import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as z from 'zod';
import prisma from '@/lib/db';

// Schema for formula update
const FormulaUpdateSchema = z.object({
  name: z.string().min(1, 'Formül adı zorunludur').optional(),
  description: z.string().optional(),
  formula: z.string().min(1, 'Formül ifadesi zorunludur').optional(),
  tableId: z.string().optional().nullable(),
  color: z.string().optional(),
  active: z.boolean().optional(),
});

// GET /api/workspaces/[workspaceId]/formulas/[formulaId]
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string; formulaId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workspaceId, formulaId } = params;

    // Check if user has access to this workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!workspaceUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get the specific formula
    const formula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId,
      },
    });

    if (!formula) {
      return new NextResponse('Formula not found', { status: 404 });
    }

    return NextResponse.json(formula);
  } catch (error) {
    console.error('Error getting formula:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// PATCH /api/workspaces/[workspaceId]/formulas/[formulaId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string; formulaId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workspaceId, formulaId } = params;

    // Check if user has access to this workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!workspaceUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if formula exists and belongs to the workspace
    const existingFormula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId,
      },
    });

    if (!existingFormula) {
      return new NextResponse('Formula not found', { status: 404 });
    }

    const body = await request.json();
    const validatedData = FormulaUpdateSchema.parse(body);

    // Update the formula
    const updatedFormula = await prisma.formula.update({
      where: {
        id: formulaId,
      },
      data: {
        ...validatedData,
      },
    });

    return NextResponse.json(updatedFormula);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error('Error updating formula:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE /api/workspaces/[workspaceId]/formulas/[formulaId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; formulaId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workspaceId, formulaId } = params;

    // Check if user has access to this workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!workspaceUser) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if formula exists and belongs to the workspace
    const existingFormula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId,
      },
    });

    if (!existingFormula) {
      return new NextResponse('Formula not found', { status: 404 });
    }

    // Delete the formula
    await prisma.formula.delete({
      where: {
        id: formulaId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting formula:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 