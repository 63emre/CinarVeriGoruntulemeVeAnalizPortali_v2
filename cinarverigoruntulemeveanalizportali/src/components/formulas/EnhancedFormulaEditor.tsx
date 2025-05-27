'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiInfo, FiSave, FiX } from 'react-icons/fi';
import { FcRules, FcApproval, FcHighPriority } from 'react-icons/fc';

interface Variable {
  name: string;
  type: 'numeric' | 'text';
  unit?: string;
}

interface OperandExpression {
  id: string;
  variables: { variable: string; operator: string }[];
  constant?: number;
  type: 'variables' | 'constant';
}

interface FormulaCondition {
  id: string;
  leftExpression: OperandExpression;
  comparisonOperator: string;
  rightExpression: OperandExpression;
  logicalOperator?: 'AND' | 'OR';
}

interface EnhancedFormulaEditorProps {
  variables: Variable[];
  initialFormula?: string;
  onFormulaChange: (formula: string, isValid: boolean) => void;
  onSave?: (formula: string, conditions: FormulaCondition[]) => void;
  className?: string;
  readOnly?: boolean;
}

const ARITHMETIC_OPERATORS = [
  { value: '+', label: 'Toplama (+)' },
  { value: '-', label: 'Çıkarma (-)' },
  { value: '*', label: 'Çarpma (*)' },
  { value: '/', label: 'Bölme (/)' }
];

const COMPARISON_OPERATORS = [
  { value: '>', label: 'Büyüktür (>)' },
  { value: '<', label: 'Küçüktür (<)' },
  { value: '>=', label: 'Büyük eşit (>=)' },
  { value: '<=', label: 'Küçük eşit (<=)' },
  { value: '==', label: 'Eşittir (==)' },
  { value: '!=', label: 'Eşit değil (!=)' }
];

const LOGICAL_OPERATORS = [
  { value: 'AND', label: 'VE (AND)' },
  { value: 'OR', label: 'VEYA (OR)' }
];

