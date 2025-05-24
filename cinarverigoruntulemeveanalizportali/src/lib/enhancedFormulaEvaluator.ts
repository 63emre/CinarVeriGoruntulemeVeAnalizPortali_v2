/**
 * Enhanced Formula Evaluator
 * 
 * Supports complex expressions like:
 * - (Var1 + Var2) > 0.001
 * - (Var1 * Var2) <= (Var3 - Var4) AND Var5 > 10
 * - Variable < 0.001 OR Variable > 1000
 */

interface FormulaCondition {
  leftExpression: string;
  operator: string;
  rightExpression: string;
  logicalOperator?: 'AND' | 'OR';
}

interface EvaluationResult {
  isValid: boolean;
  message: string;
  conditionResults?: boolean[];
  failingVariables?: string[];
}

interface Formula {
  id: string;
  name: string;
  formula: string;
  color: string;
  active: boolean;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
  formulaIds: string[];
  formulaDetails?: {
    id: string;
    name: string;
    formula: string;
    leftResult?: number;
    rightResult?: number;
  }[];
}

/**
 * Parse a complex formula into individual conditions
 */
export function parseComplexFormula(formula: string): FormulaCondition[] {
  // Split by AND/OR operators while preserving them
  const parts = formula.split(/\s+(AND|OR)\s+/);
  const conditions: FormulaCondition[] = [];
  
  for (let i = 0; i < parts.length; i += 2) {
    const conditionStr = parts[i].trim();
    const logicalOp = i + 1 < parts.length ? parts[i + 1] as 'AND' | 'OR' : undefined;
    
    // Parse individual condition
    const comparisonMatch = conditionStr.match(/(.+?)\s*([><=!]+)\s*(.+)/);
    if (comparisonMatch) {
      const [, left, operator, right] = comparisonMatch;
      
      conditions.push({
        leftExpression: left.trim(),
        operator: operator.trim(),
        rightExpression: right.trim(),
        logicalOperator: logicalOp
      });
    }
  }
  
  return conditions;
}

/**
 * Evaluate an arithmetic expression with variables
 */
export function evaluateArithmeticExpression(expression: string, variables: Record<string, number>): number {
  // Remove outer parentheses from the entire expression
  let cleanExpr = expression.replace(/^\(|\)$/g, '').trim();
  
  // Check if it's a simple number
  const numMatch = cleanExpr.match(/^-?\d+\.?\d*$/);
  if (numMatch) {
    return parseFloat(numMatch[0]);
  }

  // Extract variable names in square brackets for proper replacement
  const variableMatches = cleanExpr.match(/\[[^\]]+\]/g) || [];
  const missingVariables: string[] = [];
  
  // Replace variables in square brackets
  for (const match of variableMatches) {
    const varName = match.slice(1, -1); // Remove brackets
    
    if (variables.hasOwnProperty(varName) && variables[varName] !== undefined && !isNaN(variables[varName])) {
      // Replace all occurrences of this bracketed variable
      const escapedMatch = escapeRegExp(match);
      const regex = new RegExp(escapedMatch, 'g');
      cleanExpr = cleanExpr.replace(regex, variables[varName].toString());
    } else {
      missingVariables.push(varName);
      // Replace missing variables with 0 to avoid syntax errors
      const escapedMatch = escapeRegExp(match);
      const regex = new RegExp(escapedMatch, 'g');
      cleanExpr = cleanExpr.replace(regex, '0');
    }
  }

  // Also handle variables without brackets (for backward compatibility)
  const sortedVariableNames = Object.keys(variables).sort((a, b) => b.length - a.length);
  
  for (const varName of sortedVariableNames) {
    const value = variables[varName];
    if (value !== undefined && !isNaN(value)) {
      // Only replace if it's not already in brackets (to avoid double replacement)
      if (!cleanExpr.includes(`[${varName}]`)) {
        const escapedVarName = escapeRegExp(varName);
        const regex = new RegExp(`\\b${escapedVarName}\\b`, 'g');
        cleanExpr = cleanExpr.replace(regex, value.toString());
      }
    }
  }

  // Clean up multiple spaces and trim
  cleanExpr = cleanExpr.replace(/\s+/g, ' ').trim();

  // Evaluate the mathematical expression
  try {
    // Check for valid mathematical expression
    if (!/^[-+*/()\d.\s]+$/.test(cleanExpr)) {
      throw new Error('Invalid characters in expression after variable replacement');
    }

    // Check for empty parentheses or invalid patterns
    if (cleanExpr.includes('()') || cleanExpr.includes('(-)') || cleanExpr.includes('(+)')) {
      throw new Error('Expression contains empty or invalid parentheses after variable replacement');
    }

    // Additional safety: check for common issues
    if (cleanExpr === '' || cleanExpr === ' ') {
      throw new Error('Empty expression after variable replacement');
    }

    // Use Function constructor for safe evaluation (better than eval)
    const result = new Function('return ' + cleanExpr)();

    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Expression did not evaluate to a number');
    }

    // Log missing variables if any (only in development)
    if (missingVariables.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('Variables not found in data (replaced with 0):', missingVariables);
    }

    return result;
  } catch (error) {
    console.error('Error evaluating arithmetic expression:', {
      original: expression,
      cleaned: cleanExpr,
      availableVariables: Object.keys(variables),
      missingVariables: missingVariables,
      error: error
    });
    throw new Error(`Cannot evaluate expression: ${expression}`);
  }
}

