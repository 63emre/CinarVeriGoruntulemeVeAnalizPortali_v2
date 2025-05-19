import prisma from '../db';

interface FormulaResult {
  result: boolean;
  error?: string;
  message?: string;
  color: string;
  formulaName: string;
}

export async function saveFormula(
  name: string,
  description: string,
  formula: string,
  workspaceId: string,
  color: string,
  tableId?: string
) {
  return prisma.formula.create({
    data: {
      name,
      description,
      formula,
      workspaceId,
      tableId,
      color,
    },
  });
}

export async function getFormulas(workspaceId: string) {
  return prisma.formula.findMany({
    where: {
      workspaceId,
    },
  });
}

export async function deleteFormula(formulaId: string) {
  return prisma.formula.delete({
    where: {
      id: formulaId,
    },
  });
}

export function evaluateFormula(
  formula: string,
  variables: Record<string, string | number>,
  _dateColumn?: string // Unused parameter, prefixed with underscore
): FormulaResult | null {
  try {
    // Create a function from the formula
    const func = new Function(
      ...Object.keys(variables),
      'return ' + formula
    );

    // Execute the formula with variables
    const result = func(...Object.values(variables));

    return {
      result: !!result,
      color: '#ff0000', // Default red for highlighting
      formulaName: 'Custom formula',
    };
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return {
      result: false,
      error: (error as Error).message,
      color: '#cccccc', // Gray for errors
      formulaName: 'Error',
    };
  }
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