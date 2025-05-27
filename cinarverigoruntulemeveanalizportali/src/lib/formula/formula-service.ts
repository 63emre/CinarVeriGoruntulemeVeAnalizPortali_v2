import prisma from '../db';

// Formula types
export type ArithmeticOperator = '+' | '-' | '*' | '/';
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type LogicalOperator = '&&' | '||' | 'AND' | 'OR';

export interface FormulaResult {
  result: boolean;
  message?: string;
  color?: string;
  formulaName?: string;
}

// New interfaces for terms and expressions
export interface FormulaTerm {
  value: string;
  isVariable: boolean;
}

export interface FormulaExpression {
  terms: FormulaTerm[];
  operators: ArithmeticOperator[];
}

// Updated FormulaCondition interface
export interface FormulaCondition {
  leftExpression: FormulaExpression;
  comparisonOperator: ComparisonOperator;
  rightExpression: FormulaExpression;
  logicalOperator: LogicalOperator;
}

export interface Formula {
  id: string;
  name: string;
  description?: string | null;
  formula: string;
  conditions?: FormulaCondition[];
  logicalOperators?: LogicalOperator[];
  workspaceId: string;
  tableId?: string | null;
  color?: string | null;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
}

export async function createFormula(formulaData: {
  name: string;
  description?: string;
  formula: string;
  workspaceId: string;
  tableId?: string;
  color?: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
}) {
  try {
    const newFormula = await prisma.formula.create({
      data: {
        name: formulaData.name,
        description: formulaData.description,
        formula: formulaData.formula,
        workspaceId: formulaData.workspaceId,
        tableId: formulaData.tableId,
        color: formulaData.color,
        type: formulaData.type,
        active: formulaData.active ?? true,
      },
    });
    return newFormula;
  } catch (error) {
    console.error('Error creating formula:', error);
    throw new Error(`Formül oluşturulurken hata oluştu: ${(error as Error).message}`);
  }
}

export async function getFormulas(workspaceId: string) {
  try {
    const formulas = await prisma.formula.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    return formulas;
  } catch (error) {
    console.error('Error fetching formulas:', error);
    throw new Error(`Formüller getirilirken hata oluştu: ${(error as Error).message}`);
  }
}

export async function deleteFormula(id: string) {
  try {
    await prisma.formula.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting formula:', error);
    throw new Error(`Formül silinirken hata oluştu: ${(error as Error).message}`);
  }
}

export async function updateFormula(id: string, formulaData: {
  name?: string;
  description?: string | null;
  formula?: string;
  tableId?: string | null;
  color?: string | null;
  type?: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
}) {
  try {
    const updatedFormula = await prisma.formula.update({
      where: { id },
      data: formulaData,
    });
    return updatedFormula;
  } catch (error) {
    console.error('Error updating formula:', error);
    throw new Error(`Formül güncellenirken hata oluştu: ${(error as Error).message}`);
  }
}

// Formula evaluation
export interface EvaluationContext {
  variables: Record<string, number>;
}

export interface EvaluationResult {
  isValid: boolean;
  message: string;
  failingColumns?: string[];
}