/**
 * Apply comparison operator
 */
export function applyComparison(left: number, operator: string, right: number): boolean {
  switch (operator) {
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '==':
      return Math.abs(left - right) < 1e-10; // Handle floating point precision
    case '!=':
      return Math.abs(left - right) >= 1e-10;
    default:
      throw new Error(`Unknown comparison operator: ${operator}`);
  }
}

/**
 * Extract variable names from an expression
 */
export function extractVariables(expression: string): string[] {
  const variables: string[] = [];
  
  // First, extract variables in square brackets
  const bracketMatches = expression.match(/\[[^\]]+\]/g) || [];
  for (const match of bracketMatches) {
    const rawVarName = match.slice(1, -1); // Remove brackets
    // Clean the variable name by removing trailing commas and trimming whitespace
    const cleanVarName = rawVarName.replace(/,+$/, '').trim();
    if (cleanVarName) {
      variables.push(cleanVarName);
    }
  }
  
  // Also extract variables without brackets (for backward compatibility)
  // Remove square bracket variables first to avoid double extraction
  let cleanExpression = expression;
  for (const match of bracketMatches) {
    cleanExpression = cleanExpression.replace(match, ' ');
  }
  
  // Remove parentheses and operators, split by spaces and operators
  const cleaned = cleanExpression.replace(/[()]/g, ' ');
  
  // Split by mathematical operators but preserve the text between them
  const parts = cleaned.split(/[\s+\-*/=<>!]+/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    // If it's not a number and not empty, it's probably a variable
    // Allow Unicode characters in variable names (like Turkish: İletkenlik)
    if (trimmed && !/^-?\d+\.?\d*$/.test(trimmed) && trimmed !== '') {
      // Clean the variable name by removing trailing commas and trimming whitespace
      const cleanVarName = trimmed.replace(/,+$/, '').trim();
      if (cleanVarName) {
        variables.push(cleanVarName);
      }
    }
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Evaluate a complex formula with multiple conditions
 */
export function evaluateComplexFormula(
  formula: string, 
  variables: Record<string, number>
): EvaluationResult {
  try {
    const conditions = parseComplexFormula(formula);
    
    if (conditions.length === 0) {
      return {
        isValid: false,
        message: 'No valid conditions found in formula'
      };
    }
    
    const conditionResults: boolean[] = [];
    const failingVariables: string[] = [];
    
    // Evaluate each condition
    for (const condition of conditions) {
      try {
        const leftValue = evaluateArithmeticExpression(condition.leftExpression, variables);
        const rightValue = evaluateArithmeticExpression(condition.rightExpression, variables);
        
        const result = applyComparison(leftValue, condition.operator, rightValue);
        conditionResults.push(result);
        
        if (!result) {
          // Add variables from this failing condition
          const leftVars = extractVariables(condition.leftExpression);
          const rightVars = extractVariables(condition.rightExpression);
          failingVariables.push(...leftVars, ...rightVars);
        }
      } catch {
        conditionResults.push(false);
        // Add all variables from this condition as potentially failing
        const leftVars = extractVariables(condition.leftExpression);
        const rightVars = extractVariables(condition.rightExpression);
        failingVariables.push(...leftVars, ...rightVars);
      }
    }
    
    // Apply logical operators
    let finalResult = conditionResults[0];
    
    for (let i = 1; i < conditions.length; i++) {
      const logicalOp = conditions[i - 1].logicalOperator;
      
      if (logicalOp === 'AND') {
        finalResult = finalResult && conditionResults[i];
      } else if (logicalOp === 'OR') {
        finalResult = finalResult || conditionResults[i];
      }
    }
    
    return {
      isValid: finalResult,
      message: finalResult ? 'All conditions met' : 'One or more conditions failed',
      conditionResults,
      failingVariables: [...new Set(failingVariables)]
    };
    
  } catch (error) {
    return {
      isValid: false,
      message: `Formula evaluation error: ${(error as Error).message}`,
      failingVariables: extractVariables(formula)
    };
  }
}

/**
 * Enhanced formula evaluation for table data
 */
export function evaluateFormulasForTable(
  formulas: Formula[],
  tableData: {
    columns: string[];
    data: (string | number | null)[][];
  }
): HighlightedCell[] {
  const highlightedCells: HighlightedCell[] = [];
  const activeFormulas = formulas.filter(f => f.active !== false);
  
  if (activeFormulas.length === 0 || !tableData.data.length) {
    return highlightedCells;
  }
  
  const { columns, data } = tableData;
  
  // Find variable column
  const variableColumnIndex = columns.findIndex(col => col === 'Variable');
  if (variableColumnIndex === -1) {
    console.warn('No Variable column found in table');
    return highlightedCells;
  }
  
  // Find date columns (exclude standard columns)
  const standardColumns = ['id', 'Variable', 'Data Source', 'Method', 'Unit', 'LOQ'];
  const dateColumns = columns.filter(col => !standardColumns.includes(col));
  
  // Process each date column
  dateColumns.forEach((dateCol) => {
    const dateColIndex = columns.indexOf(dateCol);
    if (dateColIndex === -1) return;
    
    // Create variables map for this date column
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
        }
      }
    });
    
    // Skip if no valid variables for this column
    if (Object.keys(variables).length === 0) return;
    
    // Evaluate each formula for this date column
    activeFormulas.forEach(formula => {
      try {
        const result = evaluateComplexFormula(formula.formula, variables);
        
        if (result.isValid) {
          // Get all variables used in the formula
          const allFormulaVariables = extractVariables(formula.formula);
          
          // Separate variables that exist in data vs those that are missing
          const existingVariables = allFormulaVariables.filter(varName => 
            variables.hasOwnProperty(varName) && !isNaN(variables[varName])
          );
          const missingVariables = allFormulaVariables.filter(varName => 
            !variables.hasOwnProperty(varName) || isNaN(variables[varName])
          );
          
          // Only highlight cells for variables that actually exist in the data
          // This prevents highlighting cells for variables that are missing/replaced with 0
          const variablesToHighlight = result.failingVariables 
            ? result.failingVariables.filter(varName => existingVariables.includes(varName))
            : existingVariables;
          
          // Log missing variables for debugging
          if (missingVariables.length > 0 && process.env.NODE_ENV === 'development') {
            console.warn(`Formula "${formula.name}" references missing variables:`, missingVariables);
          }
          
          // Highlight cells for variables that exist and are causing the formula to pass
          data.forEach((row, rowIndex) => {
            const rawVarName = row[variableColumnIndex] as string;
            // Clean the variable name by removing trailing commas and trimming whitespace
            const cleanVarName = rawVarName ? rawVarName.replace(/,+$/, '').trim() : '';
            
            if (cleanVarName && variablesToHighlight.includes(cleanVarName)) {
              // Check if this cell is already highlighted
              const existingCell = highlightedCells.find(
                cell => cell.row === `row-${rowIndex}` && cell.col === dateCol
              );
              
              if (existingCell) {
                // Merge with existing highlight
                existingCell.formulaIds.push(formula.id);
                existingCell.message = `${existingCell.message}, ${formula.name}`;
                
                // Blend colors if different
                if (existingCell.color !== formula.color) {
                  existingCell.color = blendColors([existingCell.color, formula.color]);
                }
                
                // Add formula details
                if (existingCell.formulaDetails) {
                  existingCell.formulaDetails.push({
                    id: formula.id,
                    name: formula.name,
                    formula: formula.formula
                  });
                }
              } else {
                // Create new highlight
                highlightedCells.push({
                  row: `row-${rowIndex}`,
                  col: dateCol,
                  color: formula.color,
                  message: formula.name,
                  formulaIds: [formula.id],
                  formulaDetails: [{
                    id: formula.id,
                    name: formula.name,
                    formula: formula.formula
                  }]
                });
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error evaluating formula ${formula.name}:`, error);
        // For formulas that completely fail to evaluate, we might want to highlight all involved variables
        // but only if they exist in the data
        const allFormulaVariables = extractVariables(formula.formula);
        const existingVariables = allFormulaVariables.filter(varName => 
          variables.hasOwnProperty(varName) && !isNaN(variables[varName])
        );
        
        data.forEach((row, rowIndex) => {
          const varName = row[variableColumnIndex] as string;
          if (varName && existingVariables.includes(varName)) {
            highlightedCells.push({
              row: `row-${rowIndex}`,
              col: dateCol,
              color: '#ff6b6b', // Red color for evaluation errors
              message: `${formula.name} (Değerlendirme Hatası)`,
              formulaIds: [formula.id],
              formulaDetails: [{
                id: formula.id,
                name: formula.name,
                formula: formula.formula
              }]
            });
          }
        });
      }
    });
  });
  
  return highlightedCells;
}

/**
 * Blend multiple colors for cells with multiple formula matches
 */
function blendColors(colors: string[]): string {
  if (colors.length === 1) return colors[0];
  
  const rgbColors = colors.map(color => hexToRgb(color));
  
  const avgR = Math.round(rgbColors.reduce((sum, color) => sum + color.r, 0) / rgbColors.length);
  const avgG = Math.round(rgbColors.reduce((sum, color) => sum + color.g, 0) / rgbColors.length);
  const avgB = Math.round(rgbColors.reduce((sum, color) => sum + color.b, 0) / rgbColors.length);
  
  return `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Validate a formula expression
 */
export function validateFormula(formula: string, availableVariables: string[]): {
  isValid: boolean;
  error?: string;
  missingVariables?: string[];
} {
  try {
    const conditions = parseComplexFormula(formula);
    
    if (conditions.length === 0) {
      return {
        isValid: false,
        error: 'No valid conditions found in formula'
      };
    }
    
    const usedVariables = new Set<string>();
    
    // Extract all variables used in the formula
    conditions.forEach(condition => {
      const leftVars = extractVariables(condition.leftExpression);
      const rightVars = extractVariables(condition.rightExpression);
      
      [...leftVars, ...rightVars].forEach(v => usedVariables.add(v));
    });
    
    // Check for missing variables
    const missingVariables = Array.from(usedVariables).filter(
      v => !availableVariables.includes(v)
    );
    
    if (missingVariables.length > 0) {
      return {
        isValid: false,
        error: `Unknown variables: ${missingVariables.join(', ')}`,
        missingVariables
      };
    }
    
    // Try to evaluate with dummy data to check syntax
    const dummyVariables: Record<string, number> = {};
    availableVariables.forEach(v => {
      dummyVariables[v] = 1; // Use 1 as dummy value
    });
    
    evaluateComplexFormula(formula, dummyVariables);
    
    return {
      isValid: true
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message
    };
  }
}

// Export for backward compatibility with existing code
export { evaluateFormulasForTable as evaluateFormulas }; 