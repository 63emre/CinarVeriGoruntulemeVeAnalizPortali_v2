import { useState, useEffect } from 'react';
import { FcPlus, FcMinus } from 'react-icons/fc';

type ArithmeticOperator = '+' | '-' | '*' | '/';
type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
type LogicalOperator = 'AND' | 'OR';

// Represents a single term in a formula (can be a variable or a constant)
interface FormulaTerm {
  value: string;
  isVariable: boolean;
}

// Represents the complex left or right side of a condition
interface FormulaExpression {
  terms: FormulaTerm[];
  operators: ArithmeticOperator[];
}

// Represents a single condition with complex expressions on both sides
interface FormulaCondition {
  leftExpression: FormulaExpression;
  comparisonOperator: ComparisonOperator;
  rightExpression: FormulaExpression;
  logicalOperator: LogicalOperator;
}

interface DropdownFormulaEditorProps {
  variables: string[];
  onFormulaBuild: (formula: string, conditions: FormulaCondition[]) => void;
}

// Create an empty expression
const createEmptyExpression = (): FormulaExpression => ({
  terms: [{ value: '', isVariable: true }],
  operators: [],
});

// Create an empty condition
const createEmptyCondition = (): FormulaCondition => ({
  leftExpression: createEmptyExpression(),
  comparisonOperator: '>',
  rightExpression: createEmptyExpression(),
  logicalOperator: 'AND',
});

