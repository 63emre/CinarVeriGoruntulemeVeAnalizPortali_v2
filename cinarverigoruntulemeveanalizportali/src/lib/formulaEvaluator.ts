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
    
    // Enhanced regex for Turkish characters and spaces
    // Use word boundaries but also handle spaces and Turkish characters
    const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedVarName}\\b`, 'gi');
    
    // Check if the variable exists in the expression
    if (regex.test(processedExpr)) {
      processedExpr = processedExpr.replace(regex, value.toString());
      console.log(`🔄 Replaced variable "${varName}" with value ${value} in expression`);
    }
  }
  
  // Validate that all variables have been replaced
  const remainingVariables = extractVariables(processedExpr);
  if (remainingVariables.length > 0) {
    console.warn(`⚠️ Undefined variables in expression: ${remainingVariables.join(', ')}`);
    console.warn(`📝 Available variables: ${Object.keys(rowVariables).join(', ')}`);
    console.warn(`🔍 Processed expression: ${processedExpr}`);
    throw new Error(`Undefined variables in expression: ${remainingVariables.join(', ')}`);
  }
  
  // Handle basic arithmetic with proper precedence
  try {
    // Use Function constructor instead of eval for better security
    const result = new Function(`"use strict"; return (${processedExpr})`)();
    
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error(`Expression evaluation resulted in non-numeric value: ${result}`);
    }
    
    console.log(`✅ Expression "${expression}" evaluated to: ${result}`);
    return result;
  } catch (error) {
    console.error('❌ Error evaluating expression:', processedExpr, error);
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
  // This regex matches:
  // - Turkish characters (ğüşıöçĞÜŞİÖÇ)
  // - Latin characters (a-zA-Z)
  // - Numbers (0-9)
  // - Spaces within variable names
  // - Hyphens and underscores
  const variableRegex = /\b([a-zA-ZğüşıöçĞÜŞİÖÇ][a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_]*[a-zA-ZğüşıöçĞÜŞİÖÇ0-9]|[a-zA-ZğüşıöçĞÜŞİÖÇ])\b/g;
  const matches = expression.match(variableRegex) || [];
  
  // Filter out JavaScript keywords, numbers, and common operators
  const filteredMatches = matches.filter(match => {
    const trimmed = match.trim();
    const isNumber = !isNaN(Number(trimmed));
    const isKeyword = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'].includes(trimmed.toLowerCase());
    const isOperator = ['+', '-', '*', '/', '(', ')', '>', '<', '=', '!', 'and', 'or'].includes(trimmed.toLowerCase());
    const isEmpty = trimmed.length === 0;
    
    return !isNumber && !isKeyword && !isOperator && !isEmpty;
  });
  
  // Remove duplicates and return
  const uniqueVariables = [...new Set(filteredMatches.map(v => v.trim()))];
  
  console.log(`🔍 Extracted variables from "${expression}":`, uniqueVariables);
  return uniqueVariables;
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
  console.log('🔍 Starting formula evaluation...');
  console.log('📊 Input data:', { 
    formulaCount: formulas.length, 
    dataRowCount: data.length, 
    columnCount: columns.length 
  });
  
  const highlightedCells: HighlightedCell[] = [];
  const dateColumns = columns.filter(col => !['Variable', 'id'].includes(col));
  
  console.log('📅 Date columns found:', dateColumns);
  
  // Filter only active formulas
  const activeFormulas = formulas.filter(f => f.active !== false);
  
  console.log('✅ Active formulas:', activeFormulas.map(f => ({ id: f.id, name: f.name, formula: f.formula })));
  
  if (activeFormulas.length === 0 || data.length === 0) {
    console.log('⚠️ No active formulas or no data, returning empty highlights');
    return highlightedCells;
  }
  
  // Pre-parse all formulas for better performance
  const parsedFormulas = activeFormulas.map(formula => {
    try {
      const parsed = parseFormula(formula.formula);
      console.log(`✅ Successfully parsed formula "${formula.name}":`, parsed);
      return { ...formula, parsed };
    } catch (error) {
      console.error(`❌ Error parsing formula '${formula.name}':`, error);
      return null;
    }
  }).filter(Boolean) as (Formula & { parsed: ReturnType<typeof parseFormula> })[];
  
  console.log(`📝 Successfully parsed ${parsedFormulas.length} formulas`);
  
  // Process each date column
  dateColumns.forEach(dateCol => {
    console.log(`\n🗓️ Processing date column: ${dateCol}`);
    
    // Create a map of all variables for this date column across all rows
    const variables: Record<string, number> = {};
    data.forEach(varRow => {
      const varName = varRow['Variable'] as string;
      if (varName && varRow[dateCol] !== null && varRow[dateCol] !== undefined) {
        const value = Number(varRow[dateCol]);
        if (!isNaN(value)) {
          variables[varName] = value;
          // Also add trimmed version for better matching
          const trimmedVarName = varName.trim();
          if (trimmedVarName !== varName) {
            variables[trimmedVarName] = value;
          }
        }
      }
    });
    
    console.log(`📊 Variables for ${dateCol}:`, variables);
    
    // Skip if no valid variables for this column
    if (Object.keys(variables).length === 0) {
      console.log(`⚠️ No valid variables for column ${dateCol}, skipping`);
      return;
    }
    
    // Process each row in the data
    data.forEach(row => {
      const rowId = row.id;
      const variableName = row['Variable'] as string;
      
      if (!variableName) return;
      
      // Get the value for this cell
      const cellValue = row[dateCol];
      if (cellValue === null || cellValue === undefined) return;
      
      console.log(`\n🔍 Evaluating cell [${rowId}, ${dateCol}] for variable: ${variableName}`);
      
      // Evaluate each formula for this cell
      const matchedFormulas = parsedFormulas.filter(formula => {
        try {
          const { parsed } = formula;
          
          console.log(`🧮 Evaluating formula "${formula.name}" for cell [${rowId}, ${dateCol}]`);
          console.log(`📝 Formula: ${formula.formula}`);
          console.log(`🔧 Parsed: Left="${parsed.leftExpression}", Op="${parsed.operator}", Right="${parsed.rightExpression}"`);
          
          // Check if all required variables are available with fuzzy matching
          const missingVariables = parsed.variables.filter(requiredVar => {
            // Exact match
            if (variables[requiredVar] !== undefined) return false;
            
            // Trimmed match
            if (variables[requiredVar.trim()] !== undefined) return false;
            
            // Case-insensitive match
            const lowerRequiredVar = requiredVar.toLowerCase();
            const matchingKey = Object.keys(variables).find(key => 
              key.toLowerCase() === lowerRequiredVar || 
              key.toLowerCase().trim() === lowerRequiredVar.trim()
            );
            
            if (matchingKey) {
              // Add the variable with the required name for consistency
              variables[requiredVar] = variables[matchingKey];
              return false;
            }
            
            return true; // Variable is missing
          });
          
          if (missingVariables.length > 0) {
            console.log(`❌ Missing variables for formula "${formula.name}": ${missingVariables.join(', ')}`);
            console.log(`📋 Available variables: ${Object.keys(variables).join(', ')}`);
            return false;
          }
          
          console.log(`✅ All required variables available: ${parsed.variables.join(', ')}`);
          
          // Evaluate both sides of the expression
          const leftValue = evaluateArithmeticExpression(parsed.leftExpression, variables);
          const rightValue = evaluateArithmeticExpression(parsed.rightExpression, variables);
          
          console.log(`🔢 Left expression "${parsed.leftExpression}" = ${leftValue}`);
          console.log(`🔢 Right expression "${parsed.rightExpression}" = ${rightValue}`);
          
          // Store calculation details on the formula for tooltip display
          formula.leftResult = leftValue;
          formula.rightResult = rightValue;
          
          // Apply the comparison
          const comparisonResult = applyComparison(leftValue, parsed.operator, rightValue);
          console.log(`⚖️ Comparison: ${leftValue} ${parsed.operator} ${rightValue} = ${comparisonResult}`);
          
          return comparisonResult;
        } catch (error) {
          console.error(`❌ Error evaluating formula '${formula.name}' for cell [${rowId}, ${dateCol}]:`, error);
          return false;
        }
      });
      
      console.log(`🎯 Matched formulas for cell [${rowId}, ${dateCol}]: ${matchedFormulas.length}`);
      
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
          console.log(`🔄 Merging with existing highlight for cell [${rowId}, ${dateCol}]`);
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
          console.log(`✨ Creating new highlight for cell [${rowId}, ${dateCol}]`);
          // Create new highlighted cell
          const colors = matchedFormulas.map(f => f.color);
          const newHighlight = {
            row: rowId,
            col: dateCol,
            color: blendColors(colors),
            message: matchedFormulas.map(f => f.name).join(', '),
            formulaIds: matchedFormulas.map(f => f.id),
            formulaDetails: formulaDetails
          };
          
          console.log(`🎨 New highlight created:`, newHighlight);
          highlightedCells.push(newHighlight);
        }
      }
    });
  });
  
  console.log(`\n🎉 Formula evaluation completed. Total highlighted cells: ${highlightedCells.length}`);
  console.log('🎨 Highlighted cells summary:', highlightedCells.map(cell => ({
    position: `[${cell.row}, ${cell.col}]`,
    color: cell.color,
    formulas: cell.message
  })));
  
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