// Added function to parse the formula and extract useful information
export function parseFormula(formula: string): {
  variables: string[];
  conditions: { 
    leftVariables: string[]; 
    rightVariables: string[];
    operator: string;
    raw: string;
  }[]
} {
  const variables: string[] = [];
  const conditions: { leftVariables: string[]; rightVariables: string[]; operator: string; raw: string; }[] = [];
  
  // Extract variable names from brackets
  const variableRegex = /\[([^\]]+)\]/g;
  let match;
  
  while ((match = variableRegex.exec(formula)) !== null) {
    const varName = match[1].trim(); // Trim variable name
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  
  // Split formula by logical operators (AND, OR, &&, ||)
  const logicalOperatorRegex = /\s+(AND|OR|\&\&|\|\|)\s+/i;
  const conditionParts = formula.split(logicalOperatorRegex);
  
  // Process each condition
  for (let i = 0; i < conditionParts.length; i += 2) {
    const conditionStr = conditionParts[i];
    if (!conditionStr || logicalOperatorRegex.test(conditionStr)) continue;
    
    // Find comparison operator
    const comparisonMatch = conditionStr.match(/(.+?)\s*([><=!]+)\s*(.+)/);
    
    if (comparisonMatch) {
      const leftSide = comparisonMatch[1].trim();
      const operator = comparisonMatch[2].trim();
      const rightSide = comparisonMatch[3].trim();
      
      // Extract variables from each side
      const leftVariables: string[] = [];
      const rightVariables: string[] = [];
      
      let varMatch;
      while ((varMatch = variableRegex.exec(leftSide)) !== null) {
        const varName = varMatch[1].trim(); // Trim variable name
        if (!leftVariables.includes(varName)) {
          leftVariables.push(varName);
        }
      }
      
      variableRegex.lastIndex = 0;
      
      while ((varMatch = variableRegex.exec(rightSide)) !== null) {
        const varName = varMatch[1].trim(); // Trim variable name
        if (!rightVariables.includes(varName)) {
          rightVariables.push(varName);
        }
      }
      
      variableRegex.lastIndex = 0;
      
      conditions.push({
        leftVariables,
        rightVariables,
        operator,
        raw: conditionStr
      });
    }
  }
  
  return {
    variables,
    conditions
  };
}

// Format formula helper function
function formatFormula(formula: string, context: EvaluationContext): string {
  // Basic security check - only allow specific characters
  if (!/^[a-zA-Z0-9\s\[\]().,+\-*/><=!&|]+$/.test(formula)) {
    console.error('Invalid characters in formula:', formula);
    return 'false';
  }

  // Replace variable names with their values from context
  let evaluableFormula = formula;
  
  // Replace bracketed variable names [Variable Name]
  const bracketedVarRegex = /\[([^\]]+)\]/g;
  evaluableFormula = evaluableFormula.replace(bracketedVarRegex, (match, varName) => {
    // Trim variable name
    const trimmedVarName = varName.trim();
    const value = context.variables[trimmedVarName];
    
    if (value === undefined || value === null || isNaN(value)) {
      console.log(`Warning: Variable [${trimmedVarName}] has invalid value:`, value);
      // Check if variable exists without trimming in context
      const untrimmedValue = context.variables[varName];
      if (untrimmedValue !== undefined && untrimmedValue !== null && !isNaN(untrimmedValue)) {
        console.log(`Found value with untrimmed key: ${varName} = ${untrimmedValue}`);
        return untrimmedValue.toString();
      }
      // Return a value that will cause the comparison to be false
      return 'null';
    }
    return value.toString();
  });
  
  // Convert logical operators to JavaScript syntax
  evaluableFormula = evaluableFormula.replace(/\bAND\b/g, '&&');
  evaluableFormula = evaluableFormula.replace(/\bOR\b/g, '||');
  
  // Handle equality operators
  evaluableFormula = evaluableFormula.replace(/==/g, '===');
  evaluableFormula = evaluableFormula.replace(/!=/g, '!==');
  
  console.log('Formatted formula:', evaluableFormula);
  
  return evaluableFormula;
}

