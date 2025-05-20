import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { applyFormulaToTable } from '@/lib/formula/formula-service';

// Schema for formula evaluation request
const EvaluateFormulaSchema = z.object({
  formulaId: z.string(),
  tableId: z.string(),
});

// POST /api/workspaces/[workspaceId]/formulas/evaluate
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workspaceId } = params;

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

    const body = await request.json();
    const { formulaId, tableId } = EvaluateFormulaSchema.parse(body);

    // Get the formula
    const formula = await prisma.formula.findUnique({
      where: {
        id: formulaId,
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        formula: true,
        type: true,
        color: true,
      },
    });

    if (!formula) {
      return new NextResponse('Formula not found', { status: 404 });
    }

    // Get the table data
    const table = await prisma.dataTable.findUnique({
      where: {
        id: tableId,
        workspaceId,
      },
    });

    if (!table) {
      return new NextResponse('Table not found', { status: 404 });
    }

    // Evaluate the formula against the table
    try {
      const results = applyFormulaToTable(formula, {
        columns: table.columns as string[],
        data: table.data as (string | number | null)[][],
      });

      return NextResponse.json({
        formula,
        results,
      });
    } catch (evalError) {
      return new NextResponse(`Evaluation Error: ${(evalError as Error).message}`, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error('Error evaluating formula:', error);
    return new NextResponse(`Internal Error: ${(error as Error).message}`, { status: 500 });
  }
} 