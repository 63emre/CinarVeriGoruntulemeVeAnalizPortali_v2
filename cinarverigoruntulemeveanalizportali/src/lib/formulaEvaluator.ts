/**
 * Formula Evaluator Utility
 * 
 * This utility evaluates formulas against table data and determines which cells should be highlighted.
 */

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  color: string;
  tableId: string | null;
  workspaceId: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
  leftResult?: number;
  rightResult?: number;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
  formulaIds: string[]; // IDs of formulas that triggered the highlight
  formulaDetails?: {
    id: string;
    name: string;
    formula: string;
    leftResult?: number;
    rightResult?: number;
  }[];
}

interface DataRow {
  id: string;
  [key: string]: string | number | null;
}

/**
 * Parses a formula string into tokens
 * @param formula Formula string like "(İletkenlik + Toplam Fosfor) > (Orto Fosfat - Alkalinite Tayini)"
 */
function parseFormula(formula: string) {
  // Split by comparison operators while keeping them
  const comparisonRegex = /([<>]=?|==|!=)/;
  const parts = formula.split(comparisonRegex);
  
  if (parts.length !== 3) {
    throw new Error('Invalid formula format. Formula must contain exactly one comparison operator.');
  }
  
  return {
    leftExpression: parts[0].trim(),
    operator: parts[1].trim(),
    rightExpression: parts[2].trim(),
  };
}

/**
 * Evaluates a single arithmetic expression
 */
function evaluateArithmeticExpression(expression: string, rowVariables: Record<string, number>): number {
  // Replace variables with their values
  let processedExpr = expression;
  
  // Sort variable names by length (descending) to avoid partial replacements
  const variableNames = Object.keys(rowVariables).sort((a, b) => b.length - a.length);
  
  for (const varName of variableNames) {
    const value = rowVariables[varName];
    // Only replace if it's a complete variable name (not part of another variable)
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    processedExpr = processedExpr.replace(regex, value.toString());
  }
  
  // Handle basic arithmetic with proper precedence
  try {
    // WARNING: Using eval for math expression evaluation
    // This is generally safe here since we control the input and it's just for arithmetic
    // In a production environment, consider using a proper math expression parser library
    return eval(processedExpr);
  } catch (error) {
    console.error('Error evaluating expression:', processedExpr, error);
    return NaN;
  }
}

/**
 * Applies a comparison between two values
 */
function applyComparison(left: number, operator: string, right: number): boolean {
  switch (operator) {
    case '>': return left > right;
    case '<': return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '==': return left === right;
    case '!=': return left !== right;
    default: throw new Error(`Unsupported operator: ${operator}`);
  }
}

/**
 * Extracts variable names from a formula expression
 */
function extractVariables(expression: string): string[] {
  // Match any word that's not surrounded by quotes and not a number
  const variableRegex = /\b([a-zA-ZğüşıöçĞÜŞİÖÇ][a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]*[a-zA-ZğüşıöçĞÜŞİÖÇ0-9])\b/g;
  const matches = expression.match(variableRegex) || [];
  
  // Filter out JavaScript keywords and numbers
  return matches.filter(match => {
    const isNumber = !isNaN(Number(match));
    const isKeyword = ['true', 'false', 'null', 'undefined'].includes(match);
    return !isNumber && !isKeyword;
  });
}

/**
 * Evaluates formulas against data rows and returns cells that should be highlighted
 */
export function evaluateFormulas(
  formulas: Formula[],
  data: DataRow[],
  columns: string[]
): HighlightedCell[] {
  const highlightedCells: HighlightedCell[] = [];
  const dateColumns = columns.filter(col => !['Variable', 'id'].includes(col));
  
  // Process each row in the data
  data.forEach(row => {
    const rowId = row.id;
    const variableName = row['Variable'] as string;
    
    if (!variableName) return;
    
    // Process each date column
    dateColumns.forEach(dateCol => {
      // Get the value for this cell
      const cellValue = row[dateCol];
      if (cellValue === null || cellValue === undefined) return;
      
      // Create a map of all variables for this date column across all rows
      const variables: Record<string, number> = {};
      data.forEach(varRow => {
        const varName = varRow['Variable'] as string;
        if (varName && varRow[dateCol] !== null) {
          variables[varName] = Number(varRow[dateCol]);
        }
      });
      
      // Skip if any variables have NaN values
      if (Object.values(variables).some(isNaN)) return;
      
      // Evaluate each formula
      const matchedFormulas = formulas.filter(formula => {
        try {
          const { leftExpression, operator, rightExpression } = parseFormula(formula.formula);
          
          // Check if any variables used in the formula are missing
          const allVariables = [
            ...extractVariables(leftExpression),
            ...extractVariables(rightExpression)
          ];
          
          const missingVariables = allVariables.filter(v => variables[v] === undefined);
          if (missingVariables.length > 0) return false;
          
          // Evaluate both sides of the expression
          const leftValue = evaluateArithmeticExpression(leftExpression, variables);
          const rightValue = evaluateArithmeticExpression(rightExpression, variables);
          
          // Store calculation details on the formula for tooltip display
          formula.leftResult = leftValue;
          formula.rightResult = rightValue;
          
          // Apply the comparison
          return applyComparison(leftValue, operator, rightValue);
        } catch (error) {
          console.error('Error evaluating formula:', formula.name, error);
          return false;
        }
      });
      
      // If any formulas matched, add a highlighted cell
      if (matchedFormulas.length > 0) {
        const existingCell = highlightedCells.find(
          cell => cell.row === rowId && cell.col === dateCol
        );
        
        const formulaDetails = matchedFormulas.map(f => ({
          id: f.id,
          name: f.name,
          formula: f.formula,
          leftResult: f.leftResult,
          rightResult: f.rightResult
        }));
        
        if (existingCell) {
          // Merge with existing cell highlight
          existingCell.formulaIds = [...existingCell.formulaIds, ...matchedFormulas.map(f => f.id)];
          existingCell.formulaDetails = [
            ...(existingCell.formulaDetails || []),
            ...formulaDetails
          ];
          existingCell.message = matchedFormulas.map(f => f.name).join(', ');
        } else {
          // Create new highlighted cell
          highlightedCells.push({
            row: rowId,
            col: dateCol,
            color: matchedFormulas[0].color, // Use the first matched formula's color
            message: matchedFormulas.map(f => f.name).join(', '),
            formulaIds: matchedFormulas.map(f => f.id),
            formulaDetails: formulaDetails
          });
        }
      }
    });
  });
  
  return highlightedCells;
}

/**
 * Helper function to extract cell value from a data table
 */
export function getCellValue(
  data: DataRow[],
  variableName: string,
  columnName: string
): number | null {
  const row = data.find(r => r['Variable'] === variableName);
  if (!row || row[columnName] === null || row[columnName] === undefined) {
    return null;
  }
  return Number(row[columnName]);
} 