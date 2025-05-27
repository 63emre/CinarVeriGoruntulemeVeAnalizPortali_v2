/**
 * Formula Evaluator Utility
 * 
 * This utility evaluates formulas against table data and determines which cells should be highlighted.
 * Enhanced with better performance, error handling, and color blending capabilities.
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
 * Cache for parsed formulas to improve performance
 */
const formulaCache = new Map<string, {
  leftExpression: string;
  operator: string;
  rightExpression: string;
  variables: string[];
}>();

/**
 * Parses a formula string into tokens with caching
 * @param formula Formula string like "(İletkenlik + Toplam Fosfor) > (Orto Fosfat - Alkalinite Tayini)"
 */
function parseFormula(formula: string) {
  // Check cache first
  if (formulaCache.has(formula)) {
    return formulaCache.get(formula)!;
  }

  // Split by comparison operators while keeping them
  const comparisonRegex = /([<>]=?|==|!=)/;
  const parts = formula.split(comparisonRegex);
  
  if (parts.length !== 3) {
    throw new Error('Invalid formula format. Formula must contain exactly one comparison operator.');
  }
  
  const leftExpression = parts[0].trim();
  const operator = parts[1].trim();
  const rightExpression = parts[2].trim();
  
  // Extract variables for caching
  const variables = [
    ...extractVariables(leftExpression),
    ...extractVariables(rightExpression)
  ];
  
  const result = {
    leftExpression,
    operator,
    rightExpression,
    variables: [...new Set(variables)] // Remove duplicates
  };
  
  // Cache the result
  formulaCache.set(formula, result);
  
  return result;
}

/**
 * Evaluates a single arithmetic expression with improved error handling
 */
function evaluateArithmeticExpression(expression: string, rowVariables: Record<string, number>): number {
  // Replace variables with their values
  let processedExpr = expression;
  
  // Sort variable names by length (descending) to avoid partial replacements
  const variableNames = Object.keys(rowVariables).sort((a, b) => b.length - a.length);
  
  for (const varName of variableNames) {
    const value = rowVariables[varName];
    if (isNaN(value)) {
      throw new Error(`Variable '${varName}' has invalid value: ${value}`);
    }
    // Only replace if it's a complete variable name (not part of another variable)
    const regex = new RegExp(`\\b${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    processedExpr = processedExpr.replace(regex, value.toString());
  }
  
  // Validate that all variables have been replaced
  const remainingVariables = extractVariables(processedExpr);
  if (remainingVariables.length > 0) {
    throw new Error(`Undefined variables in expression: ${remainingVariables.join(', ')}`);
  }
  
  // Handle basic arithmetic with proper precedence
  try {
    // Use Function constructor instead of eval for better security
    const result = new Function(`"use strict"; return (${processedExpr})`)();
    
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error(`Expression evaluation resulted in non-numeric value: ${result}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error evaluating expression:', processedExpr, error);
    throw new Error(`Failed to evaluate expression: ${processedExpr}`);
  }
}

/**
 * Applies a comparison between two values
 */
function applyComparison(left: number, operator: string, right: number): boolean {
  // Handle NaN values
  if (isNaN(left) || isNaN(right)) {
    return false;
  }
  
  switch (operator) {
    case '>': return left > right;
    case '<': return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '==': return Math.abs(left - right) < Number.EPSILON; // Handle floating point precision
    case '!=': return Math.abs(left - right) >= Number.EPSILON;
    default: throw new Error(`Unsupported operator: ${operator}`);
  }
}

/**
 * Extracts variable names from a formula expression with improved regex
 */
function extractVariables(expression: string): string[] {
  // Enhanced regex to better handle Turkish characters and complex variable names
  const variableRegex = /\b([a-zA-ZğüşıöçĞÜŞİÖÇ][a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]*[a-zA-ZğüşıöçĞÜŞİÖÇ0-9]|[a-zA-ZğüşıöçĞÜŞİÖÇ])\b/g;
  const matches = expression.match(variableRegex) || [];
  
  // Filter out JavaScript keywords, numbers, and common operators
  return matches.filter(match => {
    const trimmed = match.trim();
    const isNumber = !isNaN(Number(trimmed));
    const isKeyword = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'].includes(trimmed);
    const isOperator = ['+', '-', '*', '/', '(', ')', '>', '<', '=', '!'].includes(trimmed);
    return !isNumber && !isKeyword && !isOperator && trimmed.length > 0;
  });
}

/**
 * Blends multiple colors for cells with multiple formula matches
 */
function blendColors(colors: string[]): string {
  if (colors.length === 1) return colors[0];
  
  // Convert hex colors to RGB
  const rgbColors = colors.map(color => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  });
  
  // Calculate average color
  const avgR = Math.round(rgbColors.reduce((sum, color) => sum + color.r, 0) / rgbColors.length);
  const avgG = Math.round(rgbColors.reduce((sum, color) => sum + color.g, 0) / rgbColors.length);
  const avgB = Math.round(rgbColors.reduce((sum, color) => sum + color.b, 0) / rgbColors.length);
  
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
}

