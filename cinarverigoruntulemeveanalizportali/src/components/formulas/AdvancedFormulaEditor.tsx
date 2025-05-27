'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';

interface FormulaCondition {
  id: string;
  operand1: string;
  arithmeticOperator: string;
  operand2: string;
  comparisonOperator: string;
  operand3: string;
  isConstant: boolean;
  logicalOperator?: 'AND' | 'OR';
}

interface AdvancedFormulaEditorProps {
  variables: string[];
  initialFormula?: string;
  onFormulaChange: (formula: string, isValid: boolean) => void;
  className?: string;
}

const ARITHMETIC_OPERATORS = [
  { value: '+', label: '+' },
  { value: '-', label: '-' },
  { value: '*', label: '×' },
  { value: '/', label: '÷' }
];

const COMPARISON_OPERATORS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '==', label: '==' },
  { value: '!=', label: '!=' }
];

const LOGICAL_OPERATORS = [
  { value: 'AND', label: 'VE (AND)' },
  { value: 'OR', label: 'VEYA (OR)' }
];

export default function AdvancedFormulaEditor({
  variables,
  initialFormula = '',
  onFormulaChange,
  className = ''
}: AdvancedFormulaEditorProps) {
  const [conditions, setConditions] = useState<FormulaCondition[]>([]);
  const [previewFormula, setPreviewFormula] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  // Initialize with empty condition
  useEffect(() => {
    if (conditions.length === 0) {
      addCondition();
    }
  }, []);

  // Parse initial formula if provided
  useEffect(() => {
    if (initialFormula && conditions.length === 1 && !conditions[0].operand1) {
      // Try to parse the initial formula
      parseInitialFormula(initialFormula);
    }
  }, [initialFormula]);

  // Update preview and validation whenever conditions change
  useEffect(() => {
    const formula = generateFormulaString();
    const errors = validateConditions();
    
    setPreviewFormula(formula);
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    
    onFormulaChange(formula, errors.length === 0);
  }, [conditions]);

  const parseInitialFormula = (formula: string) => {
    // Simple parser for basic formulas
    // This is a basic implementation - can be enhanced
    try {
      const conditionParts = formula.split(/\s+(AND|OR)\s+/);
      const newConditions: FormulaCondition[] = [];
      
      conditionParts.forEach((part, index) => {
        if (part === 'AND' || part === 'OR') return;
        
        // Parse individual condition
        const comparisonMatch = part.match(/(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)/);
        if (comparisonMatch) {
          const [, leftSide, compOp, rightSide] = comparisonMatch;
          
          // Parse left side for arithmetic
          const leftMatch = leftSide.match(/\[([^\]]+)\]\s*([+\-*/])\s*\[([^\]]+)\]/);
          const rightIsConstant = !rightSide.includes('[');
          const rightOperand = rightIsConstant ? rightSide.trim() : rightSide.replace(/[\[\]]/g, '');
          
          const condition: FormulaCondition = {
            id: `condition-${Date.now()}-${index}`,
            operand1: leftMatch ? leftMatch[1] : leftSide.replace(/[\[\]]/g, ''),
            arithmeticOperator: leftMatch ? leftMatch[2] : '',
            operand2: leftMatch ? leftMatch[3] : '',
            comparisonOperator: compOp,
            operand3: rightOperand,
            isConstant: rightIsConstant,
            logicalOperator: index < conditionParts.length - 2 ? 
              (conditionParts[index + 1] as 'AND' | 'OR') : undefined
          };
          
          newConditions.push(condition);
        }
      });
      
      if (newConditions.length > 0) {
        setConditions(newConditions);
      }
    } catch (error) {
      console.error('Error parsing initial formula:', error);
    }
  };

  const addCondition = () => {
    const newCondition: FormulaCondition = {
      id: `condition-${Date.now()}`,
      operand1: '',
      arithmeticOperator: '',
      operand2: '',
      comparisonOperator: '>',
      operand3: '',
      isConstant: false,
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length === 1) return; // Keep at least one condition
    
    const updatedConditions = conditions.filter(c => c.id !== id);
    // Remove logical operator from the new last condition
    if (updatedConditions.length > 0) {
      updatedConditions[updatedConditions.length - 1].logicalOperator = undefined;
    }
    setConditions(updatedConditions);
  };

  const updateCondition = (id: string, field: keyof FormulaCondition, value: string | boolean) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  const generateFormulaString = (): string => {
    return conditions.map((condition, index) => {
      let leftSide = `[${condition.operand1}]`;
      
      // Add arithmetic expression if operand2 is provided
      if (condition.operand2 && condition.arithmeticOperator) {
        leftSide = `(${leftSide} ${condition.arithmeticOperator} [${condition.operand2}])`;
      }
      
      // Right side
      const rightSide = condition.isConstant ? 
        condition.operand3 : 
        `[${condition.operand3}]`;
      
      // Complete condition
      let conditionString = `${leftSide} ${condition.comparisonOperator} ${rightSide}`;
      
      // Add logical operator if not the last condition
      if (condition.logicalOperator && index < conditions.length - 1) {
        conditionString += ` ${condition.logicalOperator}`;
      }
      
      return conditionString;
    }).join(' ');
  };

  const validateConditions = (): string[] => {
    const errors: string[] = [];
    
    conditions.forEach((condition, index) => {
      if (!condition.operand1) {
        errors.push(`Koşul ${index + 1}: İlk operand seçilmelidir`);
      }
      
      if (condition.arithmeticOperator && !condition.operand2) {
        errors.push(`Koşul ${index + 1}: Aritmetik operatör varsa ikinci operand gereklidir`);
      }
      
      if (!condition.operand3) {
        errors.push(`Koşul ${index + 1}: Karşılaştırma operandı seçilmelidir`);
      }
      
      if (condition.isConstant && condition.operand3 && isNaN(Number(condition.operand3))) {
        errors.push(`Koşul ${index + 1}: Sabit değer sayısal olmalıdır`);
      }
    });
    
    return errors;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <FiInfo className="text-blue-500 mr-2" />
          <h4 className="font-medium text-blue-800">Formül Oluşturucu</h4>
        </div>
        <p className="text-sm text-blue-700">
          Dropdown&apos;lardan seçim yaparak formülünüzü oluşturun. Her koşul değişken karşılaştırması şeklinde olmalıdır.
        </p>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Koşul {index + 1}</span>
              {conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(condition.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Koşulu kaldır"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              {/* Operand 1 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Değişken 1
                </label>
                <select
                  value={condition.operand1}
                  onChange={(e) => updateCondition(condition.id, 'operand1', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz...</option>
                  {variables.map(variable => (
                    <option key={variable} value={variable}>{variable}</option>
                  ))}
                </select>
              </div>

              {/* Arithmetic Operator */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  İşlem
                </label>
                <select
                  value={condition.arithmeticOperator}
                  onChange={(e) => updateCondition(condition.id, 'arithmeticOperator', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Yok</option>
                  {ARITHMETIC_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Operand 2 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Değişken 2
                </label>
                <select
                  value={condition.operand2}
                  onChange={(e) => updateCondition(condition.id, 'operand2', e.target.value)}
                  disabled={!condition.arithmeticOperator}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seçiniz...</option>
                  {variables.map(variable => (
                    <option key={variable} value={variable}>{variable}</option>
                  ))}
                </select>
              </div>

              {/* Comparison Operator */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Karşılaştırma
                </label>
                <select
                  value={condition.comparisonOperator}
                  onChange={(e) => updateCondition(condition.id, 'comparisonOperator', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {COMPARISON_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Operand 3 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Karşılaştırma Değeri
                </label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <input
                      type="radio"
                      id={`variable-${condition.id}`}
                      name={`type-${condition.id}`}
                      checked={!condition.isConstant}
                      onChange={() => updateCondition(condition.id, 'isConstant', false)}
                      className="text-blue-500"
                    />
                    <label htmlFor={`variable-${condition.id}`} className="text-xs">Değişken</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="radio"
                      id={`constant-${condition.id}`}
                      name={`type-${condition.id}`}
                      checked={condition.isConstant}
                      onChange={() => updateCondition(condition.id, 'isConstant', true)}
                      className="text-blue-500"
                    />
                    <label htmlFor={`constant-${condition.id}`} className="text-xs">Sabit</label>
                  </div>
                  
                  {condition.isConstant ? (
                    <input
                      type="number"
                      step="any"
                      value={condition.operand3}
                      onChange={(e) => updateCondition(condition.id, 'operand3', e.target.value)}
                      placeholder="Sayı girin"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <select
                      value={condition.operand3}
                      onChange={(e) => updateCondition(condition.id, 'operand3', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçiniz...</option>
                      {variables.map(variable => (
                        <option key={variable} value={variable}>{variable}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Logical Operator */}
            {index < conditions.length - 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Sonraki koşulla bağlantı
                </label>
                <select
                  value={condition.logicalOperator || 'AND'}
                  onChange={(e) => updateCondition(condition.id, 'logicalOperator', e.target.value as 'AND' | 'OR')}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {LOGICAL_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Condition Button */}
      <button
        onClick={addCondition}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors"
      >
        <FiPlus className="mr-2" />
        Koşul Ekle
      </button>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">Formül Önizlemesi</h4>
        <code className="block text-sm font-mono text-gray-800 bg-white p-2 rounded border">
          {previewFormula || 'Formül oluşturuluyor...'}
        </code>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-700 mb-2">Hatalar</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success indicator */}
      {isValid && conditions.some(c => c.operand1) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Formül geçerli ve kullanılmaya hazır
          </p>
        </div>
      )}
    </div>
  );
} 