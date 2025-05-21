import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { evaluateFormula, EvaluationContext, applyFormulaToTable } from '@/lib/formula/formula-service';

// Schema for formula application request
const ApplyFormulasSchema = z.object({
  formulaIds: z.array(z.string()).min(1, "En az bir formül seçilmelidir"),
  selectedVariable: z.string().optional(),
  formulaType: z.enum(['CELL_VALIDATION', 'RELATIONAL']).optional(),
});

// Define interfaces for type safety
interface FormulaResult {
  formula: any;
  results: Array<{
    rowIndex: number;
    isValid: boolean;
  }>;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
}

interface FormulaRequest {
  formulaIds: string[];
}

// POST /api/workspaces/[workspaceId]/tables/[tableId]/apply-formulas
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string; tableId: string } }
) {
  try {
    // Access params directly without awaiting
    const { workspaceId, tableId } = params;

    // Get current user for authorization
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Check if user has access to this workspace
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    
    if (!isAdmin && !isCreator) {
      const userWorkspace = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId,
        },
      });
      
      if (!userWorkspace) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }

    // Get table data
    const table = await prisma.dataTable.findUnique({
      where: { 
        id: tableId,
        workspaceId
      }
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // Get the formulas to apply
    const body = await request.json() as FormulaRequest;
    const { formulaIds } = body;

    if (!formulaIds || !Array.isArray(formulaIds) || formulaIds.length === 0) {
      return NextResponse.json(
        { message: 'At least one formula ID is required' },
        { status: 400 }
      );
    }

    // Get formulas for the workspace
    const formulas = await prisma.formula.findMany({
      where: {
        id: { in: formulaIds },
        workspaceId
      }
    });

    if (formulas.length === 0) {
      return NextResponse.json(
        { message: 'No valid formulas found' },
        { status: 404 }
      );
    }

    // Initialize array to hold results
    const formulaResults = [];
    const highlightedCells: HighlightedCell[] = [];

    // Apply each formula to the table
    for (const formula of formulas) {
      try {
        const evaluationResults = applyFormulaToTable(formula, {
          columns: table.columns as string[],
          data: table.data as (string | number | null)[][],
        });
        
        // Process evaluation results to generate highlighted cells
        evaluationResults.forEach((result, rowIndex) => {
          if (!result.isValid && formula.color) {
            // Find the appropriate column to highlight (first one that matches the formula)
            const columnIndex = 0; // Default to first column if can't determine
            const variableColumnIndex = (table.columns as string[]).findIndex(
              col => col.toLowerCase() === 'variable'
            );
            
            // Create a highlighted cell entry for this result
            highlightedCells.push({
              row: `row-${rowIndex + 1}`,
              col: (table.columns as string[])[variableColumnIndex >= 0 ? variableColumnIndex : columnIndex],
              color: formula.color || '#ff0000',
              message: result.message || `${formula.name} formülü doğrulanmadı`
            });
          }
        });
        
        formulaResults.push({
          formulaId: formula.id,
          formulaName: formula.name,
          result: evaluationResults
        });
      } catch (error) {
        formulaResults.push({
          formulaId: formula.id,
          formulaName: formula.name,
          error: (error as Error).message
        });
      }
    }

    // Log to verify highlighted cells are populated
    console.log(`Generated ${highlightedCells.length} highlighted cells`);

    return NextResponse.json({
      tableId,
      formulaResults,
      highlightedCells
    });
  } catch (error) {
    console.error('Error applying formulas:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}