// Enhanced function to evaluate formula with detailed information about failing conditions
export function evaluateFormula(formula: string, context: EvaluationContext): EvaluationResult {
  try {
    console.log('Evaluating formula:', formula);
    console.log('Available variables:', Object.keys(context.variables));
    console.log('Variable values:', context.variables);
    
    // Parse the formula to extract variables and conditions
    const parsedFormula = parseFormula(formula);
    
    // Check if all required variables are available
    const missingVariables = parsedFormula.variables.filter(v => {
      // Check both trimmed and untrimmed versions
      return context.variables[v] === undefined && context.variables[v.trim()] === undefined;
    });
    
    if (missingVariables.length > 0) {
      console.log('Missing variables:', missingVariables);
      return {
        isValid: false,
        message: `Missing variables: ${missingVariables.join(', ')}`
      };
    }
    
    // Format the formula for evaluation
    const formattedFormula = formatFormula(formula, context);
    
    if (formattedFormula === 'false') {
      return {
        isValid: false,
        message: 'Invalid formula syntax'
      };
    }
    
    // Track which columns are causing failures
    const failingColumns: string[] = [];
    
    // Check each condition individually to identify failing parts
    for (const condition of parsedFormula.conditions) {
      const { leftVariables, rightVariables, raw } = condition;
      
      // Check if any variable in this condition has null/undefined value
      const invalidVars = [...leftVariables, ...rightVariables].filter(v => {
        const value = context.variables[v] || context.variables[v.trim()];
        return value === undefined || value === null || isNaN(value);
      });
      
      if (invalidVars.length > 0) {
        failingColumns.push(...invalidVars);
        console.log(`Condition "${raw}" has invalid variables:`, invalidVars);
      }
    }
    
    // Evaluate the formula
    let result = false;
    try {
      result = new Function('return ' + formattedFormula)();
      console.log('Formula evaluation result:', result);
    } catch (err) {
      console.error('Error in formula evaluation:', err);
      // If evaluation fails, use all variables as failing columns
      return {
        isValid: false,
        message: `Formula evaluation error: ${(err as Error).message}`,
        failingColumns: parsedFormula.variables
      };
    }
    
    // If the result is false but we don't have specific failing columns yet
    if (!result && failingColumns.length === 0) {
      // Use all variables as failing columns (we don't know which specific one caused the failure)
      const allVars = new Set<string>();
      for (const condition of parsedFormula.conditions) {
        condition.leftVariables.forEach(v => allVars.add(v));
        condition.rightVariables.forEach(v => allVars.add(v));
      }
      failingColumns.push(...Array.from(allVars));
    }
    
    return {
      isValid: result === true,
      message: result ? 'Formula is valid' : 'Formula conditions not met',
      failingColumns: failingColumns.length > 0 ? failingColumns : undefined
    };
  } catch (error) {
    console.error('Exception in evaluateFormula:', error);
    return {
      isValid: false,
      message: `Error evaluating formula: ${(error as Error).message}`
    };
  }
}

// Export the evaluateExpression function so it can be used elsewhere
export function evaluateExpression(expression: FormulaExpression, context: EvaluationContext): number {
  if (expression.terms.length === 0) return 0;
  
  if (expression.terms.length === 1) {
    const term = expression.terms[0];
    if (term.isVariable) {
      const value = context.variables[term.value];
      if (value === undefined) {
        throw new Error(`Değişken bulunamadı: ${term.value}`);
      }
      return value;
    } else {
      return parseFloat(term.value);
    }
  }
  
  // For multiple terms, evaluate the expression with operators
  // Initialize result with the first term properly
  let result = expression.terms[0].isVariable 
    ? context.variables[expression.terms[0].value] 
    : parseFloat(expression.terms[0].value);
  
  for (let i = 1; i < expression.terms.length; i++) {
    const term = expression.terms[i];
    const operator = expression.operators[i - 1];
    const value = term.isVariable ? context.variables[term.value] : parseFloat(term.value);
    
    switch (operator) {
      case '+': result += value; break;
      case '-': result -= value; break;
      case '*': result *= value; break;
      case '/': result /= value; break;
    }
  }
  
  return result;
}

// New function to create a formula string from the new condition format
export function createFormulaStringFromConditions(conditions: FormulaCondition[]): string {
  return conditions.map((condition, index) => {
    // Build the left expression
    const leftExpr = condition.leftExpression.terms.map((term, termIndex) => {
      const termStr = term.isVariable ? `[${term.value}]` : term.value;
      if (termIndex < condition.leftExpression.operators.length) {
        return `${termStr} ${condition.leftExpression.operators[termIndex]}`;
      }
      return termStr;
    }).join(' ');
    
    // Build the right expression
    const rightExpr = condition.rightExpression.terms.map((term, termIndex) => {
      const termStr = term.isVariable ? `[${term.value}]` : term.value;
      if (termIndex < condition.rightExpression.operators.length) {
        return `${termStr} ${condition.rightExpression.operators[termIndex]}`;
      }
      return termStr;
    }).join(' ');
    
    // Add parentheses if there are multiple terms
    const leftSide = condition.leftExpression.terms.length > 1 ? `(${leftExpr})` : leftExpr;
    const rightSide = condition.rightExpression.terms.length > 1 ? `(${rightExpr})` : rightExpr;
    
    // Build the comparison
    const comparison = `${leftSide} ${condition.comparisonOperator} ${rightSide}`;
    
    // Add logical operator if not the last condition
    if (index < conditions.length - 1) {
      // Convert logical operator to JavaScript syntax
      const logicalOp = condition.logicalOperator === 'AND' ? '&&' : '||';
      return `${comparison} ${logicalOp}`;
    }
    
    return comparison;
  }).join(' ');
}

