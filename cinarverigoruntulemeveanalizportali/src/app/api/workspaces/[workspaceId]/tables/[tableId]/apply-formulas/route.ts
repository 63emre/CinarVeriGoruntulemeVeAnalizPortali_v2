import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import { evaluateFormula, EvaluationContext } from '@/lib/formula/formula-service';

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message?: string;
}

interface FormulaRequest {
  formulaIds: string[];
  selectedVariable?: string;
}

// POST /api/workspaces/[workspaceId]/tables/[tableId]/apply-formulas
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { workspaceId, tableId } = await params;

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
    const { formulaIds, selectedVariable } = body;

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

    // Extract columns and data for processing
    const columns = table.columns as string[];
    const data = table.data as (string | number | null)[][];
    
    // Find the variable column
    const variableColumnIndex = columns.findIndex(
      col => col && typeof col === 'string' && col.toLowerCase() === 'variable'
    );
    
    if (variableColumnIndex === -1) {
      return NextResponse.json(
        { message: 'Variable column not found in table' },
        { status: 400 }
      );
    }

    // Apply each formula to the table
    for (const formula of formulas) {
      try {
        // Parse the formula to extract variable references
        const variableRegex = /\[([^\]]+)\]/g;
        const formulaVariables: Set<string> = new Set();
        let match;
        
        // Find all variables referenced in the formula
        while ((match = variableRegex.exec(formula.formula)) !== null) {
          formulaVariables.add(match[1]);
        }
        
        // Filter rows if selectedVariable is specified
        const rowsToProcess = selectedVariable 
          ? data.filter(row => row[variableColumnIndex] === selectedVariable)
          : data;
          
        // Process each row to evaluate the formula
        rowsToProcess.forEach((row, rowIndex) => {
          // Get the actual row index in the full data array for proper highlighting
          const actualRowIndex = selectedVariable 
            ? data.findIndex(r => r[variableColumnIndex] === selectedVariable && 
                JSON.stringify(r) === JSON.stringify(row))
            : rowIndex;
            
          if (actualRowIndex === -1) return; // Skip if row not found
          
          // Create context from row data for this specific row
          const context: EvaluationContext = { variables: {} };
          
          // Add all column values for this row to the variables context
          columns.forEach((col, colIndex) => {
            if (!col || typeof col !== 'string') return;
            
            const value = row[colIndex];
            if (typeof value === 'number') {
              context.variables[col] = value;
            } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
              context.variables[col] = parseFloat(value);
            }
          });
            try {
            // Evaluate the formula for this specific row
            const result = evaluateFormula(formula.formula, context);
            
            // If formula evaluates to false, highlight only the cells referenced in the formula
            if (!result.isValid && formula.color) {
              // If we have specific failing columns from the formula evaluation, use those
              const columnsToHighlight = result.failingColumns || Array.from(formulaVariables);
              
              // Add only the cells that are actually used in the formula condition
              for (const varName of columnsToHighlight) {
                const colIndex = columns.findIndex(c => c === varName);
                if (colIndex !== -1) {
                  // Add the specific cell to highlight with consistent row ID format
                  const highlightCell = {
                    row: `row-${actualRowIndex + 1}`, // Use 1-based indexing to match table components
                    col: varName, // Use the variable name as column identifier
                    color: formula.color || '#ff0000',
                    message: `${formula.name}: ${result.message || 'Koşul sağlanmadı'}`
                  };
                  
                  // Add to highlighted cells array if not already added
                  if (!highlightedCells.some(cell => 
                    cell.row === highlightCell.row && cell.col === highlightCell.col
                  )) {
                    highlightedCells.push(highlightCell);
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Error evaluating formula for row ${rowIndex}:`, err);
          }
        });
        
        formulaResults.push({
          formulaId: formula.id,
          formulaName: formula.name,
          appliedRows: rowsToProcess.length
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