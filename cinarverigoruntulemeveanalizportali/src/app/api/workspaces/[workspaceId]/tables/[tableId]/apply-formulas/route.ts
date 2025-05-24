import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import { evaluateFormula, EvaluationContext } from '@/lib/formula/formula-service';

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message?: string;
  formulaIds?: string[];
  formulaDetails?: {
    id: string;
    name: string;
    formula: string;
    leftResult?: number;
    rightResult?: number;
  }[];
}

interface FormulaRequest {
  formulaIds: string[];
  selectedVariable?: string;
  formulaType?: string; // Add formulaType to prevent Zod validation issues
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
    const { formulaIds, formulaType = 'CELL_VALIDATION' } = body; // Provide default formulaType

    if (!formulaIds || !Array.isArray(formulaIds) || formulaIds.length === 0) {
      return NextResponse.json(
        { message: 'At least one formula ID is required' },
        { status: 400 }
      );
    }

    // Get formulas for the workspace with optional type filter
    const formulas = await prisma.formula.findMany({
      where: {
        id: { in: formulaIds },
        workspaceId,
        ...(formulaType && { type: formulaType as 'CELL_VALIDATION' | 'RELATIONAL' })
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
        console.log(`Processing formula: "${formula.name}" - "${formula.formula}"`);
        
        // Parse the formula to extract variable references
        const variableRegex = /\[([^\]]+)\]/g;
        const formulaVariables: Set<string> = new Set();
        let match;
        
        // Find all variables referenced in the formula
        while ((match = variableRegex.exec(formula.formula)) !== null) {
          // Clean the variable name by removing trailing commas and trimming whitespace
          const cleanVariableName = match[1].replace(/,+$/, '').trim();
          if (cleanVariableName) {
            formulaVariables.add(cleanVariableName);
          }
        }
        
        console.log(`Formula variables extracted:`, Array.from(formulaVariables));
        
        // Find all date columns (exclude metadata columns)
        const metadataColumns = ['Variable', 'Data Source', 'Method', 'Unit', 'LOQ'];
        const dateColumns = columns.filter(col => !metadataColumns.includes(col));
        
        console.log(`Processing ${dateColumns.length} date columns:`, dateColumns);
        
        // Process each date column
        dateColumns.forEach(dateCol => {
          const dateColIndex = columns.findIndex(c => c === dateCol);
          if (dateColIndex === -1) return;
          
          // Create variables map for this date column by gathering values from all rows
          const variables: Record<string, number> = {};
          
          data.forEach(row => {
            const rawVarName = row[variableColumnIndex] as string;
            const value = row[dateColIndex];
            
            if (rawVarName && value !== null && value !== undefined) {
              // Clean the variable name by removing trailing commas and trimming whitespace
              const cleanVarName = rawVarName.replace(/,+$/, '').trim();
              
              const numValue = typeof value === 'number' ? value : parseFloat(String(value));
              if (!isNaN(numValue) && cleanVarName) {
                variables[cleanVarName] = numValue;
                // Also store with original name if different
                if (cleanVarName !== rawVarName.trim()) {
                  variables[rawVarName.trim()] = numValue;
                }
              }
            }
          });
          
          console.log(`Variables available in column "${dateCol}":`, variables);
          
          // Check if all required variables for this formula are available
          const missingVariables = Array.from(formulaVariables).filter(varName => 
            variables[varName] === undefined
          );
          
          if (missingVariables.length > 0) {
            console.log(`Missing variables for formula "${formula.name}" in column "${dateCol}":`, missingVariables);
            return; // Skip this date column if variables are missing
          }
          
          console.log(`All variables found for formula "${formula.name}" in column "${dateCol}". Evaluating...`);
          
          // Create context for formula evaluation
          const context: EvaluationContext = { variables };
          
          try {
            // Clean the formula by removing trailing commas from variable names
            const cleanFormula = formula.formula.replace(/\[([^\]]+),+\]/g, (match, varName) => {
              return `[${varName.trim()}]`;
            });
            
            console.log(`Original formula: ${formula.formula}`);
            console.log(`Cleaned formula: ${cleanFormula}`);
            
            // Evaluate the formula for this date column
            const result = evaluateFormula(cleanFormula, context);
            
            console.log(`Formula evaluation result:`, result);
            
            // If formula condition IS met (isValid = true), highlight the cells for validation failures
            // This means the condition like "İletkenlik < 322" is TRUE (value is less than 322)
            // So we highlight cells where the condition is satisfied
            if (result.isValid && formula.color) {
              console.log(`Formula condition met! Highlighting cells...`);
              
              // Highlight cells for all variables used in the formula that satisfy the condition
              Array.from(formulaVariables).forEach(varName => {
                // Find the row that contains this variable
                const varRowIndex = data.findIndex(row => {
                  const rawVarName = row[variableColumnIndex] as string;
                  const cleanVarName = rawVarName ? rawVarName.replace(/,+$/, '').trim() : '';
                  return cleanVarName === varName;
                });
                
                if (varRowIndex !== -1) {
                  const rowId = `row-${varRowIndex + 1}`;
                  const cellValue = variables[varName];
                  
                  // Check if this cell is already highlighted by another formula
                  const existingCellIndex = highlightedCells.findIndex(cell => 
                    cell.row === rowId && cell.col === dateCol
                  );
                  
                  if (existingCellIndex !== -1) {
                    // Merge with existing highlight
                    const existingCell = highlightedCells[existingCellIndex];
                    existingCell.formulaIds = [...(existingCell.formulaIds || []), formula.id];
                    existingCell.message = `${existingCell.message}, ${formula.name}`;
                    existingCell.formulaDetails = [
                      ...(existingCell.formulaDetails || []),
                      {
                        id: formula.id,
                        name: formula.name,
                        formula: formula.formula
                      }
                    ];
                  } else {
                    // Create new highlighted cell
                    const highlightCell: HighlightedCell = {
                      row: rowId,
                      col: dateCol,
                      color: formula.color || '#ff0000',
                      message: `${formula.name}: Koşul sağlandı (${varName} = ${cellValue})`,
                      formulaIds: [formula.id],
                      formulaDetails: [{
                        id: formula.id,
                        name: formula.name,
                        formula: formula.formula
                      }]
                    };
                    
                    highlightedCells.push(highlightCell);
                    console.log(`Added highlight cell:`, highlightCell);
                  }
                }
              });
            } else {
              console.log(`Formula condition not met or no color specified.`);
            }
          } catch (err) {
            console.error(`Error evaluating formula "${formula.name}" for column "${dateCol}":`, err);
          }
        });
        
        formulaResults.push({
          formulaId: formula.id,
          formulaName: formula.name,
          appliedRows: data.length,
          processedColumns: dateColumns.length
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

    // Prepare table data in the format expected by frontend
    const tableColumns = columns.map(col => ({
      id: col,
      name: col,
      type: 'string'
    }));
    
    const tableRows = data.map((row, rowIndex) => {
      const rowData: { [key: string]: string | number | null, id: string } = { 
        id: `row-${rowIndex + 1}` // Keep 1-based indexing for consistency
      };
      columns.forEach((col, colIndex) => {
        rowData[col] = row[colIndex];
      });
      return rowData;
    });

    return NextResponse.json({
      tableId,
      formulaResults,
      highlightedCells,
      tableData: tableRows,  // Add tableData for frontend compatibility
      columns: tableColumns   // Add columns for frontend compatibility
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error applying formulas:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}