// Apply a formula to a data table
export function applyFormulaToTable(
  formula: {
    id: string;
    name: string;
    formula: string;
    type: 'CELL_VALIDATION' | 'RELATIONAL';
    color?: string | null;
  }, 
  data: {
    columns: string[];
    data: (string | number | null)[][];
  }
): EvaluationResult[] {
  // Validate inputs
  if (!data || !Array.isArray(data.columns) || !Array.isArray(data.data)) {
    throw new Error('Geçersiz tablo verisi');
  }
  
  if (!formula || !formula.formula) {
    throw new Error('Geçersiz formül');
  }
  
  // Find the variable column index
  const variableColumnIndex = data.columns.findIndex(
    col => col && typeof col === 'string' && col.toLowerCase() === 'variable'
  );
  
  if (variableColumnIndex === -1) {
    throw new Error('Variable kolonu bulunamadı');
  }
  
  // Process each row
  const results = data.data.map((row, rowIndex) => {
    // Skip invalid rows
    if (!row || !Array.isArray(row)) {
      return { 
        isValid: false, 
        message: `Satır ${rowIndex + 1}: Geçersiz veri` 
      };
    }
    
    // Create context from row data
    const context: EvaluationContext = { variables: {} };
    
    // Add the current row's variable name and value
    const variableValue = row[variableColumnIndex];
    const variableName = typeof variableValue === 'string' ? variableValue : null;
    
    if (!variableName) {
      return { 
        isValid: false, 
        message: `Değişken değeri bulunamadı (satır ${rowIndex + 1})` 
      };
    }
    
    // Collect all values for this row
    data.columns.forEach((col, index) => {
      if (!col || typeof col !== 'string') return;
      
      const value = row[index];
      if (typeof value === 'number') {
        context.variables[col] = value;
      } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        context.variables[col] = parseFloat(value);
      }
    });
    
    // Add the variable to the context if it's not already there
    if (!context.variables[variableName]) {
      // Find the value from the data (this is a simplification)
      const valueColumnIndex = data.columns.findIndex(
        col => col && typeof col === 'string' && 
        !['Variable', 'Data Source', 'Method', 'Unit', 'LOQ'].includes(col)
      );
      
      if (valueColumnIndex !== -1) {
        const value = row[valueColumnIndex];
        if (typeof value === 'number') {
          context.variables[variableName] = value;
        } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          context.variables[variableName] = parseFloat(value);
        }
      }
    }
    
    try {
      // Evaluate the formula
      return evaluateFormula(formula.formula, context);
    } catch (error) {
      return {
        isValid: false,
        message: `Formül değerlendirme hatası: ${(error as Error).message}`,
        debug: `Failed formula: ${formula.formula}`
      };
    }
  });
  
  return results;
}

// Generate a formula string from conditions and logical operators
export function generateFormulaString(
  conditions: FormulaCondition[],
  logicalOperators: LogicalOperator[] = []
): string {
  if (conditions.length === 0) {
    return '';
  }
  
  return conditions.map((condition, index) => {
    const leftSide = condition.leftExpression.terms.map((term, termIndex) => {
      const termStr = term.isVariable ? `[${term.value}]` : term.value;
      if (termIndex < condition.leftExpression.operators.length) {
        return `${termStr} ${condition.leftExpression.operators[termIndex]}`;
      }
      return termStr;
    }).join(' ');
    
    const rightSide = condition.rightExpression.terms.map((term, termIndex) => {
      const termStr = term.isVariable ? `[${term.value}]` : term.value;
      if (termIndex < condition.rightExpression.operators.length) {
        return `${termStr} ${condition.rightExpression.operators[termIndex]}`;
      }
      return termStr;
    }).join(' ');
    
    let formula = `${leftSide} ${condition.comparisonOperator} ${rightSide}`;
    
    // Add logical operator if not the last condition
    if (index < conditions.length - 1 && logicalOperators.length > index) {
      formula += ` ${logicalOperators[index]} `;
    }
    
    return formula;
  }).join('');
}