/**
 * Evaluates formulas against data rows and returns cells that should be highlighted
 * Enhanced with better performance and error handling
 */
export function evaluateFormulas(
  formulas: Formula[],
  data: DataRow[],
  columns: string[]
): HighlightedCell[] {
  const highlightedCells: HighlightedCell[] = [];
  const dateColumns = columns.filter(col => !['Variable', 'id'].includes(col));
  
  // Filter only active formulas
  const activeFormulas = formulas.filter(f => f.active !== false);
  
  if (activeFormulas.length === 0 || data.length === 0) {
    return highlightedCells;
  }
  
  // Pre-parse all formulas for better performance
  const parsedFormulas = activeFormulas.map(formula => {
    try {
      const parsed = parseFormula(formula.formula);
      return { ...formula, parsed };
    } catch (error) {
      console.error(`Error parsing formula '${formula.name}':`, error);
      return null;
    }
  }).filter(Boolean) as (Formula & { parsed: ReturnType<typeof parseFormula> })[];
  
  // Process each date column
  dateColumns.forEach(dateCol => {
    // Create a map of all variables for this date column across all rows
    const variables: Record<string, number> = {};
    data.forEach(varRow => {
      const varName = varRow['Variable'] as string;
      if (varName && varRow[dateCol] !== null && varRow[dateCol] !== undefined) {
        const value = Number(varRow[dateCol]);
        if (!isNaN(value)) {
          variables[varName] = value;
        }
      }
    });
    
    // Skip if no valid variables for this column
    if (Object.keys(variables).length === 0) return;
    
    // Process each row in the data
    data.forEach(row => {
      const rowId = row.id;
      const variableName = row['Variable'] as string;
      
      if (!variableName) return;
      
      // Get the value for this cell
      const cellValue = row[dateCol];
      if (cellValue === null || cellValue === undefined) return;
      
      // Evaluate each formula for this cell
      const matchedFormulas = parsedFormulas.filter(formula => {
        try {
          const { parsed } = formula;
          
          // Check if all required variables are available
          const missingVariables = parsed.variables.filter(v => variables[v] === undefined);
          if (missingVariables.length > 0) {
            return false;
          }
          
          // Evaluate both sides of the expression
          const leftValue = evaluateArithmeticExpression(parsed.leftExpression, variables);
          const rightValue = evaluateArithmeticExpression(parsed.rightExpression, variables);
          
          // Store calculation details on the formula for tooltip display
          formula.leftResult = leftValue;
          formula.rightResult = rightValue;
          
          // Apply the comparison
          return applyComparison(leftValue, parsed.operator, rightValue);
        } catch (error) {
          console.error(`Error evaluating formula '${formula.name}' for cell [${rowId}, ${dateCol}]:`, error);
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
          existingCell.message = [...new Set([existingCell.message, ...matchedFormulas.map(f => f.name)])].join(', ');
          
          // Blend colors for multiple formulas
          const allColors = [existingCell.color, ...matchedFormulas.map(f => f.color)];
          existingCell.color = blendColors(allColors);
        } else {
          // Create new highlighted cell
          const colors = matchedFormulas.map(f => f.color);
          highlightedCells.push({
            row: rowId,
            col: dateCol,
            color: blendColors(colors),
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
  const value = Number(row[columnName]);
  return isNaN(value) ? null : value;
}

/**
 * Clears the formula cache (useful for testing or when formulas change)
 */
export function clearFormulaCache(): void {
  formulaCache.clear();
} 