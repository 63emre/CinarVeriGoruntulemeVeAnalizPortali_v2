'use client';

import React, { useState, useEffect } from 'react';
import { FcCancel, FcRules } from 'react-icons/fc';

interface FormulaBuilderProps {
  variables: string[];
  onSave: (formula: string, name: string, color: string, scope: 'table' | 'workspace', tableId?: string) => void;
  onCancel: () => void;
  isVisible: boolean;
  availableTables?: Array<{ id: string; name: string; }>;
  currentTableId?: string;
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

export default function FormulaBuilder({ 
  variables, 
  onSave, 
  onCancel, 
  isVisible, 
  availableTables = [], 
  currentTableId 
}: FormulaBuilderProps) {
  const [conditions, setConditions] = useState<FormulaCondition[]>([
    {
      leftOperand: { type: 'variable', value: variables[0] || '' },
      comparison: '>',
      rightSideOperand: { type: 'constant', value: 0 }
    }
  ]);
  const [formulaName, setFormulaName] = useState('');
  const [formulaColor, setFormulaColor] = useState('#ff4444');
  
  const [formulaScope, setFormulaScope] = useState<'table' | 'workspace'>('table');
  const [selectedTableId, setSelectedTableId] = useState<string>(currentTableId || '');

  // Reset form when visibility changes
  useEffect(() => {
    if (isVisible) {
      setConditions([{
        leftOperand: { type: 'variable', value: variables[0] || '' },
        comparison: '>',
        rightSideOperand: { type: 'constant', value: 0 }
      }]);
      setFormulaName('');
      setFormulaColor('#ff4444');
      setFormulaScope('table');
      setSelectedTableId(currentTableId || '');
    }
  }, [isVisible, variables, currentTableId]);

  // Update conditions when variables change
  useEffect(() => {
    if (variables.length > 0 && conditions.length > 0) {
      setConditions(prev => prev.map(condition => ({
        ...condition,
        leftOperand: condition.leftOperand.type === 'variable' && !variables.includes(condition.leftOperand.value as string)
          ? { ...condition.leftOperand, value: variables[0] }
          : condition.leftOperand,
        rightSideOperand: condition.rightSideOperand.type === 'variable' && !variables.includes(condition.rightSideOperand.value as string)
          ? { ...condition.rightSideOperand, value: variables[0] }
          : condition.rightSideOperand
      })));
    }
  }, [variables, conditions.length]);

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
    
    if (formulaScope === 'table' && !selectedTableId) {
      alert('Lütfen hedef tablo seçin');
      return;
    }
    
    const formulaString = generateFormulaString();
    onSave(
      formulaString, 
      formulaName, 
      formulaColor, 
      formulaScope, 
      formulaScope === 'table' ? selectedTableId : undefined
    );
    
    // Reset form
    setConditions([{
      leftOperand: { type: 'variable', value: variables[0] || '' },
      comparison: '>',
      rightSideOperand: { type: 'constant', value: 0 }
    }]);
    setFormulaName('');
    setFormulaColor('#ff4444');
    setFormulaScope('table');
    setSelectedTableId(currentTableId || '');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FcRules className="mr-3 text-2xl" />
          Yeni Formül Oluştur
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
        >
          <FcCancel className="w-5 h-5" />
        </button>
      </div>

      {/* ENHANCED: Formül Adı, Renk ve Kapsam */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Formül Adı</label>
          <input
            type="text"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            className="w-full text-base font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Örn: Yüksek İletkenlik Kontrolü"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Renk</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formulaColor}
              onChange={(e) => setFormulaColor(e.target.value)}
              className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-gray-600 font-mono">{formulaColor}</span>
          </div>
        </div>
        
        {/* ENHANCED: Formula Scope Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Uygulama Kapsamı</label>
          <select
            value={formulaScope}
            onChange={(e) => {
              const newScope = e.target.value as 'table' | 'workspace';
              setFormulaScope(newScope);
              if (newScope === 'workspace') {
                setSelectedTableId('');
              } else {
                setSelectedTableId(currentTableId || '');
              }
            }}
            className="w-full text-base font-medium text-gray-800 border-2 border-purple-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-purple-50"
          >
            <option value="table">📊 Belirli Tablo</option>
            <option value="workspace">🌐 Tüm Workspace</option>
          </select>
        </div>
      </div>
      
      {/* ENHANCED: Table Selection (only show when scope is 'table') */}
      {formulaScope === 'table' && (
        <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <label className="block text-sm font-semibold text-purple-700 mb-2">
            🎯 Hedef Tablo Seçimi
          </label>
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            className="w-full text-base font-medium text-gray-800 border-2 border-purple-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Tablo seçin...</option>
            {availableTables.map(table => (
              <option key={table.id} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-purple-600 mt-2">
            Formül sadece seçilen tabloda uygulanacak ve o tablonun verilerine göre değerlendirilecek.
          </p>
        </div>
      )}
      
      {/* ENHANCED: Scope Information Box */}
      <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
        <h4 className="text-base font-bold text-blue-800 mb-2">ℹ️ Kapsam Açıklaması:</h4>
        {formulaScope === 'table' ? (
          <div className="text-sm text-blue-700">
            <p className="mb-2"><strong>📊 Belirli Tablo Kapsamı:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Formül sadece seçilen tabloda çalışır</li>
              <li>O tablonun değişken ve verilerine erişim sağlar</li>
              <li>Diğer tablolar etkilenmez</li>
              <li>Performans açısından daha hızlı</li>
            </ul>
          </div>
        ) : (
          <div className="text-sm text-blue-700">
            <p className="mb-2"><strong>🌐 Tüm Workspace Kapsamı:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Formül workspace içindeki tüm tablolarda çalışır</li>
              <li>Tüm tabloların değişken ve verilerine erişim</li>
              <li>Yeni eklenen tablolarda da otomatik çalışır</li>
              <li>Genel kurallar için idealdir</li>
            </ul>
          </div>
        )}
      </div>

      {/* Koşullar */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Formül Koşulları</h4>
        
        {conditions.map((condition, index) => (
          <div key={index} className="border-2 border-gray-300 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-base font-bold text-blue-800">
                🔍 Koşul {index + 1}
              </h5>
              {conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(index)}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                  title="Koşulu Kaldır"
                >
                  🗑️
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
              <div className="xl:col-span-1">
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
        
        {/* Koşul Ekleme Butonu */}
        <div className="text-center">
          <button
            onClick={addCondition}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ➕ Yeni Koşul Ekle
          </button>
        </div>
      </div>

      {/* Tam Formül Önizleme */}
      <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl">
        <h4 className="text-lg font-bold text-green-800 mb-3">🎯 Tam Formül Önizlemesi:</h4>
        <div className="bg-white border-2 border-green-400 rounded-lg p-4">
          <code className="text-lg font-mono text-green-700 break-all">
            {generateFormulaString()}
          </code>
        </div>
        <p className="text-sm text-green-600 mt-2">
          Bu formül tablodaki veriler üzerinde çalıştırılacak ve koşulları sağlayan hücreler <span style={{backgroundColor: formulaColor, color: 'white', padding: '2px 6px', borderRadius: '4px'}}>{formulaColor}</span> rengiyle vurgulanacak.
        </p>
      </div>

      {/* Kaydet ve İptal Butonları */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
        >
          ❌ İptal
        </button>
        <button
          onClick={handleSave}
          disabled={!formulaName.trim()}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            formulaName.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          💾 Formülü Kaydet
        </button>
      </div>
    </div>
  );
} 