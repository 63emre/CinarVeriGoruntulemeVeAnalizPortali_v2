/**
 * Centralized Formula Service
 * 
 * This service provides a unified interface for all formula operations
 * including parsing, validation, evaluation, and highlighting across
 * the entire application. It ensures consistency and eliminates code duplication.
 */

import {
  parseComplexFormula,
  evaluateComplexFormula,
  validateFormulaScope,
  validateUnidirectionalFormula,
  evaluateFormulasForTable,
  extractVariables
} from '@/lib/enhancedFormulaEvaluator';

interface FormulaCondition {
  leftExpression: string;
  operator: string;
  rightExpression: string;
  logicalOperator?: 'AND' | 'OR';
}

interface EvaluationResult {
  isValid: boolean;
  result: boolean;
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
  scope?: 'table' | 'workspace';
  tableId?: string | null;
  type?: 'CELL_VALIDATION' | 'RELATIONAL';
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

export type ServiceTableData = {
  columns: string[];
  data: (string | number | null)[][];
};

export type ServiceValidationResult = {
  isValid: boolean;
  error?: string;
  missingVariables?: string[];
  warnings?: string[];
  targetVariable?: string;
  leftVariables?: string[];
  rightVariables?: string[];
};

/**
 * Main Formula Service Class
 */
class FormulaService {
  
  /**
   * Parse a complex formula into individual conditions
   */
  parseFormula(formula: string): FormulaCondition[] {
    return parseComplexFormula(formula);
  }

  /**
   * Evaluate a formula against given data
   */
  evaluateFormula(formula: string, variables: Record<string, number>): EvaluationResult {
    return evaluateComplexFormula(formula, variables);
  }

  /**
   * Validate formula with enhanced scope-aware rules
   */
  validateFormula(
    formula: string, 
    availableVariables: string[], 
    scope: 'table' | 'workspace' = 'table',
    context: 'table' | 'analysis' | 'general' = 'general'
  ): ServiceValidationResult {
    
    // Basic validation first
    if (!formula.trim()) {
      return {
        isValid: false,
        error: 'Formül boş olamaz'
      };
    }

    // Scope-aware validation
    const scopeResult = validateFormulaScope(formula, scope, availableVariables);
    if (!scopeResult.isValid) {
      return {
        isValid: false,
        error: scopeResult.error,
        warnings: scopeResult.warnings
      };
    }

    // Context-specific validation
    if (context === 'table' && scope === 'table') {
      const unidirectionalResult = validateUnidirectionalFormula(formula, availableVariables);
      return {
        isValid: unidirectionalResult.isValid,
        error: unidirectionalResult.error,
        missingVariables: unidirectionalResult.missingVariables,
        targetVariable: unidirectionalResult.targetVariable,
        leftVariables: unidirectionalResult.leftVariables,
        rightVariables: unidirectionalResult.rightVariables
      };
    }

    return {
      isValid: true,
      warnings: scopeResult.warnings
    };
  }

  /**
   * Apply formulas to table data and return highlighted cells
   */
  highlightCells(
    formulas: Formula[], 
    tableData: ServiceTableData, 
    targetTableId?: string
  ): HighlightedCell[] {
    // Filter formulas based on scope and target table
    const applicableFormulas = formulas.filter(formula => {
      if (!formula.active) return false;
      
      // If target table is specified, filter by scope
      if (targetTableId) {
        if (formula.scope === 'table' && formula.tableId !== targetTableId) {
          return false;
        }
        // Workspace scope formulas apply to all tables
        if (formula.scope === 'workspace' || !formula.tableId) {
          return true;
        }
      }
      
      return true;
    });

    return evaluateFormulasForTable(applicableFormulas, tableData);
  }

