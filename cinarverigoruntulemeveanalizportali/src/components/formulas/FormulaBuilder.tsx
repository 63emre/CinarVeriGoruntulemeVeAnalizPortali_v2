'use client';

import React, { useState } from 'react';
import { FcPlus, FcOk, FcCancel, FcRules } from 'react-icons/fc';

interface FormulaBuilderProps {
  variables: string[];
  onSave: (formula: string, name: string, color: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

interface FormulaCondition {
  leftOperand: {
    type: 'variable' | 'constant';
    value: string | number;
  };
  leftOperator?: '+' | '-' | '*' | '/';
  rightOperand?: {
    type: 'variable' | 'constant';
    value: string | number;
  };
  comparison: '>' | '<' | '>=' | '<=' | '==';
  rightSideOperand: {
    type: 'variable' | 'constant';
    value: string | number;
  };
  rightSideOperator?: '+' | '-' | '*' | '/';
  rightSideSecondOperand?: {
    type: 'variable' | 'constant';
    value: string | number;
  };
}

export default function FormulaBuilder({ variables, onSave, onCancel, isVisible }: FormulaBuilderProps) {
  const [conditions, setConditions] = useState<FormulaCondition[]>([
    {
      leftOperand: { type: 'variable', value: variables[0] || '' },
      comparison: '>',
      rightSideOperand: { type: 'constant', value: 0 }
    }
  ]);
  const [formulaName, setFormulaName] = useState('');
  const [formulaColor, setFormulaColor] = useState('#ff4444');

  const arithmeticOperators = [
    { value: '+', label: 'Toplama (+)' },
    { value: '-', label: 'Çıkarma (-)' },
    { value: '*', label: 'Çarpma (×)' },
    { value: '/', label: 'Bölme (÷)' }
  ];

  const comparisonOperators = [
    { value: '>', label: 'Büyük (>)' },
    { value: '<', label: 'Küçük (<)' },
    { value: '>=', label: 'Büyük veya eşit (≥)' },
    { value: '<=', label: 'Küçük veya eşit (≤)' },
    { value: '==', label: 'Eşit (=)' }
  ];

  const updateCondition = (index: number, updates: Partial<FormulaCondition>) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, ...updates } : condition
    ));
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      leftOperand: { type: 'variable', value: variables[0] || '' },
      comparison: '>',
      rightSideOperand: { type: 'constant', value: 0 }
    }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const generateFormulaString = (): string => {
    return conditions.map(condition => {
      // Sol taraf
      let leftSide = '';
      if (condition.leftOperand.type === 'variable') {
        leftSide = `[${condition.leftOperand.value}]`;
      } else {
        leftSide = String(condition.leftOperand.value);
      }

      // Eğer sol tarafta ikinci operand var ise
      if (condition.leftOperator && condition.rightOperand) {
        let rightOperandStr = '';
        if (condition.rightOperand.type === 'variable') {
          rightOperandStr = `[${condition.rightOperand.value}]`;
        } else {
          rightOperandStr = String(condition.rightOperand.value);
        }
        leftSide = `(${leftSide} ${condition.leftOperator} ${rightOperandStr})`;
      }

      // Sağ taraf
      let rightSide = '';
      if (condition.rightSideOperand.type === 'variable') {
        rightSide = `[${condition.rightSideOperand.value}]`;
      } else {
        rightSide = String(condition.rightSideOperand.value);
      }

      // Eğer sağ tarafta ikinci operand var ise
      if (condition.rightSideOperator && condition.rightSideSecondOperand) {
        let secondOperandStr = '';
        if (condition.rightSideSecondOperand.type === 'variable') {
          secondOperandStr = `[${condition.rightSideSecondOperand.value}]`;
        } else {
          secondOperandStr = String(condition.rightSideSecondOperand.value);
        }
        rightSide = `(${rightSide} ${condition.rightSideOperator} ${secondOperandStr})`;
      }

      return `${leftSide} ${condition.comparison} ${rightSide}`;
    }).join(' AND ');
  };

  const handleSave = () => {
    if (!formulaName.trim()) {
      alert('Lütfen formül adı girin');
      return;
    }
    
    const formulaString = generateFormulaString();
    onSave(formulaString, formulaName, formulaColor);
    
    // Reset form
    setConditions([{
      leftOperand: { type: 'variable', value: variables[0] || '' },
      comparison: '>',
      rightSideOperand: { type: 'constant', value: 0 }
    }]);
    setFormulaName('');
    setFormulaColor('#ff4444');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-8 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcRules className="mr-3 text-3xl" />
          Yeni Formül Oluştur
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
        >
          <FcCancel className="w-6 h-6" />
        </button>
      </div>

      {/* Formül Adı ve Renk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Formül Adı *
          </label>
          <input
            type="text"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            placeholder="ör. Yüksek İletkenlik Kontrolü"
            className="w-full px-4 py-3 text-gray-800 border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Vurgulama Rengi
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formulaColor}
              onChange={(e) => setFormulaColor(e.target.value)}
              className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
            />
            <div className="flex-1">
              <div 
                className="w-full h-6 rounded-md border-2 border-gray-300"
                style={{ backgroundColor: formulaColor }}
              ></div>
              <span className="text-xs text-gray-600 mt-1 block">{formulaColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formül Koşulları */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-gray-200 pb-2">
          Formül Koşulları
        </h4>
        
        {conditions.map((condition, index) => (
          <div key={index} className="border-2 border-gray-300 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-800">
                Koşul {index + 1}
              </h5>
              {conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(index)}
                  className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  Koşulu Sil
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
              {/* Sol Taraf - İlk Operand */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sol İfade</label>
                <select
                  value={condition.leftOperand.type}
                  onChange={(e) => updateCondition(index, {
                    leftOperand: {
                      type: e.target.value as 'variable' | 'constant',
                      value: e.target.value === 'variable' ? (variables[0] || '') : 0
                    }
                  })}
                  className="w-full text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="variable">📊 Değişken</option>
                  <option value="constant">🔢 Sabit Değer</option>
                </select>
                {condition.leftOperand.type === 'variable' ? (
                  <select
                    value={condition.leftOperand.value}
                    onChange={(e) => updateCondition(index, {
                      leftOperand: { ...condition.leftOperand, value: e.target.value }
                    })}
                    className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {variables.map(variable => (
                      <option key={variable} value={variable}>{variable}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    value={condition.leftOperand.value}
                    onChange={(e) => updateCondition(index, {
                      leftOperand: { ...condition.leftOperand, value: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Sayı girin"
                  />
                )}
              </div>

              {/* Aritmetik Operatör */}
              <div className="xl:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">İşlem</label>
                <select
                  value={condition.leftOperator || ''}
                  onChange={(e) => updateCondition(index, {
                    leftOperator: e.target.value ? e.target.value as '+' | '-' | '*' | '/' : undefined,
                    rightOperand: e.target.value ? { type: 'variable', value: variables[0] || '' } : undefined
                  })}
                  className="w-full text-sm font-bold text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Yok</option>
                  {arithmeticOperators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Sol Taraf - İkinci Operand (opsiyonel) */}
              {condition.leftOperator && (
                <div className="xl:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">İkinci Operand</label>
                  <select
                    value={condition.rightOperand?.type || 'variable'}
                    onChange={(e) => updateCondition(index, {
                      rightOperand: {
                        type: e.target.value as 'variable' | 'constant',
                        value: e.target.value === 'variable' ? (variables[0] || '') : 0
                      }
                    })}
                    className="w-full text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="variable">📊 Değişken</option>
                    <option value="constant">🔢 Sabit Değer</option>
                  </select>
                  {condition.rightOperand?.type === 'variable' ? (
                    <select
                      value={condition.rightOperand.value}
                      onChange={(e) => updateCondition(index, {
                        rightOperand: { ...condition.rightOperand!, value: e.target.value }
                      })}
                      className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      {variables.map(variable => (
                        <option key={variable} value={variable}>{variable}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      value={condition.rightOperand?.value || 0}
                      onChange={(e) => updateCondition(index, {
                        rightOperand: { ...condition.rightOperand!, value: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Sayı girin"
                    />
                  )}
                </div>
              )}

              {/* Karşılaştırma Operatörü */}
              <div className={`xl:col-span-1 ${!condition.leftOperator ? 'xl:col-start-4' : ''}`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Karşılaştırma</label>
                <select
                  value={condition.comparison}
                  onChange={(e) => updateCondition(index, {
                    comparison: e.target.value as '>' | '<' | '>=' | '<=' | '=='
                  })}
                  className="w-full text-sm font-bold text-purple-800 border-2 border-purple-300 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-purple-50"
                >
                  {comparisonOperators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Sağ Taraf - İlk Operand */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sağ İfade</label>
                <select
                  value={condition.rightSideOperand.type}
                  onChange={(e) => updateCondition(index, {
                    rightSideOperand: {
                      type: e.target.value as 'variable' | 'constant',
                      value: e.target.value === 'variable' ? (variables[0] || '') : 0
                    }
                  })}
                  className="w-full text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="variable">📊 Değişken</option>
                  <option value="constant">🔢 Sabit Değer</option>
                </select>
                {condition.rightSideOperand.type === 'variable' ? (
                  <select
                    value={condition.rightSideOperand.value}
                    onChange={(e) => updateCondition(index, {
                      rightSideOperand: { ...condition.rightSideOperand, value: e.target.value }
                    })}
                    className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {variables.map(variable => (
                      <option key={variable} value={variable}>{variable}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    value={condition.rightSideOperand.value}
                    onChange={(e) => updateCondition(index, {
                      rightSideOperand: { ...condition.rightSideOperand, value: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Sayı girin"
                  />
                )}
              </div>

              {/* Sağ Taraf Aritmetik Operatör */}
              <div className="xl:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">İşlem</label>
                <select
                  value={condition.rightSideOperator || ''}
                  onChange={(e) => updateCondition(index, {
                    rightSideOperator: e.target.value ? e.target.value as '+' | '-' | '*' | '/' : undefined,
                    rightSideSecondOperand: e.target.value ? { type: 'variable', value: variables[0] || '' } : undefined
                  })}
                  className="w-full text-sm font-bold text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Yok</option>
                  {arithmeticOperators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {/* Sağ Taraf - İkinci Operand (opsiyonel) */}
              {condition.rightSideOperator && (
                <div className="xl:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">İkinci Operand</label>
                  <select
                    value={condition.rightSideSecondOperand?.type || 'variable'}
                    onChange={(e) => updateCondition(index, {
                      rightSideSecondOperand: {
                        type: e.target.value as 'variable' | 'constant',
                        value: e.target.value === 'variable' ? (variables[0] || '') : 0
                      }
                    })}
                    className="w-full text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="variable">📊 Değişken</option>
                    <option value="constant">🔢 Sabit Değer</option>
                  </select>
                  {condition.rightSideSecondOperand?.type === 'variable' ? (
                    <select
                      value={condition.rightSideSecondOperand.value}
                      onChange={(e) => updateCondition(index, {
                        rightSideSecondOperand: { ...condition.rightSideSecondOperand!, value: e.target.value }
                      })}
                      className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      {variables.map(variable => (
                        <option key={variable} value={variable}>{variable}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      value={condition.rightSideSecondOperand?.value || 0}
                      onChange={(e) => updateCondition(index, {
                        rightSideSecondOperand: { ...condition.rightSideSecondOperand!, value: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full mt-2 text-sm font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Sayı girin"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Formül Önizleme */}
            <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
              <h6 className="text-sm font-bold text-blue-800 mb-2">📋 Bu Koşulun Önizlemesi:</h6>
              <code className="text-base font-mono text-green-700 bg-green-50 px-3 py-2 rounded-lg block">
                {generateFormulaString().split(' AND ')[index]}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Koşul Ekle Butonu */}
      <div className="mt-8">
        <button
          onClick={addCondition}
          className="text-blue-700 hover:text-blue-900 font-semibold text-lg flex items-center bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-lg transition-all duration-200"
        >
          <FcPlus className="mr-2 text-xl" />
          + Yeni Koşul Ekle
        </button>
      </div>

      {/* Tam Formül Önizleme */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
        <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
          🎯 Tam Formül Önizlemesi:
        </h4>
        <div className="bg-white p-4 rounded-lg border-2 border-green-200">
          <code className="text-lg font-mono text-green-700 break-all">
            {generateFormulaString()}
          </code>
        </div>
        <div className="mt-3 text-sm text-green-700">
          <p><strong>ℹ️ Açıklama:</strong> Formül tüm koşulların AND (VE) mantığı ile birleştirilmesiyle oluşur. Tüm koşullar sağlandığında hücreler vurgulanır.</p>
        </div>
      </div>

      {/* Kaydet/İptal Butonları */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg transition-all duration-200 border-2 border-gray-300"
        >
          ❌ İptal Et
        </button>
        <button
          onClick={handleSave}
          disabled={!formulaName.trim()}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center transition-all duration-200 border-2 border-green-700 disabled:border-gray-400 text-lg"
        >
          <FcOk className="mr-2 text-xl" />
          ✅ Formülü Kaydet
        </button>
      </div>
    </div>
  );
} 