/**
 * Enhanced Formula Evaluator
 * 
 * Supports complex expressions like:
 * - (Var1 + Var2) > 0.001
 * - (Var1 * Var2) <= (Var3 - Var4) AND Var5 > 10
 * - Variable < 0.001 OR Variable > 1000
 * 
 * FIXED: Proper left/right operand evaluation and highlighting logic
 */

interface FormulaCondition {
  leftExpression: string;
  operator: string;
  rightExpression: string;
  logicalOperator?: 'AND' | 'OR';
}

interface EvaluationResult {
  isValid: boolean;
  result: boolean; // TRUE means condition is met (should highlight)
  message: string;
  conditionResults?: boolean[];
  leftResult?: number;
  rightResult?: number;
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
    const varName = match.slice(1, -1); // Remove brackets
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  
  // Then extract variables without brackets (for backward compatibility)
  // This is more complex as we need to avoid matching numbers or operators
  const withoutBrackets = expression.replace(/\[[^\]]+\]/g, ''); // Remove bracketed variables first
  const wordMatches = withoutBrackets.match(/[a-zA-ZğüşıöçĞÜŞIÖÇ][a-zA-ZğüşıöçĞÜŞIÖÇ0-9\s\-()]+/g) || [];
  
  for (const match of wordMatches) {
    const cleaned = match.trim();
    // Skip operators and numbers
    if (cleaned && 
        !['AND', 'OR', 'and', 'or'].includes(cleaned) &&
        !/^[0-9.]+$/.test(cleaned) &&
        !/^[><=!]+$/.test(cleaned) &&
        !variables.includes(cleaned)) {
      variables.push(cleaned);
    }
  }
  
  return variables;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Enhanced formula evaluation with better condition checking
 */
export function evaluateComplexFormula(
  formula: string, 
  variables: Record<string, number>
): EvaluationResult {
  try {
    console.log(`Evaluating formula: ${formula}`);
    console.log(`Available variables:`, variables);
    
    const conditions = parseComplexFormula(formula);
    
    if (conditions.length === 0) {
      return {
        isValid: false,
        result: false,
        message: 'No valid conditions found in formula'
      };
    }
    
    const conditionResults: boolean[] = [];
    let leftResult: number | undefined;
    let rightResult: number | undefined;
    
    // Evaluate each condition
    for (const condition of conditions) {
      try {
        const leftValue = evaluateArithmeticExpression(condition.leftExpression, variables);
        const rightValue = evaluateArithmeticExpression(condition.rightExpression, variables);
        
        // Store results for the first condition (for tooltip display)
        if (leftResult === undefined) leftResult = leftValue;
        if (rightResult === undefined) rightResult = rightValue;
        
        const conditionResult = applyComparison(leftValue, condition.operator, rightValue);
        conditionResults.push(conditionResult);
        
        console.log(`Condition: ${leftValue} ${condition.operator} ${rightValue} = ${conditionResult}`);
      } catch (error) {
        console.error(`Error evaluating condition:`, error);
        conditionResults.push(false);
      }
    }
    
    // Apply logical operators between conditions
    let finalResult = conditionResults[0] || false;
    
    for (let i = 1; i < conditionResults.length; i++) {
      const logicalOp = conditions[i-1].logicalOperator;
      if (logicalOp === 'AND') {
        finalResult = finalResult && conditionResults[i];
      } else if (logicalOp === 'OR') {
        finalResult = finalResult || conditionResults[i];
      }
    }
    
    console.log(`Final result: ${finalResult}`);
    
    return {
      isValid: true,
      result: finalResult,
      message: finalResult ? 'Condition met' : 'Condition not met',
      conditionResults,
      leftResult,
      rightResult
    };
  } catch (error) {
    console.error('Error in evaluateComplexFormula:', error);
    return {
      isValid: false,
      result: false,
      message: `Error: ${(error as Error).message}`
    };
  }
}

/**
 * Clean and parse a value from table data
 */
function cleanAndParseValue(value: string | number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    // Remove common non-numeric characters and trim
    const cleaned = value.replace(/[^\d.-]/g, '').trim();
    
    if (cleaned === '' || cleaned === '-') {
      return null;
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

/**
 * FIXED: Main function to evaluate formulas for table highlighting
 * Now properly highlights cells only when formula conditions are TRUE
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
        
        // Use the new cleaning function to handle special values
        const numValue = cleanAndParseValue(value);
        if (numValue !== null && cleanVarName) {
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
        
        // FIXED: Only highlight when formula condition is TRUE (result.result === true)
        if (result.isValid && result.result === true) {
          // Get all variables used in the formula
          const allFormulaVariables = extractVariables(formula.formula);
          
          // Only highlight variables that exist in the data
          const existingVariables = allFormulaVariables.filter(varName => 
            variables.hasOwnProperty(varName) && !isNaN(variables[varName])
          );
          
          // Highlight cells for variables that are part of the TRUE condition
          data.forEach((row, rowIndex) => {
            const rawVarName = row[variableColumnIndex] as string;
            // Clean the variable name by removing trailing commas and trimming whitespace
            const cleanVarName = rawVarName ? rawVarName.replace(/,+$/, '').trim() : '';
            
            if (cleanVarName && existingVariables.includes(cleanVarName)) {
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
                    formula: formula.formula,
                    leftResult: result.leftResult,
                    rightResult: result.rightResult
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
                    formula: formula.formula,
                    leftResult: result.leftResult,
                    rightResult: result.rightResult
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