// Parse a formula string back into conditions
export function parseFormulaString(formula: string): {
  conditions: FormulaCondition[];
  logicalOperators: LogicalOperator[];
} {
  // This is a simplified parser and would need to be more robust for complex formulas
  const logicalSplitRegex = /(\s*\&\&\s*|\s*\|\|\s*)/;
  const parts = formula.split(logicalSplitRegex).filter(part => part.trim());
  
  const conditions: FormulaCondition[] = [];
  const logicalOperators: LogicalOperator[] = [];
  
  // Extract logical operators
  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i].trim();
    if (op === '&&' || op === '||') {
      logicalOperators.push(op as LogicalOperator);
    }
  }
  
  // Parse conditions
  for (let i = 0; i < parts.length; i += 2) {
    const conditionStr = parts[i].trim();
    
    // Match patterns like: (VAR1 + VAR2) > VAR3 or VAR1 >= 0.05
    const complexConditionRegex = /\(([^)]+)\)\s*([<>=!]+)\s*(.+)/;
    const simpleConditionRegex = /([^<>=!]+)\s*([<>=!]+)\s*(.+)/;
    
    const match = conditionStr.match(complexConditionRegex) || conditionStr.match(simpleConditionRegex);
    
    if (match) {
      const leftSide = match[1].trim();
      const operator = match[2].trim() as ComparisonOperator;
      const rightSide = match[3].trim();
      
      // Check if left side has an arithmetic operation
      const arithmeticMatch = leftSide.match(/(.+?)\s*([+\-*/])\s*(.+)/);
      
      if (arithmeticMatch && !leftSide.startsWith('(')) {
        // Simple arithmetic operation
        conditions.push({
          leftExpression: {
            terms: [{ value: arithmeticMatch[1].trim(), isVariable: false }],
            operators: [arithmeticMatch[2].trim() as ArithmeticOperator]
          },
          comparisonOperator: operator,
          rightExpression: {
            terms: [{ value: arithmeticMatch[3].trim(), isVariable: false }],
            operators: []
          },
          logicalOperator: 'AND'
        });
      } else if (leftSide.includes('+') || leftSide.includes('-') || leftSide.includes('*') || leftSide.includes('/')) {
        // Complex expression inside parentheses
        // This is a simplification; a proper parser would be more robust
        const parenContents = leftSide.replace(/^\(|\)$/g, '');
        const arithMatch = parenContents.match(/(.+?)\s*([+\-*/])\s*(.+)/);
        
        if (arithMatch) {
          conditions.push({
            leftExpression: {
              terms: [{ value: arithMatch[1].trim(), isVariable: false }],
              operators: [arithMatch[2].trim() as ArithmeticOperator]
            },
            comparisonOperator: operator,
            rightExpression: {
              terms: [{ value: arithMatch[3].trim(), isVariable: false }],
              operators: []
            },
            logicalOperator: 'AND'
          });
        }
      } else {
        // Simple comparison without arithmetic
        conditions.push({
          leftExpression: {
            terms: [{ value: leftSide, isVariable: false }],
            operators: []
          },
          comparisonOperator: operator,
          rightExpression: {
            terms: [{ value: rightSide, isVariable: false }],
            operators: []
          },
          logicalOperator: 'AND'
        });
      }
    }
  }
  
  return { conditions, logicalOperators };
}

