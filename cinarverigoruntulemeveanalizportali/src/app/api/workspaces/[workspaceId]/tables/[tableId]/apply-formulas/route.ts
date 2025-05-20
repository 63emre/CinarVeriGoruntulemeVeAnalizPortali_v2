import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { applyFormulaToTable } from '@/lib/formula/formula-service';

// Schema for formula application request
const ApplyFormulasSchema = z.object({
  formulaIds: z.array(z.string()).min(1, "En az bir formül seçilmelidir"),
  selectedVariable: z.string().optional(),
  formulaType: z.enum(['CELL_VALIDATION', 'RELATIONAL']).optional(),
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

    // Parse and validate request
    let body;
    try {
      body = await request.json();
      ApplyFormulasSchema.parse(body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new NextResponse(
        `Invalid request: ${parseError instanceof z.ZodError ? JSON.stringify(parseError.errors) : 'Invalid JSON'}`, 
        { status: 400 }
      );
    }

    // Initialize query for finding formulas
    const formulasQuery: {
      where: {
        workspaceId: string;
        active: boolean;
        id?: { in: string[] };
        type?: string;
      };
      select: {
        id: boolean;
        name: boolean;
        formula: boolean;
        type: boolean;
        color: boolean;
      };
    } = {
      where: {
        workspaceId,
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
    if (body.formulaIds && body.formulaIds.length > 0) {
      formulasQuery.where.id = {
        in: body.formulaIds,
      };
    }

    // If formula type is specified, add it to the filter
    if (body.formulaType) {
      formulasQuery.where.type = body.formulaType;
    }

    const formulas = await prisma.formula.findMany(formulasQuery);

    if (formulas.length === 0) {
      return new NextResponse('No formulas found matching criteria', { status: 404 });
    }

    // Evaluate each formula against the table
    const evaluationResults: {
      formula: any;
      results?: any[];
      error?: string;
    }[] = [];

    const highlightedCells: {
      rowIndex: number;
      colIndex: number;
      color: string;
      message: string;
    }[] = [];

    // Parse table data
    const tableColumns = table.columns as string[];
    const tableData = table.data as (string | number | null)[][];

    for (const formula of formulas) {
      try {
        const results = applyFormulaToTable(formula, {
          columns: tableColumns,
          data: tableData,
        });

        // Process results and collect highlighted cells
        results.forEach((result, rowIndex) => {
          if (!result.isValid && formula.color) {
            // Add highlighted cell information
            const variableColIndex = tableColumns.findIndex(
              col => col && typeof col === 'string' && col.toLowerCase() === 'variable'
            );
            
            if (variableColIndex !== -1) {
              highlightedCells.push({
                rowIndex,
                colIndex: variableColIndex,
                color: formula.color || '#ff0000',
                message: result.message || `${formula.name} değerlendirme hatası`
              });
            }
          }
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
      tableData,
      evaluationResults,
      highlightedCells,
    });
  } catch (error) {
    console.error('Error applying formulas:', error);
    return new NextResponse(`Internal Error: ${(error as Error).message}`, { status: 500 });
  }
} 