export default function DropdownFormulaEditor({ variables, onFormulaBuild }: DropdownFormulaEditorProps) {
  const [conditions, setConditions] = useState<FormulaCondition[]>([createEmptyCondition()]);
  
  const arithmeticOperators: ArithmeticOperator[] = ['+', '-', '*', '/'];
  const comparisonOperators: ComparisonOperator[] = ['>', '<', '>=', '<=', '==', '!='];
  const logicalOperators: LogicalOperator[] = ['AND', 'OR'];

  // Update formula when conditions change
  useEffect(() => {
    const formula = buildFormula();
    onFormulaBuild(formula, conditions);
  }, [conditions]);

  // Build a string representation of a single expression
  const buildExpressionString = (expression: FormulaExpression): string => {
    if (expression.terms.length === 0) return '';
    
    if (expression.terms.length === 1) {
      const term = expression.terms[0];
      return term.isVariable ? `[${term.value}]` : term.value;
    }
    
    // For multiple terms, build the expression with operators
    let result = '';
    expression.terms.forEach((term, index) => {
      // Add the term
      const termValue = term.isVariable ? `[${term.value}]` : term.value;
      result += termValue;
      
      // Add the operator if not the last term
      if (index < expression.operators.length) {
        result += ` ${expression.operators[index]} `;
      }
    });
    
    // Add parentheses if there are multiple terms
    return expression.terms.length > 1 ? `(${result})` : result;
  };

  // Build the complete formula string
  const buildFormula = (): string => {
    return conditions.map((condition, index) => {
      const leftSide = buildExpressionString(condition.leftExpression);
      const rightSide = buildExpressionString(condition.rightExpression);
      
      // Build the comparison
      const comparison = `${leftSide} ${condition.comparisonOperator} ${rightSide}`;
      
      // Add logical operator if not the last condition
      if (index < conditions.length - 1) {
        return `${comparison} ${condition.logicalOperator}`;
      }
      
      return comparison;
    }).join(' ');
  };

  // Add a new condition
  const addCondition = () => {
    setConditions([...conditions, createEmptyCondition()]);
  };

  // Remove a condition
  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = [...conditions];
      newConditions.splice(index, 1);
      setConditions(newConditions);
    }
  };

  // Update a condition's comparison operator
  const updateComparisonOperator = (index: number, value: ComparisonOperator) => {
    const newConditions = [...conditions];
    newConditions[index].comparisonOperator = value;
    setConditions(newConditions);
  };

  // Update a condition's logical operator
  const updateLogicalOperator = (index: number, value: LogicalOperator) => {
    const newConditions = [...conditions];
    newConditions[index].logicalOperator = value;
    setConditions(newConditions);
  };

  // Add a term to an expression
  const addTerm = (conditionIndex: number, side: 'left' | 'right') => {
    const newConditions = [...conditions];
    const expression = side === 'left' 
      ? newConditions[conditionIndex].leftExpression 
      : newConditions[conditionIndex].rightExpression;
    
    // Add a new term and an operator
    expression.terms.push({ value: '', isVariable: true });
    
    // Add operator between terms
    if (expression.terms.length > 1) {
      expression.operators.push('+');
    }
    
    setConditions(newConditions);
  };

  // Remove a term from an expression
  const removeTerm = (conditionIndex: number, side: 'left' | 'right', termIndex: number) => {
    const newConditions = [...conditions];
    const expression = side === 'left'
      ? newConditions[conditionIndex].leftExpression
      : newConditions[conditionIndex].rightExpression;
    
    if (expression.terms.length <= 1) return; // Keep at least one term
    
    // Remove the term
    expression.terms.splice(termIndex, 1);
    
    // Remove the operator (either before or after this term)
    if (termIndex > 0 && termIndex <= expression.operators.length) {
      expression.operators.splice(termIndex - 1, 1);
    } else if (termIndex === 0 && expression.operators.length > 0) {
      expression.operators.splice(0, 1);
    }
    
    setConditions(newConditions);
  };

  // Update a term's value
  const updateTermValue = (
    conditionIndex: number, 
    side: 'left' | 'right', 
    termIndex: number, 
    value: string, 
    isVariable: boolean
  ) => {
    const newConditions = [...conditions];
    const expression = side === 'left'
      ? newConditions[conditionIndex].leftExpression
      : newConditions[conditionIndex].rightExpression;
    
    expression.terms[termIndex] = { 
      value,
      isVariable 
    };
    
    setConditions(newConditions);
  };

  // Update an operator between terms
  const updateOperator = (
    conditionIndex: number, 
    side: 'left' | 'right', 
    operatorIndex: number, 
    value: ArithmeticOperator
  ) => {
    const newConditions = [...conditions];
    const expression = side === 'left'
      ? newConditions[conditionIndex].leftExpression
      : newConditions[conditionIndex].rightExpression;
    
    expression.operators[operatorIndex] = value;
    
    setConditions(newConditions);
  };

  // Render the UI for a single term
  const renderTerm = (
    conditionIndex: number, 
    side: 'left' | 'right', 
    termIndex: number, 
    term: FormulaTerm
  ) => {
    return (
      <div className="flex items-center gap-1">
        <select
          className="p-2 border rounded-md min-w-[130px]"
          value={term.value}
          onChange={(e) => updateTermValue(conditionIndex, side, termIndex, e.target.value, true)}
        >
          <option value="">Değişken Seç</option>
          {variables.map((variable) => (
            <option key={variable} value={variable}>
              {variable}
            </option>
          ))}
        </select>

        {/* Button to remove this term */}
        {(side === 'left' ? conditions[conditionIndex].leftExpression.terms.length : 
                            conditions[conditionIndex].rightExpression.terms.length) > 1 && (
          <button
            type="button"
            onClick={() => removeTerm(conditionIndex, side, termIndex)}
            className="p-1 text-red-500 hover:bg-red-100 rounded-md"
          >
            <FcMinus className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  // Render a complex expression (left or right side of a condition)
  const renderExpression = (conditionIndex: number, side: 'left' | 'right') => {
    const expression = side === 'left' 
      ? conditions[conditionIndex].leftExpression 
      : conditions[conditionIndex].rightExpression;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {expression.terms.map((term, termIndex) => (
          <div key={termIndex} className="flex items-center">
            {renderTerm(conditionIndex, side, termIndex, term)}
            
            {/* Operator after this term (if not the last term) */}
            {termIndex < expression.terms.length - 1 && (
              <select
                className="p-2 border rounded-md mx-1 text-center"
                value={expression.operators[termIndex]}
                onChange={(e) => updateOperator(conditionIndex, side, termIndex, e.target.value as ArithmeticOperator)}
              >
                {arithmeticOperators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        
        {/* Button to add another term */}
        <button
          type="button"
          onClick={() => addTerm(conditionIndex, side)}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
        >
          <FcPlus className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Gelişmiş Formül Oluşturucu</h3>
      
      <div className="space-y-6">
        {conditions.map((condition, conditionIndex) => (
          <div key={conditionIndex} className="bg-gray-50 p-4 rounded-md border border-gray-200">
            {/* Condition header with logical operator */}
            {conditionIndex > 0 && (
              <div className="mb-2 flex justify-start">
                <select
                  className="p-1 border rounded bg-blue-50 font-medium"
                  value={conditions[conditionIndex - 1].logicalOperator}
                  onChange={(e) => updateLogicalOperator(conditionIndex - 1, e.target.value as LogicalOperator)}
                >
                  <option value="AND">VE</option>
                  <option value="OR">VEYA</option>
                </select>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              {/* Left Expression */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Sol Taraf:</p>
                {renderExpression(conditionIndex, 'left')}
              </div>
              
              {/* Comparison Operator */}
              <div className="flex justify-center">
                <select
                  className="p-2 border rounded-md bg-yellow-50 font-medium"
                  value={condition.comparisonOperator}
                  onChange={(e) => updateComparisonOperator(conditionIndex, e.target.value as ComparisonOperator)}
                >
                  {comparisonOperators.map((op) => (
                    <option key={op} value={op}>
                      {op === '==' ? '=' : op}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Right Expression */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Sağ Taraf:</p>
                {renderExpression(conditionIndex, 'right')}
              </div>
            </div>
            
            {/* Remove Condition Button */}
            {conditions.length > 1 && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeCondition(conditionIndex)}
                  className="flex items-center text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <FcMinus className="mr-1" /> Koşulu Kaldır
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Condition Button */}
        <button
          type="button"
          onClick={addCondition}
          className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
        >
          <FcPlus className="mr-2" />
          Koşul Ekle
        </button>
      </div>

      {/* Formula Preview */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium text-sm mb-2 text-gray-700">Formül Önizleme:</h4>
        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
          {buildFormula() || 'Henüz formül tanımlanmadı'}
        </div>
      </div>
    </div>
  );
} 