/**
 * Enhanced Formula Evaluator - Ana Formül Değerlendirici
 * 
 * Supports complex expressions like:
 * - (Var1 + Var2) > 0.001
 * - (Var1 * Var2) <= (Var3 - Var4) AND Var5 > 10
 * - Variable < 0.001 OR Variable > 1000
 * 
 * FIXED: Proper left/right operand evaluation and highlighting logic
 * CONSOLIDATED: Merged functionality from formulaEvaluator.ts to eliminate duplication
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
  description?: string | null;
  formula: string;
  color: string;
  active: boolean;
  tableId?: string | null;
  workspaceId?: string;
  type?: 'CELL_VALIDATION' | 'RELATIONAL';
  // ENHANCED: Add scope support
  scope?: 'table' | 'workspace';
  leftResult?: number;
  rightResult?: number;
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
  
  // FIXED: Check for incomplete formulas like ">0", "<320" etc.
  // These should be invalid as they have no left side variable
  if (/^\s*[><=!]+\s*/.test(cleanFormula)) {
    console.warn(`❌ Invalid formula detected - missing left side: "${cleanFormula}"`);
    return []; // Return empty array to indicate invalid formula
  }
  
  // ENHANCED: Handle square brackets for variables (convert to standard format)
  // Remove brackets but keep the variable name: [İletkenlik] -> İletkenlik
  cleanFormula = cleanFormula.replace(/\[([^\]]+)\]/g, '$1');
  
  console.log(`🔧 Cleaned formula: "${formula}" -> "${cleanFormula}"`);
  
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
      
      // FIXED: Validate that we have meaningful expressions on both sides
      if (!left || left === '' || !right || right === '') {
        console.warn(`❌ Invalid formula detected - empty left or right side: "${conditionStr}"`);
        continue; // Skip this invalid condition
      }
      
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
      
      const leftProcessed = processExpression(left);
      const rightProcessed = processExpression(right);
      
      console.log(`🔧 Processed condition: "${leftProcessed}" ${operator} "${rightProcessed}"`);
      
      conditions.push({
        leftExpression: leftProcessed,
        operator: operator,
        rightExpression: rightProcessed,
        logicalOperator: logicalOp
      });
    } else {
      console.warn(`❌ Invalid condition format: "${conditionStr}"`);
    }
  }
  
  console.log(`🔧 Parsed ${conditions.length} conditions from formula: "${formula}"`);
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
 * ENHANCED: Validate if formula follows unidirectional rule
 * Tek taraf değişken kuralı: Formülün bir tarafında tek değişken, diğer tarafında kombinasyon olmalı
 * Örnekler:
 * - "A < B + C" ✓ (A tek, B+C kombinasyon → A vurgulanır)
 * - "B + C > A" ✓ (A tek, B+C kombinasyon → A vurgulanır) 
 * - "A + B > C + D" ✗ (Her iki taraf kombinasyon → geçersiz)
 * - "A > 312" ✓ (A tek, 312 sabit → A vurgulanır)
 * - "[Toplam Siyanür Tayini] < [Zayıf Asitte Çözünebilen (WAD) Siyanür]" ✓ (İki değişken karşılaştırması)
 */