export default function EnhancedFormulaEditor({
  variables,
  initialFormula = '',
  onFormulaChange,
  onSave,
  className = '',
  readOnly = false
}: EnhancedFormulaEditorProps) {
  const [conditions, setConditions] = useState<FormulaCondition[]>([]);
  const [nextConditionId, setNextConditionId] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFormula, setPreviewFormula] = useState('');

  // Initialize with existing formula if provided
  useEffect(() => {
    if (initialFormula && conditions.length === 0) {
      try {
        parseExistingFormula(initialFormula);
      } catch (err) {
        console.error('Error parsing initial formula:', err);
        addNewCondition();
      }
    } else if (!initialFormula && conditions.length === 0) {
      addNewCondition();
    }
  }, [initialFormula]);

  // Update formula when conditions change
  useEffect(() => {
    const { formula, valid } = generateFormula();
    setPreviewFormula(formula);
    setIsValid(valid);
    onFormulaChange(formula, valid);
  }, [conditions]);

  const parseExistingFormula = (formula: string) => {
    // Basic parsing for existing formulas - this is a simplified version
    // In a real implementation, you'd want a more robust parser
    const parts = formula.split(/\s+(AND|OR)\s+/);
    const parsedConditions: FormulaCondition[] = [];
    let logicalOps: string[] = [];

    // Extract logical operators
    const matches = formula.match(/\s+(AND|OR)\s+/g);
    if (matches) {
      logicalOps = matches.map(m => m.trim());
    }

    parts.forEach((part, index) => {
      if (part === 'AND' || part === 'OR') return;

      try {
        const condition = parseConditionString(part);
        if (index > 0 && logicalOps[Math.floor(index / 2) - 1]) {
          condition.logicalOperator = logicalOps[Math.floor(index / 2) - 1] as 'AND' | 'OR';
        }
        parsedConditions.push(condition);
      } catch (err) {
        console.error('Error parsing condition:', part, err);
      }
    });

    if (parsedConditions.length > 0) {
      setConditions(parsedConditions);
      setNextConditionId(parsedConditions.length + 1);
    } else {
      addNewCondition();
    }
  };

  const parseConditionString = (conditionStr: string): FormulaCondition => {
    // Parse a condition like "(Var1 + Var2) > 0.001"
    const comparisonMatch = conditionStr.match(/(.+?)\s*([><=!]+)\s*(.+)/);
    if (!comparisonMatch) {
      throw new Error('Invalid condition format');
    }

    const [, leftStr, operator, rightStr] = comparisonMatch;

    return {
      id: `condition-${nextConditionId}`,
      leftExpression: parseExpression(leftStr.trim()),
      comparisonOperator: operator,
      rightExpression: parseExpression(rightStr.trim())
    };
  };

  const parseExpression = (exprStr: string): OperandExpression => {
    // Remove parentheses if present
    const cleanExpr = exprStr.replace(/^\(|\)$/g, '').trim();
    
    // Check if it's a constant
    const constantMatch = cleanExpr.match(/^-?\d+\.?\d*$/);
    if (constantMatch) {
      return {
        id: `expr-${Date.now()}`,
        type: 'constant',
        constant: parseFloat(constantMatch[0]),
        variables: []
      };
    }

    // Parse variables and operators
    const variableMatches = cleanExpr.split(/\s*[+\-*/]\s*/);
    const operatorMatches = cleanExpr.match(/[+\-*/]/g) || [];
    
    const variablesWithOps: { variable: string; operator: string }[] = [];
    
    variableMatches.forEach((varName, index) => {
      if (varName.trim()) {
        variablesWithOps.push({
          variable: varName.trim(),
          operator: index < operatorMatches.length ? operatorMatches[index] : ''
        });
      }
    });

    return {
      id: `expr-${Date.now()}`,
      type: 'variables',
      variables: variablesWithOps,
      constant: undefined
    };
  };

  const addNewCondition = () => {
    const newCondition: FormulaCondition = {
      id: `condition-${nextConditionId}`,
      leftExpression: {
        id: `left-${nextConditionId}`,
        type: 'variables',
        variables: [{ variable: variables[0]?.name || '', operator: '' }]
      },
      comparisonOperator: '>',
      rightExpression: {
        id: `right-${nextConditionId}`,
        type: 'constant',
        variables: [],
        constant: 0
      }
    };

    setConditions([...conditions, newCondition]);
    setNextConditionId(nextConditionId + 1);
  };

  const removeCondition = (conditionId: string) => {
    const updatedConditions = conditions.filter(c => c.id !== conditionId);
    
    // Remove logical operator from the first condition if it exists
    if (updatedConditions.length > 0) {
      updatedConditions[0] = { ...updatedConditions[0], logicalOperator: undefined };
    }
    
    setConditions(updatedConditions);
  };

  const updateCondition = (conditionId: string, updates: Partial<FormulaCondition>) => {
    setConditions(conditions.map(c => 
      c.id === conditionId ? { ...c, ...updates } : c
    ));
  };

  const addVariableToExpression = (conditionId: string, side: 'left' | 'right') => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const expression = side === 'left' ? condition.leftExpression : condition.rightExpression;
    if (expression.type === 'constant') return;

    const updatedVariables = [
      ...expression.variables,
      { variable: variables[0]?.name || '', operator: '+' }
    ];

    const updatedExpression = {
      ...expression,
      variables: updatedVariables
    };

    updateCondition(conditionId, {
      [side === 'left' ? 'leftExpression' : 'rightExpression']: updatedExpression
    });
  };

  const removeVariableFromExpression = (conditionId: string, side: 'left' | 'right', variableIndex: number) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const expression = side === 'left' ? condition.leftExpression : condition.rightExpression;
    if (expression.type === 'constant' || expression.variables.length <= 1) return;

    const updatedVariables = expression.variables.filter((_, index) => index !== variableIndex);
    
    // Remove operator from last variable if it exists
    if (updatedVariables.length > 0) {
      updatedVariables[updatedVariables.length - 1].operator = '';
    }

    const updatedExpression = {
      ...expression,
      variables: updatedVariables
    };

    updateCondition(conditionId, {
      [side === 'left' ? 'leftExpression' : 'rightExpression']: updatedExpression
    });
  };

  const updateExpressionVariable = (
    conditionId: string, 
    side: 'left' | 'right', 
    variableIndex: number, 
    field: 'variable' | 'operator', 
    value: string
  ) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const expression = side === 'left' ? condition.leftExpression : condition.rightExpression;
    if (expression.type === 'constant') return;

    const updatedVariables = expression.variables.map((v, index) => 
      index === variableIndex ? { ...v, [field]: value } : v
    );

    const updatedExpression = {
      ...expression,
      variables: updatedVariables
    };

    updateCondition(conditionId, {
      [side === 'left' ? 'leftExpression' : 'rightExpression']: updatedExpression
    });
  };

  const toggleExpressionType = (conditionId: string, side: 'left' | 'right') => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const expression = side === 'left' ? condition.leftExpression : condition.rightExpression;
    
    const newExpression: OperandExpression = expression.type === 'variables' 
      ? {
          id: expression.id,
          type: 'constant',
          variables: [],
          constant: 0
        }
      : {
          id: expression.id,
          type: 'variables',
          variables: [{ variable: variables[0]?.name || '', operator: '' }],
          constant: undefined
        };

    updateCondition(conditionId, {
      [side === 'left' ? 'leftExpression' : 'rightExpression']: newExpression
    });
  };

  const generateFormula = (): { formula: string; valid: boolean } => {
    if (conditions.length === 0) {
      return { formula: '', valid: false };
    }

    try {
      const formulaParts = conditions.map((condition, index) => {
        const leftStr = expressionToString(condition.leftExpression);
        const rightStr = expressionToString(condition.rightExpression);
        
        if (!leftStr || !rightStr) {
          throw new Error('Incomplete condition');
        }

        let conditionStr = `(${leftStr}) ${condition.comparisonOperator} (${rightStr})`;
        
        if (index > 0 && condition.logicalOperator) {
          conditionStr = `${condition.logicalOperator} ${conditionStr}`;
        }
        
        return conditionStr;
      });

      const formula = formulaParts.join(' ');
      setError(null);
      return { formula, valid: true };
    } catch (err) {
      setError((err as Error).message);
      return { formula: '', valid: false };
    }
  };

  const expressionToString = (expr: OperandExpression): string => {
    if (expr.type === 'constant') {
      return expr.constant?.toString() || '0';
    }

    if (expr.variables.length === 0) {
      return '';
    }

    return expr.variables.map((v, index) => {
      const varPart = v.variable || 'Variable';
      const opPart = index < expr.variables.length - 1 && v.operator ? ` ${v.operator} ` : '';
      return varPart + opPart;
    }).join('');
  };

  const handleSave = () => {
    if (isValid && onSave) {
      onSave(previewFormula, conditions);
    }
  };

  if (readOnly) {
    return (
      <div className={`p-4 border rounded-lg bg-gray-50 ${className}`}>
        <div className="font-mono text-sm text-gray-800">{initialFormula}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <FcRules className="mr-2" />
          Gelişmiş Formül Editörü
        </h3>
        <div className="flex items-center space-x-2">
          {isValid ? (
            <FcApproval className="h-5 w-5" title="Formül geçerli" />
          ) : (
            <FcHighPriority className="h-5 w-5" title="Formül geçersiz" />
          )}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`px-3 py-1 rounded-md text-sm ${
                isValid 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              <FiSave className="inline mr-1" />
              Kaydet
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-3 text-red-700 text-sm">
          <FiInfo className="inline mr-1" />
          {error}
        </div>
      )}

      {/* Conditions */}
      <div className="space-y-4">
        {conditions.map((condition, conditionIndex) => (
          <div key={condition.id} className="border rounded-lg p-4 bg-white shadow-sm">
            {/* Logical Operator for subsequent conditions */}
            {conditionIndex > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mantıksal Operatör
                </label>
                <select
                  value={condition.logicalOperator || 'AND'}
                  onChange={(e) => updateCondition(condition.id, { 
                    logicalOperator: e.target.value as 'AND' | 'OR' 
                  })}
                  className="w-32 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                >
                  {LOGICAL_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              {/* Left Expression */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Sol İfade</label>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleExpressionType(condition.id, 'left')}
                      className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                      title={condition.leftExpression.type === 'variables' ? 'Sabite çevir' : 'Değişkene çevir'}
                    >
                      {condition.leftExpression.type === 'variables' ? 'Sabit' : 'Değişken'}
                    </button>
                  </div>
                </div>
                
                {condition.leftExpression.type === 'constant' ? (
                  <input
                    type="number"
                    step="any"
                    value={condition.leftExpression.constant || 0}
                    onChange={(e) => updateCondition(condition.id, {
                      leftExpression: {
                        ...condition.leftExpression,
                        constant: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                    placeholder="Sabit değer"
                  />
                ) : (
                  <div className="space-y-2">
                    {condition.leftExpression.variables.map((variable, varIndex) => (
                      <div key={varIndex} className="flex items-center space-x-2">
                        <select
                          value={variable.variable}
                          onChange={(e) => updateExpressionVariable(
                            condition.id, 'left', varIndex, 'variable', e.target.value
                          )}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                        >
                          <option value="">Değişken seç</option>
                          {variables.map(v => (
                            <option key={v.name} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                        
                        {varIndex < condition.leftExpression.variables.length - 1 && (
                          <select
                            value={variable.operator}
                            onChange={(e) => updateExpressionVariable(
                              condition.id, 'left', varIndex, 'operator', e.target.value
                            )}
                            className="w-20 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                          >
                            {ARITHMETIC_OPERATORS.map(op => (
                              <option key={op.value} value={op.value}>{op.value}</option>
                            ))}
                          </select>
                        )}
                        
                        {condition.leftExpression.variables.length > 1 && (
                          <button
                            onClick={() => removeVariableFromExpression(condition.id, 'left', varIndex)}
                            className="text-red-500 hover:text-red-700"
                            title="Değişkeni kaldır"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addVariableToExpression(condition.id, 'left')}
                      className="w-full py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded border border-green-300"
                    >
                      <FiPlus className="inline mr-1" />
                      Değişken Ekle
                    </button>
                  </div>
                )}
              </div>

              {/* Comparison Operator */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Karşılaştırma</label>
                <select
                  value={condition.comparisonOperator}
                  onChange={(e) => updateCondition(condition.id, { comparisonOperator: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                >
                  {COMPARISON_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Right Expression */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Sağ İfade</label>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleExpressionType(condition.id, 'right')}
                      className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                      title={condition.rightExpression.type === 'variables' ? 'Sabite çevir' : 'Değişkene çevir'}
                    >
                      {condition.rightExpression.type === 'variables' ? 'Sabit' : 'Değişken'}
                    </button>
                  </div>
                </div>
                
                {condition.rightExpression.type === 'constant' ? (
                  <input
                    type="number"
                    step="any"
                    value={condition.rightExpression.constant || 0}
                    onChange={(e) => updateCondition(condition.id, {
                      rightExpression: {
                        ...condition.rightExpression,
                        constant: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                    placeholder="Sabit değer (örn: 0.001)"
                  />
                ) : (
                  <div className="space-y-2">
                    {condition.rightExpression.variables.map((variable, varIndex) => (
                      <div key={varIndex} className="flex items-center space-x-2">
                        <select
                          value={variable.variable}
                          onChange={(e) => updateExpressionVariable(
                            condition.id, 'right', varIndex, 'variable', e.target.value
                          )}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                        >
                          <option value="">Değişken seç</option>
                          {variables.map(v => (
                            <option key={v.name} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                        
                        {varIndex < condition.rightExpression.variables.length - 1 && (
                          <select
                            value={variable.operator}
                            onChange={(e) => updateExpressionVariable(
                              condition.id, 'right', varIndex, 'operator', e.target.value
                            )}
                            className="w-20 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                          >
                            {ARITHMETIC_OPERATORS.map(op => (
                              <option key={op.value} value={op.value}>{op.value}</option>
                            ))}
                          </select>
                        )}
                        
                        {condition.rightExpression.variables.length > 1 && (
                          <button
                            onClick={() => removeVariableFromExpression(condition.id, 'right', varIndex)}
                            className="text-red-500 hover:text-red-700"
                            title="Değişkeni kaldır"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addVariableToExpression(condition.id, 'right')}
                      className="w-full py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded border border-green-300"
                    >
                      <FiPlus className="inline mr-1" />
                      Değişken Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Remove Condition Button */}
            {conditions.length > 1 && (
              <div className="mt-4 text-right">
                <button
                  onClick={() => removeCondition(condition.id)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                >
                  <FiTrash2 className="inline mr-1" />
                  Koşulu Kaldır
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Condition Button */}
      <div className="text-center">
        <button
          onClick={addNewCondition}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
        >
          <FiPlus className="inline mr-1" />
          Yeni Koşul Ekle
        </button>
      </div>

      {/* Formula Preview */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Formül Önizlemesi:</h4>
        <div className={`font-mono text-sm p-3 bg-white border rounded ${
          isValid ? 'border-green-300 text-green-800' : 'border-red-300 text-red-800'
        }`}>
          {previewFormula || 'Henüz geçerli bir formül oluşturulmadı'}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
        <div className="flex">
          <FiInfo className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Kullanım Bilgileri:</h4>
            <ul className="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Her koşulda sol ve sağ ifadeler olabilir</li>
              <li>İfadeler değişkenlerden veya sabit değerlerden oluşabilir</li>
              <li>Değişkenler arasında +, -, *, / işlemleri kullanılabilir</li>
              <li>Karşılaştırma operatörleri: &gt;, &lt;, &gt;=, &lt;=, ==, !=</li>
              <li>Birden fazla koşul AND veya OR ile bağlanabilir</li>
              <li>&ldquo;Koşulu Kaldır&rdquo; butonu ile istenmeyen koşullar silinebilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 