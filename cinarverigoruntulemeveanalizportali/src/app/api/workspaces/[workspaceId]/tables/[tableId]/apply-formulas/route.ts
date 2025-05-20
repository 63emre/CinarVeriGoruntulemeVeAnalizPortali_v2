import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { applyFormulaToTable } from '@/lib/formula/formula-service';

// Schema for formula application request
const ApplyFormulasSchema = z.object({
  formulaType: z.enum(['CELL_VALIDATION', 'RELATIONAL']),
  formulaIds: z.array(z.string()).optional(),
});

// POST /api/workspaces/[workspaceId]/tables/[tableId]/apply-formulas
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string, tableId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workspaceId, tableId } = params;

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
    const { formulaType, formulaIds } = ApplyFormulasSchema.parse(body);

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

    // Get formulas to apply
    const formulasQuery = {
      where: {
        workspaceId,
        type: formulaType,
        active: true,
      },
      select: {
        id: true,
        name: true,
        formula: true,
        type: true,
        color: true,
      },
    };

    // If specific formulaIds are provided, filter by them
    if (formulaIds && formulaIds.length > 0) {
      formulasQuery.where = {
        ...formulasQuery.where,
        id: {
          in: formulaIds,
        },
      };
    }

    const formulas = await prisma.formula.findMany(formulasQuery);

    if (formulas.length === 0) {
      return new NextResponse('No active formulas found', { status: 404 });
    }

    // Evaluate each formula against the table
    const evaluationResults = [];

    for (const formula of formulas) {
      try {
        const results = applyFormulaToTable(formula, {
          columns: table.columns as string[],
          data: table.data as (string | number | null)[][],
        });

        evaluationResults.push({
          formula,
          results,
        });
      } catch (evalError) {
        console.error(`Error evaluating formula ${formula.id}:`, evalError);
        evaluationResults.push({
          formula,
          error: (evalError as Error).message,
        });
      }
    }

    return NextResponse.json({
      tableId,
      evaluationResults,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error('Error applying formulas:', error);
    return new NextResponse(`Internal Error: ${(error as Error).message}`, { status: 500 });
  }
} 