export function validateUnidirectionalFormula(formula: string, availableVariables: string[]): {
  isValid: boolean;
  error?: string;
  missingVariables?: string[];
  leftVariables?: string[];
  rightVariables?: string[];
  targetVariable?: string; // ENHANCED: Hangi değişkenin vurgulanacağını belirtir
} {
  try {
    const conditions = parseComplexFormula(formula);
    
    if (conditions.length === 0) {
      return {
        isValid: false,
        error: 'No valid conditions found in formula'
      };
    }
    
    console.log(`🔍 Validating unidirectional formula: "${formula}"`);
    console.log(`📋 Available variables: [${availableVariables.slice(0, 5).join(', ')}${availableVariables.length > 5 ? '...' : ''}]`);
    
    // Check each condition for unidirectional rule
    for (const condition of conditions) {
      const leftVars = extractVariables(condition.leftExpression);
      const rightVars = extractVariables(condition.rightExpression);
      
      console.log(`🔍 Condition: "${condition.leftExpression}" ${condition.operator} "${condition.rightExpression}"`);
      console.log(`   Left variables: [${leftVars.join(', ')}]`);
      console.log(`   Right variables: [${rightVars.join(', ')}]`);
      
      // ENHANCED: Flexible variable matching for Turkish characters and different naming conventions
      const findMatchingVariable = (formulaVar: string): string | undefined => {
        // Clean the formula variable
        const cleanFormulaVar = formulaVar.replace(/,+$/, '').trim();
        
        // ENHANCED: More sophisticated matching algorithm
        const result = availableVariables.find(availableVar => {
          const cleanAvailableVar = availableVar.replace(/,+$/, '').trim();
          
          // 1. Exact match (case sensitive)
          if (cleanAvailableVar === cleanFormulaVar) return true;
          
          // 2. Case-insensitive match
          if (cleanAvailableVar.toLowerCase() === cleanFormulaVar.toLowerCase()) return true;
          
          // 3. Normalize Turkish characters and compare
          const normalizeText = (text: string) => text
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/İ/g, 'i')
            .replace(/Ğ/g, 'g')
            .replace(/Ü/g, 'u')
            .replace(/Ş/g, 's')
            .replace(/Ö/g, 'o')
            .replace(/Ç/g, 'c')
            .replace(/\s+/g, ' ')
            .trim();
          
          const normalizedAvailable = normalizeText(cleanAvailableVar);
          const normalizedFormula = normalizeText(cleanFormulaVar);
          
          if (normalizedAvailable === normalizedFormula) return true;
          
          // 4. Remove common words and parentheses, then compare
          const removeCommonWords = (text: string) => text
            .replace(/\b(tayini|analizi|ölçümü|değeri|sonucu|testi)\b/gi, '')
            .replace(/[()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          const cleanedAvailable = removeCommonWords(normalizedAvailable);
          const cleanedFormula = removeCommonWords(normalizedFormula);
          
          if (cleanedAvailable === cleanedFormula) return true;
          
          // 5. Partial match (contains relationship)
          if (normalizedAvailable.includes(normalizedFormula) || 
              normalizedFormula.includes(normalizedAvailable)) return true;
          
          // 6. Token-based matching with improved scoring
          const availableTokens = cleanAvailableVar.split(/[\s\-_.,()]+/).filter(t => t.length > 2);
          const formulaTokens = cleanFormulaVar.split(/[\s\-_.,()]+/).filter(t => t.length > 2);
          
          if (availableTokens.length > 0 && formulaTokens.length > 0) {
            const normalizedAvailableTokens = availableTokens.map(normalizeText);
            const normalizedFormulaTokens = formulaTokens.map(normalizeText);
            
            // Calculate match score
            let matchScore = 0;
            const totalTokens = Math.max(normalizedAvailableTokens.length, normalizedFormulaTokens.length);
            
            normalizedFormulaTokens.forEach(fToken => {
              if (fToken.length >= 3) { // Only consider meaningful tokens
                const hasMatch = normalizedAvailableTokens.some(aToken => 
                  aToken === fToken || 
                  (aToken.length > 3 && fToken.length > 3 && (aToken.includes(fToken) || fToken.includes(aToken)))
                );
                if (hasMatch) matchScore++;
              }
            });
            
            // If majority of tokens match, consider it a match
            const matchRatio = matchScore / totalTokens;
            if (matchRatio >= 0.6) return true;
          }
          
          return false;
        });
        
        if (result) {
          console.log(`✅ Variable match found: "${cleanFormulaVar}" → "${result}"`);
        } else {
          console.log(`❌ No match found for: "${cleanFormulaVar}"`);
        }
        
        return result;
      };
      
      // Check if variables exist with flexible matching
      const allFormulaVars = [...leftVars, ...rightVars];
      const missingVars: string[] = [];
      const matchedVars: Record<string, string> = {}; // formulaVar -> actualVar mapping
      
      for (const formulaVar of allFormulaVars) {
        const matchedVar = findMatchingVariable(formulaVar);
        if (matchedVar) {
          matchedVars[formulaVar] = matchedVar;
        } else {
          missingVars.push(formulaVar);
        }
      }
      
      if (missingVars.length > 0) {
        console.log(`🔍 Missing variables analysis for formula "${formula}":`);
        console.log(`   Formula variables: [${allFormulaVars.join(', ')}]`);
        console.log(`   Available variables: [${availableVariables.slice(0, 3).join(', ')}...]`);
        console.log(`   Missing: [${missingVars.join(', ')}]`);
        console.log(`   Matched: ${JSON.stringify(matchedVars)}`);
        
        return {
          isValid: false,
          error: `Missing variables: ${missingVars.join(', ')}`,
          missingVariables: missingVars
        };
      }
      
      // ENHANCED: Apply unidirectional rule with matched variables
      const leftIsConstant = leftVars.length === 0; // Only constants/numbers
      const rightIsConstant = rightVars.length === 0; // Only constants/numbers
      const leftIsSingle = leftVars.length === 1; // Single variable
      const rightIsSingle = rightVars.length === 1; // Single variable
      const leftIsMultiple = leftVars.length > 1; // Multiple variables
      const rightIsMultiple = rightVars.length > 1; // Multiple variables
      
      let targetVariable: string | undefined;
      
      // ENHANCED: More permissive rules for variable comparison
      
      // Case 1: Single variable vs constant (OK)
      // Example: "A > 312" → target A
      if (leftIsSingle && rightIsConstant) {
        targetVariable = matchedVars[leftVars[0]] || leftVars[0];
        console.log(`✅ Case 1: Single variable vs constant - Target: ${targetVariable}`);
      }
      // Example: "312 < A" → target A  
      else if (rightIsSingle && leftIsConstant) {
        targetVariable = matchedVars[rightVars[0]] || rightVars[0];
        console.log(`✅ Case 1b: Constant vs single variable - Target: ${targetVariable}`);
      }
      
      // Case 2: Single variable vs multiple variables/expression (OK)
      // Example: "A < B + C" → target A
      else if (leftIsSingle && (rightIsMultiple || rightIsConstant)) {
        targetVariable = matchedVars[leftVars[0]] || leftVars[0];
        console.log(`✅ Case 2: Single vs multiple/constant - Target: ${targetVariable}`);
      }
      // Example: "B + C > A" → target A
      else if (rightIsSingle && (leftIsMultiple || leftIsConstant)) {
        targetVariable = matchedVars[rightVars[0]] || rightVars[0];
        console.log(`✅ Case 2b: Multiple/constant vs single - Target: ${targetVariable}`);
      }
      
      // ENHANCED Case 3: Two single variables (ALLOW - this is a valid comparison)
      // Example: "[Toplam Siyanür Tayini] < [Zayıf Asitte Çözünebilen (WAD) Siyanür]"
      else if (leftIsSingle && rightIsSingle) {
        // For two-variable comparisons, highlight the left variable by default
        // This is common in chemical analysis comparisons
        targetVariable = matchedVars[leftVars[0]] || leftVars[0];
        console.log(`✅ Case 3: Two single variables comparison - Target: ${targetVariable} (left variable)`);
      }
      
      // Case 4: Multiple variables on both sides (NOT OK)
      // Example: "A + B > C + D" → invalid
      else if (leftIsMultiple && rightIsMultiple) {
        console.log(`❌ Case 4: Multiple variables on both sides - Invalid`);
        return {
          isValid: false,
          error: 'Both sides contain multiple variables. Formula must have one side with a single variable or be a simple two-variable comparison.',
          leftVariables: leftVars,
          rightVariables: rightVars
        };
      }
      
      // Case 5: No variables (invalid)
      else if (leftIsConstant && rightIsConstant) {
        console.log(`❌ Case 5: No variables - Invalid`);
        return {
          isValid: false,
          error: 'Formula contains no variables'
        };
      }
      
      // If we found a valid condition, return success with target
      if (targetVariable) {
        console.log(`✅ Formula validation successful. Target variable: "${targetVariable}"`);
        return {
          isValid: true,
          leftVariables: leftVars,
          rightVariables: rightVars,
          targetVariable: targetVariable
        };
      }
    }
    
    console.log(`❌ Formula validation failed - no valid target found`);
    return {
      isValid: false,
      error: 'Formula does not follow unidirectional rule'
    };
    
  } catch (error) {
    console.error(`❌ Exception in formula validation:`, error);
    return {
      isValid: false,
      error: `Error validating formula: ${(error as Error).message}`
    };
  }
}

/**
 * ENHANCED: Main function to evaluate formulas with unidirectional rule
 * Sadece hedef değişkenin hücresini vurgular, diğer değişkenleri değil
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
  
  // Get all available variables
  const availableVariables = data
    .map(row => row[variableColumnIndex] as string)
    .filter(v => v && typeof v === 'string')
    .map(v => v.replace(/,+$/, '').trim())
    .filter(v => v.length > 0);
  
  // Find date columns (exclude standard columns)
  const standardColumns = ['id', 'Variable', 'Data Source', 'Method', 'Unit', 'LOQ'];
  const dateColumns = columns.filter(col => !standardColumns.includes(col));
  
  // Create a mapping of variable names to their row indices for proper row identification
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
  
  // Process each active formula
  activeFormulas.forEach((formula) => {
    try {
      console.log(`🔍 Processing formula: "${formula.formula}" (${formula.name})`);
      
      // ENHANCED: Validate formula against unidirectional rule
      const validation = validateUnidirectionalFormula(formula.formula, availableVariables);
      
      if (!validation.isValid) {
        console.warn(`❌ Formula "${formula.formula}" is invalid: ${validation.error}`);
        return; // Skip this formula
      }
      
      if (!validation.targetVariable) {
        console.warn(`❌ Formula "${formula.formula}" has no target variable`);
        return; // Skip this formula
      }
      
      console.log(`✅ Formula "${formula.formula}" is valid. Target variable: ${validation.targetVariable}`);
      
      // Find the target variable's row index
      const targetRowIndex = variableToRowMap.get(validation.targetVariable);
      if (targetRowIndex === undefined) {
        console.warn(`❌ Target variable "${validation.targetVariable}" not found in table`);
        return;
      }
      
      const targetRowIndexNumber = targetRowIndex as number; // Type assertion after undefined check
      
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
            const cleanVarName = rawVarName.replace(/,+$/, '').trim();
            const numValue = typeof value === 'number' ? value : parseFloat(String(value));
            
            if (!isNaN(numValue) && cleanVarName) {
              variables[cleanVarName] = numValue;
            }
          }
        });
        
        // ENHANCED: Better debug logging
        console.log(`📊 Variables map for column "${dateCol}":`, variables);
        console.log(`🎯 Available variables: [${Object.keys(variables).join(', ')}]`);
        console.log(`🔍 Formula variables needed: Left=[${validation.leftVariables?.join(', ')}], Right=[${validation.rightVariables?.join(', ')}]`);
        
        // ENHANCED: Use the same flexible matching logic as in validation
        const findVariableMatch = (formulaVar: string): string | undefined => {
          const cleanFormulaVar = formulaVar.replace(/,+$/, '').trim();
          
          return Object.keys(variables).find(availableVar => {
            const cleanAvailableVar = availableVar.replace(/,+$/, '').trim();
            
            // 1. Exact match
            if (cleanAvailableVar === cleanFormulaVar) return true;
            
            // 2. Case-insensitive match
            if (cleanAvailableVar.toLowerCase() === cleanFormulaVar.toLowerCase()) return true;
            
            // 3. Normalize Turkish characters and compare
            const normalizeText = (text: string) => text
              .toLowerCase()
              .replace(/ı/g, 'i').replace(/İ/g, 'i')
              .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
              .replace(/ü/g, 'u').replace(/Ü/g, 'u')
              .replace(/ş/g, 's').replace(/Ş/g, 's')
              .replace(/ö/g, 'o').replace(/Ö/g, 'o')
              .replace(/ç/g, 'c').replace(/Ç/g, 'c')
              .replace(/\s+/g, '').replace(/[^\w]/g, '');
            
            const normalizedAvailable = normalizeText(cleanAvailableVar);
            const normalizedFormula = normalizeText(cleanFormulaVar);
            
            if (normalizedAvailable === normalizedFormula) return true;
            
            // 4. Partial match (contains)
            if (normalizedAvailable.includes(normalizedFormula) || 
                normalizedFormula.includes(normalizedAvailable)) return true;
            
            return false;
          });
        };
        
        // Check if all required variables are available with flexible matching
        const allFormulaVars = [...(validation.leftVariables || []), ...(validation.rightVariables || [])];
        const missingVars: string[] = [];
        const variableMappings: Record<string, string> = {}; // formulaVar -> actualVar
        
        allFormulaVars.forEach(formulaVar => {
          const matchedVar = findVariableMatch(formulaVar);
          if (matchedVar) {
            variableMappings[formulaVar] = matchedVar;
          } else {
            missingVars.push(formulaVar);
          }
        });
        
        if (missingVars.length > 0) {
          console.log(`⚠️ Missing variables for formula "${formula.name}" in column "${dateCol}":`, missingVars);
          console.log(`🔧 Available variables for matching:`, Object.keys(variables));
          console.log(`🔗 Variable mappings found:`, variableMappings);
          return;
        }
        
        // ENHANCED: Create enhanced variables map using the mappings
        const enhancedVariables: Record<string, number> = {};
        
        // First, add direct mappings from the variable mappings
        Object.entries(variableMappings).forEach(([formulaVar, actualVar]) => {
          if (variables[actualVar] !== undefined) {
            enhancedVariables[formulaVar] = variables[actualVar];
            console.log(`🔧 Mapped "${formulaVar}" to "${actualVar}" = ${variables[actualVar]}`);
          }
        });
        
        // Also keep the original variable names for any exact matches
        Object.entries(variables).forEach(([varName, value]) => {
          if (enhancedVariables[varName] === undefined) {
            enhancedVariables[varName] = value;
          }
        });
        
        // Evaluate the formula for this date column
        console.log(`⚙️ Evaluating formula with enhanced variables:`, enhancedVariables);
        const result = evaluateComplexFormula(formula.formula, enhancedVariables);
        
        if (result.isValid && result.result === true) {
          // ENHANCED: Only highlight the TARGET VARIABLE cell, not all variables
          const rowId = `row-${targetRowIndexNumber + 1}`;
          
          // Check if this cell is already highlighted by another formula
          const existingCellIndex = highlightedCells.findIndex(cell => 
            cell.row === rowId && cell.col === dateCol
          );
          
          if (existingCellIndex !== -1) {
            // Merge with existing highlight (multiple formulas affecting same cell)
            const existingCell = highlightedCells[existingCellIndex];
            existingCell.formulaIds.push(formula.id);
            existingCell.message += `, ${formula.name}`;
            
            // Add formula details
            existingCell.formulaDetails = existingCell.formulaDetails || [];
            existingCell.formulaDetails.push({
              id: formula.id,
              name: formula.name,
              formula: formula.formula,
              leftResult: result.leftResult,
              rightResult: result.rightResult,
              color: formula.color
            });
            
            // ENHANCED: Implement proper multi-coloring for visual slicing
            // Keep all colors for the EnhancedTableCell component to handle
            const allColors = existingCell.formulaDetails.map(detail => detail.color);
            
            // Set primary color to first formula's color, but keep all colors in formulaDetails
            // The EnhancedTableCell will use formulaDetails to create the pizza slice effect
            existingCell.color = existingCell.formulaDetails[0].color;
            
            console.log(`🔄 Merged formula "${formula.name}" with existing highlight for cell [${rowId}, ${dateCol}]`);
            console.log(`🎨 Cell now has ${existingCell.formulaDetails.length} formulas with colors: [${allColors.join(', ')}]`);
          } else {
            // Create new highlighted cell - ONLY for the target variable
            const targetVariableValue = variables[validation.targetVariable!];
            
            const highlightCell: HighlightedCell = {
              row: rowId,
              col: dateCol,
              color: formula.color || '#ff0000',
              message: `${formula.name}: ${validation.targetVariable!} = ${targetVariableValue}`,
              formulaIds: [formula.id],
              formulaDetails: [{
                id: formula.id,
                name: formula.name,
                formula: formula.formula,
                leftResult: result.leftResult,
                rightResult: result.rightResult,
                color: formula.color
              }]
            };
            
            highlightedCells.push(highlightCell);
            console.log(`✅ Added highlight for TARGET cell [${rowId}, ${dateCol}] - Variable: ${validation.targetVariable!}`);
          }
        }
      });
      
    } catch (error) {
      console.error(`❌ Error processing formula "${formula.name}":`, error);
    }
  });
  
  console.log(`📊 Generated ${highlightedCells.length} highlighted cells using unidirectional rule`);
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

/**
 * Backward Compatibility Functions - Eski formulaEvaluator.ts ile uyumluluk için
 */

/**
 * Helper function to extract cell value from a data table (backward compatibility)
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

/**
 * Evaluate formulas with DataRow format (backward compatibility)
 */
export function evaluateFormulasWithDataRows(
  formulas: Formula[],
  data: DataRow[],
  columns: string[]
): HighlightedCell[] {
  // Convert DataRow format to table format
  const tableData = {
    columns: columns,
    data: data.map(row => columns.map(col => row[col]))
  };
  
  return evaluateFormulasForTable(formulas, tableData);
}

/**
 * Parses a simple formula into tokens with caching (backward compatibility)
 */
export function parseFormula(formula: string) {
  // Check cache first
  if (formulaCache.has(formula)) {
    return formulaCache.get(formula)!;
  }

  // Use the enhanced parser for compatibility
  const conditions = parseComplexFormula(formula);
  if (conditions.length === 0) {
    throw new Error('Invalid formula format. Formula must contain exactly one comparison operator.');
  }
  
  const condition = conditions[0];
  const variables = [
    ...extractVariables(condition.leftExpression),
    ...extractVariables(condition.rightExpression)
  ];
  
  const result = {
    leftExpression: condition.leftExpression,
    operator: condition.operator,
    rightExpression: condition.rightExpression,
    variables: [...new Set(variables)]
  };
  
  // Cache the result
  formulaCache.set(formula, result);
  
  return result;
}

/**
 * Blends multiple colors for cells with multiple formula matches (backward compatibility)
 */
export function blendColors(colors: string[]): string {
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