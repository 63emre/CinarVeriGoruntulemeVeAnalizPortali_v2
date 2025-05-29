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
  // ENHANCED: Add scope support
  scope?: 'table' | 'workspace';
  tableId?: string | null;
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
    color: string;
  }[];
}

/**
 * ENHANCED: Parse a complex formula into individual conditions
 * Now supports both variable-to-constant and variable-to-variable comparisons
 * FIXED: Better support for complex expressions on both sides
 * Examples:
 * - "İletkenlik > 312" (variable to constant)
 * - "(İletkenlik + Toplam Fosfor) > (Orto Fosfat - Alkalinite Tayini)" (expression to expression)
 * - "Variable < 0.001 OR Variable > 1000" (multiple conditions)
 * - "İletkenlik + 50 > Orto Fosfat * 2" (mixed variables and constants)
 */
export function parseComplexFormula(formula: string): FormulaCondition[] {
  // Clean the formula first
  let cleanFormula = formula.trim();
  
  // Handle square brackets for variables (convert to standard format)
  cleanFormula = cleanFormula.replace(/\[([^\]]+)\]/g, '$1');
  
  // Split by AND/OR operators while preserving them
  const parts = cleanFormula.split(/\s+(AND|OR)\s+/i);
  const conditions: FormulaCondition[] = [];
  
  for (let i = 0; i < parts.length; i += 2) {
    const conditionStr = parts[i].trim();
    const logicalOp = i + 1 < parts.length ? parts[i + 1].toUpperCase() as 'AND' | 'OR' : undefined;
    
    // ENHANCED: Better parsing to handle complex expressions with parentheses and mixed operands
    // Match patterns like: (expr) op (expr) or expr op expr or expr op constant
    const comparisonMatch = conditionStr.match(/(.+?)\s*([><=!]+)\s*(.+)/);
    if (comparisonMatch) {
      let [, left, operator, right] = comparisonMatch;
      
      // Clean and normalize the expressions
      left = left.trim();
      right = right.trim();
      operator = operator.trim();
      
      // FIXED: Better handling of parentheses and complex expressions
      // If expression contains arithmetic operators but no parentheses, add them for clarity
      const hasArithmetic = (expr: string) => /[+\-*/]/.test(expr) && !expr.match(/^\d+(\.\d+)?$/);
      
      if (!left.startsWith('(') && hasArithmetic(left)) {
        left = `(${left})`;
      }
      if (!right.startsWith('(') && hasArithmetic(right)) {
        right = `(${right})`;
      }
      
      // FIXED: Handle mixed variable and constant expressions
      // Examples: "İletkenlik + 50", "Orto Fosfat * 2", "300"
      const processExpression = (expr: string): string => {
        // Remove outer parentheses if they exist
        const cleaned = expr.replace(/^\(|\)$/g, '').trim();
        
        // If it's just a number, return as is
        if (/^\d+(\.\d+)?$/.test(cleaned)) {
          return cleaned;
        }
        
        // If it contains arithmetic, ensure proper spacing
        return cleaned.replace(/([+\-*/])/g, ' $1 ').replace(/\s+/g, ' ').trim();
      };
      
      conditions.push({
        leftExpression: processExpression(left),
        operator: operator,
        rightExpression: processExpression(right),
        logicalOperator: logicalOp
      });
    }
  }
  
  return conditions;
}

/**
 * ENHANCED: Evaluate an arithmetic expression with variables
 * Now supports both simple variables/constants and complex expressions
 * Examples:
 * - "İletkenlik" -> returns value of İletkenlik variable
 * - "312" -> returns 312
 * - "(İletkenlik + Toplam Fosfor)" -> returns sum of two variables
 * - "(Orto Fosfat - Alkalinite Tayini)" -> returns difference of two variables
 */
