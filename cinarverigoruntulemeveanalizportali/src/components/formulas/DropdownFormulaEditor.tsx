import { useState, useEffect } from 'react';
import { FcPlus, FcMinus } from 'react-icons/fc';

type ArithmeticOperator = '+' | '-' | '*' | '/';
type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';

interface FormulaCondition {
  operand1: string;
  arithmeticOperator?: ArithmeticOperator;
  operand2?: string;
  comparisonOperator: ComparisonOperator;
  operand3: string;
  isConstant?: boolean;
}

interface DropdownFormulaEditorProps {
  variables: string[];
  onFormulaBuild: (formula: string, conditions: FormulaCondition[]) => void;
}

export default function DropdownFormulaEditor({ variables, onFormulaBuild }: DropdownFormulaEditorProps) {
  const [conditions, setConditions] = useState<FormulaCondition[]>([
    {
      operand1: '',
      arithmeticOperator: '+',
      operand2: '',
      comparisonOperator: '>',
      operand3: '',
      isConstant: true
    }
  ]);

  const arithmeticOperators: ArithmeticOperator[] = ['+', '-', '*', '/'];
  const comparisonOperators: ComparisonOperator[] = ['>', '<', '>=', '<=', '==', '!='];

  // Update formula when conditions change
  useEffect(() => {
    const formula = buildFormula();
    onFormulaBuild(formula, conditions);
  }, [conditions]);

  // Build formula string from conditions
  const buildFormula = (): string => {
    return conditions.map((condition, index) => {
      // Build left side (with arithmetic if present)
      let leftSide = condition.operand1;
      if (condition.arithmeticOperator && condition.operand2) {
        leftSide = `(${condition.operand1} ${condition.arithmeticOperator} ${condition.operand2})`;
      }

      // Build comparison
      const comparison = `${leftSide} ${condition.comparisonOperator} ${condition.operand3}`;
      
      // Add logical operator if not the last condition
      return comparison + (index < conditions.length - 1 ? ' && ' : '');
    }).join('');
  };

  // Add a new condition
  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        operand1: '',
        arithmeticOperator: '+',
        operand2: '',
        comparisonOperator: '>',
        operand3: '',
        isConstant: true
      }
    ]);
  };

  // Remove a condition
  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = [...conditions];
      newConditions.splice(index, 1);
      setConditions(newConditions);
    }
  };

  // Update a condition
  const updateCondition = (index: number, field: keyof FormulaCondition, value: string) => {
    const newConditions = [...conditions];
    
    // Handle special case for operand3 - check if it's a number
    if (field === 'operand3') {
      const isNumeric = !isNaN(parseFloat(value));
      newConditions[index] = {
        ...newConditions[index],
        [field]: value,
        isConstant: isNumeric
      };
    } else {
      newConditions[index] = {
        ...newConditions[index],
        [field]: value
      };
    }
    
    setConditions(newConditions);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Formül Oluşturucu</h3>
      
      <div className="space-y-4">
        {conditions.map((condition, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-md">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* First Operand */}
              <select
                className="p-2 border rounded-md"
                value={condition.operand1}
                onChange={(e) => updateCondition(index, 'operand1', e.target.value)}
              >
                <option value="">Değişken Seç</option>
                {variables.map((variable) => (
                  <option key={variable} value={`[${variable}]`}>
                    {variable}
                  </option>
                ))}
              </select>

              {/* Arithmetic Operator */}
              <select
                className="p-2 border rounded-md"
                value={condition.arithmeticOperator}
                onChange={(e) => updateCondition(index, 'arithmeticOperator', e.target.value as ArithmeticOperator)}
              >
                {arithmeticOperators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>

              {/* Second Operand */}
              <select
                className="p-2 border rounded-md"
                value={condition.operand2}
                onChange={(e) => updateCondition(index, 'operand2', e.target.value)}
              >
                <option value="">Değişken Seç</option>
                {variables.map((variable) => (
                  <option key={variable} value={`[${variable}]`}>
                    {variable}
                  </option>
                ))}
              </select>

              {/* Comparison Operator */}
              <select
                className="p-2 border rounded-md"
                value={condition.comparisonOperator}
                onChange={(e) => updateCondition(index, 'comparisonOperator', e.target.value as ComparisonOperator)}
              >
                {comparisonOperators.map((op) => (
                  <option key={op} value={op}>
                    {op === '==' ? '=' : op}
                  </option>
                ))}
              </select>

              {/* Third Operand - can be variable or constant */}
              <div className="flex-1 min-w-[150px]">
                <input
                  type="text"
                  className="p-2 border rounded-md w-full"
                  placeholder="Değer veya Değişken"
                  value={condition.operand3}
                  onChange={(e) => updateCondition(index, 'operand3', e.target.value)}
                />
              </div>

              {/* Remove button */}
              {conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                >
                  <FcMinus className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {index < conditions.length - 1 && (
              <div className="ml-4 text-gray-600 text-sm">
                VE
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
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-sm mb-2 text-gray-700">Formül Önizleme:</h4>
        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
          {buildFormula() || 'Henüz formül tanımlanmadı'}
        </div>
      </div>
    </div>
  );
} 