export function evaluateLOQComparison(valueStr: string, loqStr: string): FormulaResult | null {
  if (!loqStr || !valueStr) return null;

  try {
    // Parse LOQ value (handle formats like "<0.01")
    let loqValue: number | null = null;
    if (loqStr.startsWith('<')) {
      loqValue = parseFloat(loqStr.substring(1));
    } else {
      loqValue = parseFloat(loqStr);
    }

    // Parse the actual value
    let value: number | null = null;
    if (valueStr.startsWith('<')) {
      value = parseFloat(valueStr.substring(1));
    } else {
      value = parseFloat(valueStr);
    }

    if (isNaN(loqValue) || isNaN(value)) return null;

    // Check if value is less than LOQ
    if (value < loqValue) {
      return {
        result: true,
        message: `Value ${value} is less than LOQ ${loqValue}`,
        color: '#ff5555',
        formulaName: 'LOQ Check',
      };
    }

    return {
      result: false,
      color: '#55ff55',
      formulaName: 'LOQ Check',
    };
  } catch (error: unknown) {
    console.error('LOQ comparison error:', error);
    return null;
  }
}

export function evaluateTotalVsComponent(
  totalValue: string,
  componentValue: string
): FormulaResult | null {
  if (!totalValue || !componentValue) return null;

  try {
    const total = parseFloat(totalValue);
    const component = parseFloat(componentValue);

    if (isNaN(total) || isNaN(component)) return null;

    // Total should be greater than or equal to component
    if (total < component) {
      return {
        result: true,
        message: `Total value ${total} is less than component value ${component}`,
        color: '#ffaa00',
        formulaName: 'Total vs Component',
      };
    }

    return {
      result: false,
      color: '#55ff55',
      formulaName: 'Total vs Component',
    };
  } catch (error: unknown) {
    console.error('Total vs Component evaluation error:', error);
    return null;
  }
}

export function evaluateWADvsTotalCyanide(
  wadValue: string,
  totalValue: string
): FormulaResult | null {
  if (!wadValue || !totalValue) return null;

  try {
    const wad = parseFloat(wadValue);
    const total = parseFloat(totalValue);

    if (isNaN(wad) || isNaN(total)) return null;

    // WAD should be less than or equal to total
    if (wad > total) {
      return {
        result: true,
        message: `WAD Cyanide ${wad} is greater than Total Cyanide ${total}`,
        color: '#ff00ff',
        formulaName: 'WAD vs Total Cyanide',
      };
    }

    return {
      result: false,
      color: '#55ff55',
      formulaName: 'WAD vs Total Cyanide',
    };
  } catch (error: unknown) {
    console.error('WAD vs Total Cyanide evaluation error:', error);
    return null;
  }
}

export function evaluateTotalPhosphorVsOrthophosphat(
  totalValue: string,
  orthoValue: string
): FormulaResult | null {
  if (!totalValue || !orthoValue) return null;

  try {
    const total = parseFloat(totalValue);
    const ortho = parseFloat(orthoValue);

    if (isNaN(total) || isNaN(ortho)) return null;

    // Total Phosphor should be greater than Orthophosphat
    if (total <= ortho) {
      return {
        result: true,
        message: `Total Phosphor ${total} is not greater than Orthophosphat ${ortho}`,
        color: '#aa55ff',
        formulaName: 'Total Phosphor vs Orthophosphat',
      };
    }

    return {
      result: false,
      color: '#55ff55',
      formulaName: 'Total Phosphor vs Orthophosphat',
    };
  } catch (error: unknown) {
    console.error('Total Phosphor vs Orthophosphat evaluation error:', error);
    return null;
  }
}

// Add the missing saveFormula function
export async function saveFormula(
  name: string,
  description: string,
  formula: string,
  workspaceId: string,
  color: string = '#ef4444',
  tableId?: string | null,
  type: 'CELL_VALIDATION' | 'RELATIONAL' = 'CELL_VALIDATION'
) {
  try {
    const newFormula = await prisma.formula.create({
      data: {
        name,
        description,
        formula,
        workspaceId,
        color,
        tableId,
        type,
        active: true,
      },
    });
    return newFormula;
  } catch (error) {
    console.error('Error saving formula:', error);
    throw new Error(`Formül kaydedilirken hata oluştu: ${(error as Error).message}`);
  }
}