export function evaluateArithmeticExpression(expression: string, variables: Record<string, number>): number {
  // Remove outer parentheses from the entire expression
  let cleanExpr = expression.replace(/^\(|\)$/g, '').trim();
  
  // Check if it's a simple number first
  const numMatch = cleanExpr.match(/^-?\d+\.?\d*$/);
  if (numMatch) {
    return parseFloat(numMatch[0]);
  }

  // Check if it's a simple variable name (no operators)
  if (!cleanExpr.match(/[+\-*/]/)) {
    // It's a single variable
    const varName = cleanExpr.trim();
    if (variables.hasOwnProperty(varName) && variables[varName] !== undefined && !isNaN(variables[varName])) {
      return variables[varName];
    } else {
      // Try to find a close match (case-insensitive, trimmed)
      const cleanVarName = varName.toLowerCase().trim();
      const matchingKey = Object.keys(variables).find(key => 
        key.toLowerCase().trim() === cleanVarName
      );
      if (matchingKey && !isNaN(variables[matchingKey])) {
        return variables[matchingKey];
      }
      throw new Error(`Variable not found: ${varName}`);
    }
  }

  // Handle complex expressions with multiple variables and operators
  const missingVariables: string[] = [];
  
  // Replace variables with their values
  // Sort by length (longest first) to avoid partial replacements
  const sortedVariableNames = Object.keys(variables).sort((a, b) => b.length - a.length);
  
  for (const varName of sortedVariableNames) {
    const value = variables[varName];
    if (value !== undefined && !isNaN(value)) {
      // Use word boundaries to ensure we don't replace partial matches
      // But be flexible with Turkish characters and spaces
      const escapedVarName = escapeRegExp(varName);
      const regex = new RegExp(`\\b${escapedVarName}\\b`, 'gi');
      
      // Check if this variable exists in the expression
      if (regex.test(cleanExpr)) {
        cleanExpr = cleanExpr.replace(regex, value.toString());
      }
    }
  }

  // Also handle variables in square brackets (for backward compatibility)
  const variableMatches = cleanExpr.match(/\[[^\]]+\]/g) || [];
  for (const match of variableMatches) {
    const varName = match.slice(1, -1); // Remove brackets
    
    if (variables.hasOwnProperty(varName) && variables[varName] !== undefined && !isNaN(variables[varName])) {
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

  // Clean up multiple spaces and trim
  cleanExpr = cleanExpr.replace(/\s+/g, ' ').trim();

  // Evaluate the mathematical expression
  try {
    // Enhanced validation for mathematical expressions
    // Allow numbers, operators, parentheses, and spaces
    if (!/^[-+*/()\d.\s]+$/.test(cleanExpr)) {
      // Check what characters are causing issues
      const invalidChars = cleanExpr.match(/[^-+*/()\d.\s]/g);
      throw new Error(`Invalid characters in expression: ${invalidChars?.join(', ')} in "${cleanExpr}"`);
    }

    // Check for empty parentheses or invalid patterns
    if (cleanExpr.includes('()') || cleanExpr.includes('(-)') || cleanExpr.includes('(+)')) {
      throw new Error('Expression contains empty or invalid parentheses');
    }

    // Additional safety: check for empty expression
    if (cleanExpr === '' || cleanExpr === ' ') {
      throw new Error('Empty expression after variable replacement');
    }

    // Use Function constructor for safe evaluation (better than eval)
    const result = new Function('return ' + cleanExpr)();

    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error(`Expression did not evaluate to a number: ${result}`);
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
      variableValues: variables,
      missingVariables: missingVariables,
      error: error
    });
    throw new Error(`Cannot evaluate expression: ${expression} -> ${cleanExpr}`);
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
 * FIXED: Row locking issue - now uses proper row identification
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
  
  // FIXED: Create a mapping of variable names to their row indices for proper row identification
  const variableToRowMap = new Map<string, number>();
  data.forEach((row, rowIndex) => {
    const rawVarName = row[variableColumnIndex] as string;
    if (rawVarName) {
      const cleanVarName = rawVarName.replace(/,+$/, '').trim();
      if (cleanVarName) {
        variableToRowMap.set(cleanVarName, rowIndex);
      }
    }
  });
  
  // Process each date column
  dateColumns.forEach((dateCol) => {
    const dateColIndex = columns.indexOf(dateCol);
    if (dateColIndex === -1) return;
    
    // Create variables map for this date column
    const variables: Record<string, number> = {};
    
    data.forEach((row) => {
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
          
          // FIXED: Highlight cells for variables that are part of the TRUE condition
          // Use the variable-to-row mapping to ensure correct row identification
          existingVariables.forEach(varName => {
            const rowIndex = variableToRowMap.get(varName);
            if (rowIndex !== undefined) {
              // FIXED: Use proper row ID format to match TablePage expectations
              const rowId = `row-${rowIndex + 1}`;
              
              // Check if this cell is already highlighted
              const existingCell = highlightedCells.find(
                cell => cell.row === rowId && cell.col === dateCol
              );
              
              if (existingCell) {
                // Merge with existing highlight - ENHANCED for pizza slice effect
                if (!existingCell.formulaIds.includes(formula.id)) {
                  existingCell.formulaIds.push(formula.id);
                  existingCell.message = `${existingCell.message}, ${formula.name}`;
                  
                  // PIZZA SLICE: Don't blend colors, keep them separate for gradient
                  // existingCell.color remains the first formula's color for backward compatibility
                  
                  // Add formula details for pizza slice rendering
                  if (existingCell.formulaDetails) {
                    existingCell.formulaDetails.push({
                      id: formula.id,
                      name: formula.name,
                      formula: formula.formula,
                      leftResult: result.leftResult,
                      rightResult: result.rightResult,
                      color: formula.color // IMPORTANT: Keep individual formula colors
                    });
                  }
                  
                  console.log(`🍕 PIZZA SLICE SETUP: Cell [${rowId}, ${dateCol}] now has ${existingCell.formulaIds.length} formulas:`, {
                    formulaNames: existingCell.formulaDetails?.map(d => d.name),
                    formulaColors: existingCell.formulaDetails?.map(d => d.color)
                  });
                }
              } else {
                // Create new highlight
                highlightedCells.push({
                  row: rowId,
                  col: dateCol,
                  color: formula.color,
                  message: formula.name,
                  formulaIds: [formula.id],
                  formulaDetails: [{
                    id: formula.id,
                    name: formula.name,
                    formula: formula.formula,
                    leftResult: result.leftResult,
                    rightResult: result.rightResult,
                    color: formula.color // IMPORTANT: Store individual formula color
                  }]
                });
                
                console.log(`🎨 NEW HIGHLIGHT: Cell [${rowId}, ${dateCol}] created for formula: ${formula.name}`);
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
        
        existingVariables.forEach(varName => {
          const rowIndex = variableToRowMap.get(varName);
          if (rowIndex !== undefined) {
            highlightedCells.push({
              row: `row-${rowIndex + 1}`,
              col: dateCol,
              color: '#ff6b6b', // Red color for evaluation errors
              message: `${formula.name} (Değerlendirme Hatası)`,
              formulaIds: [formula.id],
              formulaDetails: [{
                id: formula.id,
                name: formula.name,
                formula: formula.formula,
                color: '#ff6b6b' // Add required color property
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

/**
 * ENHANCED: Tek yönlü formül kısıtlaması validatörü
 * Tablo görüntüleme ekranında kullanılmak üzere, formülün sol tarafında 
 * yalnızca tek bir değişken olmasını sağlar
 */
export function validateUnidirectionalFormula(formula: string, availableVariables: string[]): {
  isValid: boolean;
  error?: string;
  missingVariables?: string[];
  leftVariables?: string[];
  rightVariables?: string[];
  targetVariable?: string; // YENI: Hangi değişkenin vurgulanacağını belirtir
} {
  try {
    const conditions = parseComplexFormula(formula);
    
    if (conditions.length === 0) {
      return {
        isValid: false,
        error: 'Formülde geçerli koşul bulunamadı'
      };
    }
    
    // ENHANCED: Tek yönlü kısıtlama - Sadece tek bir karşılaştırma koşuluna izin ver
    if (conditions.length > 1) {
      return {
        isValid: false,
        error: 'Tablo görüntüleme modunda birden fazla koşul (AND/OR) desteklenmez. Her formül tek bir karşılaştırma içermelidir. Örnek: "İletkenlik > 300" ✓, "İletkenlik > 300 AND pH < 7" ✗'
      };
    }
    
    const condition = conditions[0];
    
    // Sol ve sağ taraftaki değişkenleri çıkar
    const leftVars = extractVariables(condition.leftExpression);
    const rightVars = extractVariables(condition.rightExpression);
    
    // TEK YÖNLÜ KISITLAMA: Sol tarafta yalnızca tek değişken olmalı
    if (leftVars.length === 0) {
      return {
        isValid: false,
        error: 'Formülün sol tarafında bir değişken bulunmalıdır. Örnek: "İletkenlik > 300"',
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    if (leftVars.length > 1) {
      return {
        isValid: false,
        error: `Tablo görüntüleme modunda sol tarafta yalnızca TEK değişken kullanılabilir. Şu anda ${leftVars.length} değişken var: ${leftVars.join(', ')}. Doğru örnek: "İletkenlik > Alkalinite + 3" ✓, Yanlış örnek: "(İletkenlik + pH) > 300" ✗`,
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    // ENHANCED: Sol taraftaki ifadenin temiz olması kontrolü
    const leftExpr = condition.leftExpression.trim().replace(/^\(|\)$/g, '');
    const hasLeftArithmetic = /[+\-*/]/.test(leftExpr);
    
    if (hasLeftArithmetic) {
      return {
        isValid: false,
        error: `Tablo görüntüleme modunda sol tarafta aritmetik işlemler kullanılamaz. Sol taraf: "${leftExpr}". Doğru format: "İletkenlik > 300" ✓ veya "İletkenlik > Alkalinite + 3" ✓, Yanlış format: "(İletkenlik + 50) > 300" ✗`,
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    // ENHANCED: Operator kontrolü - desteklenen operatörler
    const supportedOperators = ['>', '<', '>=', '<=', '==', '!=', '='];
    if (!supportedOperators.includes(condition.operator)) {
      return {
        isValid: false,
        error: `Desteklenmeyen operatör: "${condition.operator}". Desteklenen operatörler: ${supportedOperators.join(', ')}`,
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    // Tüm değişkenlerin mevcut olup olmadığını kontrol et
    const allVars = [...leftVars, ...rightVars];
    const missingVariables = allVars.filter(v => !availableVariables.includes(v));
    
    if (missingVariables.length > 0) {
      return {
        isValid: false,
        error: `Tanımsız değişkenler: ${missingVariables.join(', ')}. Mevcut değişkenler: ${availableVariables.slice(0, 5).join(', ')}${availableVariables.length > 5 ? '...' : ''}`,
        missingVariables,
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    // ENHANCED: Mantık kontrolü - sol taraftaki değişken sağ tarafta da varsa uyarı
    if (rightVars.includes(leftVars[0])) {
      return {
        isValid: false,
        error: `"${leftVars[0]}" değişkeni hem sol hem sağ tarafta kullanılıyor. Bu çembersel referans yaratabilir. Örnek düzeltme: "${leftVars[0]} > sabit_değer" veya "${leftVars[0]} > başka_değişken + sabit"`,
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    // ENHANCED: Sentaks kontrolü için dummy verilerle test et
    const dummyVariables: Record<string, number> = {};
    availableVariables.forEach(v => {
      dummyVariables[v] = Math.random() * 100 + 1; // Realistic test values
    });
    
    try {
      const result = evaluateComplexFormula(formula, dummyVariables);
      if (!result.isValid) {
        return {
          isValid: false,
          error: `Formül değerlendirme hatası: ${result.message}`,
          leftVariables: leftVars,
          rightVariables: rightVars
        };
      }
    } catch (evalError) {
      return {
        isValid: false,
        error: `Formül test hatası: ${(evalError as Error).message}`,
        leftVariables: leftVars,
        rightVariables: rightVars
      };
    }
    
    return {
      isValid: true,
      leftVariables: leftVars,
      rightVariables: rightVars,
      targetVariable: leftVars[0] // Vurgulanacak hedef değişken
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: `Formül analiz hatası: ${(error as Error).message}`
    };
  }
}

/**
 * YENI: Formül kapsamı (scope) validatörü
 * Formülün hangi kapsamda kullanılacağını belirler ve doğrular
 */
export function validateFormulaScope(
  formula: string, 
  scope: 'table' | 'workspace',
  availableVariables: string[],
  tableId?: string
): {
  isValid: boolean;
  error?: string;
  warnings?: string[];
} {
  const warnings: string[] = [];
  
  try {
    // Temel formül validasyonu
    const basicValidation = validateFormula(formula, availableVariables);
    if (!basicValidation.isValid) {
      return {
        isValid: false,
        error: basicValidation.error
      };
    }
    
    // Scope özel kontrolleri
    if (scope === 'table') {
      // Tablo kapsamı için tek yönlü kısıtlamayı kontrol et
      const unidirectionalValidation = validateUnidirectionalFormula(formula, availableVariables);
      if (!unidirectionalValidation.isValid) {
        return {
          isValid: false,
          error: `Tablo kapsamı için: ${unidirectionalValidation.error}`
        };
      }
      
      if (!tableId) {
        warnings.push('Tablo kapsamı seçildi ancak tablo ID belirtilmedi');
      }
      
      // Tek yönlü formüller için ipucu
      if (unidirectionalValidation.targetVariable) {
        warnings.push(`Bu formül "${unidirectionalValidation.targetVariable}" sütunundaki hücreleri vurgulayacak`);
      }
      
    } else if (scope === 'workspace') {
      // Workspace kapsamı için çoklu koşullara izin ver
      const conditions = parseComplexFormula(formula);
      if (conditions.length > 3) {
        warnings.push('Çok karmaşık formüller performansı etkileyebilir. 3\'den az koşul kullanmanız önerilir.');
      }
      
      // Workspace kapsamında kullanılan değişkenlerin genel olduğunu kontrol et
      const allVars = extractVariables(formula);
      if (allVars.length > 5) {
        warnings.push(`Formülde ${allVars.length} değişken kullanılıyor. Çok sayıda değişken performansı etkileyebilir.`);
      }
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: `Kapsam validasyon hatası: ${(error as Error).message}`
    };
  }
}

/**
 * ENHANCED: Ana formül değerlendirme fonksiyonuna kapsam desteği ekleme
 */
export function evaluateFormulasForTableWithScope(
  formulas: Formula[],
  tableData: {
    columns: string[];
    data: (string | number | null)[][];
  },
  targetTableId?: string
): HighlightedCell[] {
  // Formülleri kapsama göre filtrele
  const applicableFormulas = formulas.filter(formula => {
    if (!formula.active) return false;
    
    // Tablo kapsamı - sadece belirtilen tablo için
    if (formula.scope === 'table') {
      return targetTableId ? formula.tableId === targetTableId : false;
    }
    
    // Workspace kapsamı - her zaman uygula
    if (formula.scope === 'workspace') {
      return true;
    }
    
    // Geriye uyumluluk: scope belirtilmemişse tableId'ye göre karar ver
    if (!formula.scope) {
      if (formula.tableId === null) {
        return true; // Genel formül
      }
      return targetTableId ? formula.tableId === targetTableId : false;
    }
    
    return false;
  });
  
  console.log(`🎯 Scope filtering: ${formulas.length} total formulas -> ${applicableFormulas.length} applicable for table ${targetTableId}`);
  
  // Mevcut fonksiyonu kullan
  return evaluateFormulasForTable(applicableFormulas, tableData);
}

// Export for backward compatibility with existing code
export { evaluateFormulasForTable as evaluateFormulas }; 