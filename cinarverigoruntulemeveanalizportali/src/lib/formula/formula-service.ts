import prisma from '../db';

// Formula types
export type ArithmeticOperator = '+' | '-' | '*' | '/';
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type LogicalOperator = '&&' | '||';

export interface FormulaResult {
  result: boolean;
  message?: string;
  color?: string;
  formulaName?: string;
}

export interface FormulaCondition {
  operand1: string;
  arithmeticOperator?: ArithmeticOperator;
  operand2?: string;
  comparisonOperator: ComparisonOperator;
  operand3: string;
  isConstant?: boolean;
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
  message?: string;
  debug?: string;
}

// Parse and evaluate a formula string
export function evaluateFormula(formula: string, context: EvaluationContext): EvaluationResult {
  try {
    // Basic security check - only allow specific characters
    if (!/^[a-zA-Z0-9\s\[\]().,+\-*/><=!&|]+$/.test(formula)) {
      return {
        isValid: false,
        message: 'Formül geçersiz karakterler içeriyor'
      };
    }

    // Replace variable names with their values from context
    let evaluableFormula = formula;
    
    // Replace bracketed variable names [Variable Name]
    const bracketedVarRegex = /\[([^\]]+)\]/g;
    evaluableFormula = evaluableFormula.replace(bracketedVarRegex, (match, varName) => {
      const value = context.variables[varName];
      if (value === undefined) {
        throw new Error(`Değişken bulunamadı: ${varName}`);
      }
      return value.toString();
    });
    
    // Replace non-bracketed variable names
    Object.keys(context.variables).forEach(varName => {
      // Use word boundary to ensure we're replacing whole words
      const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
      evaluableFormula = evaluableFormula.replace(varRegex, context.variables[varName].toString());
    });
    
    // Handle equality operators
    evaluableFormula = evaluableFormula.replace(/==/g, '===');
    evaluableFormula = evaluableFormula.replace(/!=/g, '!==');
    
    // Evaluate the formula safely
    // eslint-disable-next-line no-new-func
    const result = Function(`'use strict'; return (${evaluableFormula});`)();
    
    return {
      isValid: Boolean(result),
      debug: `Evaluated: ${evaluableFormula} = ${result}`
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Formül değerlendirme hatası: ${(error as Error).message}`,
      debug: `Failed formula: ${formula}`
    };
  }
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
    let leftSide = condition.operand1;
    
    // Add brackets if there's an arithmetic operation
    if (condition.arithmeticOperator && condition.operand2) {
      leftSide = `(${condition.operand1} ${condition.arithmeticOperator} ${condition.operand2})`;
    }
    
    const rightSide = condition.operand3;
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
          operand1: arithmeticMatch[1].trim(),
          arithmeticOperator: arithmeticMatch[2].trim() as ArithmeticOperator,
          operand2: arithmeticMatch[3].trim(),
          comparisonOperator: operator,
          operand3: rightSide,
          isConstant: !isNaN(parseFloat(rightSide))
        });
      } else if (leftSide.includes('+') || leftSide.includes('-') || leftSide.includes('*') || leftSide.includes('/')) {
        // Complex expression inside parentheses
        // This is a simplification; a proper parser would be more robust
        const parenContents = leftSide.replace(/^\(|\)$/g, '');
        const arithMatch = parenContents.match(/(.+?)\s*([+\-*/])\s*(.+)/);
        
        if (arithMatch) {
          conditions.push({
            operand1: arithMatch[1].trim(),
            arithmeticOperator: arithMatch[2].trim() as ArithmeticOperator,
            operand2: arithMatch[3].trim(),
            comparisonOperator: operator,
            operand3: rightSide,
            isConstant: !isNaN(parseFloat(rightSide))
          });
        }
      } else {
        // Simple comparison without arithmetic
        conditions.push({
          operand1: leftSide,
          comparisonOperator: operator,
          operand3: rightSide,
          isConstant: !isNaN(parseFloat(rightSide))
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