  /**
   * Enhanced multi-formula cell highlighting with proper color distribution
   */
  processMultiFormulaHighlights(highlights: HighlightedCell[]): HighlightedCell[] {
    const cellMap = new Map<string, HighlightedCell[]>();
    
    // Group highlights by cell position
    highlights.forEach(highlight => {
      const cellKey = `${highlight.row}-${highlight.col}`;
      if (!cellMap.has(cellKey)) {
        cellMap.set(cellKey, []);
      }
      cellMap.get(cellKey)!.push(highlight);
    });

    const processedHighlights: HighlightedCell[] = [];

    // Process each cell group
    cellMap.forEach((cellHighlights, cellKey) => {
      if (cellHighlights.length === 1) {
        // Single formula - keep as is
        processedHighlights.push(cellHighlights[0]);
      } else {
        // Multiple formulas - create combined highlight
        const [row, col] = cellKey.split('-');
        const allFormulaIds = cellHighlights.flatMap(h => h.formulaIds);
        const allFormulaDetails = cellHighlights.flatMap(h => h.formulaDetails || []);
        
        // Create pizza slice color mapping
        const uniqueColors = [...new Set(cellHighlights.map(h => h.color))];
        const combinedColor = this.createPizzaSliceColor(uniqueColors);
        
        processedHighlights.push({
          row,
          col,
          color: combinedColor,
          message: `${cellHighlights.length} formül koşulu`,
          formulaIds: allFormulaIds,
          formulaDetails: allFormulaDetails
        });
      }
    });

    return processedHighlights;
  }

  /**
   * Create a pizza slice color representation for multiple formulas
   */
  private createPizzaSliceColor(colors: string[]): string {
    if (colors.length === 1) return colors[0];
    
    // Create a conic gradient CSS string for pizza slices
    const sliceAngle = 360 / colors.length;
    const gradientStops = colors.map((color, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      return `${color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
    
    return `conic-gradient(from 0deg, ${gradientStops})`;
  }

  /**
   * Extract variables from a formula
   */
  extractVariables(formula: string): string[] {
    return extractVariables(formula);
  }

  /**
   * Refresh data after formula changes
   */
  async triggerDataRefresh(
    workspaceId: string, 
    tableId?: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      // Invalidate cache or trigger re-fetch
      if (typeof window !== 'undefined') {
        // Client-side: trigger a custom event
        const refreshEvent = new CustomEvent('formulaDataRefresh', {
          detail: { workspaceId, tableId }
        });
        window.dispatchEvent(refreshEvent);
        
        // Also use localStorage to signal refresh needed
        localStorage.setItem('formulaRefreshNeeded', JSON.stringify({
          timestamp: Date.now(),
          workspaceId,
          tableId
        }));
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error triggering data refresh:', error);
      if (onError) onError((error as Error).message);
    }
  }

  /**
   * Validate formula scope constraints
   */
  validateScopeConstraints(
    formula: Formula,
    availableTables: string[]
  ): ServiceValidationResult {
    // Workspace scope validation
    if (formula.scope === 'workspace') {
      if (formula.tableId) {
        return {
          isValid: false,
          error: 'Workspace kapsamındaki formüller belirli bir tabloya bağlanamaz'
        };
      }
      return { isValid: true };
    }

    // Table scope validation
    if (formula.scope === 'table') {
      if (!formula.tableId) {
        return {
          isValid: false,
          error: 'Tablo kapsamındaki formüller bir tabloya bağlanmalıdır'
        };
      }
      
      if (!availableTables.includes(formula.tableId)) {
        return {
          isValid: false,
          error: 'Belirtilen tablo workspace\'te bulunamadı'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Generate formula summary for reports
   */
  generateFormulaSummary(formulas: Formula[]): {
    totalFormulas: number;
    activeFormulas: number;
    tableFormulas: number;
    workspaceFormulas: number;
    formulasByType: Record<string, number>;
  } {
    const active = formulas.filter(f => f.active);
    const tableScoped = formulas.filter(f => f.scope === 'table');
    const workspaceScoped = formulas.filter(f => f.scope === 'workspace');
    
    const byType = formulas.reduce((acc, f) => {
      const type = f.type || 'CELL_VALIDATION';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFormulas: formulas.length,
      activeFormulas: active.length,
      tableFormulas: tableScoped.length,
      workspaceFormulas: workspaceScoped.length,
      formulasByType: byType
    };
  }
}

// Export singleton instance
export const formulaService = new FormulaService();

// Export types for use in other modules
export type {
  Formula,
  HighlightedCell,
  EvaluationResult,
  FormulaCondition
};

// Export utility functions
export {
  FormulaService
}; 