'use client';

import React, { useState, useEffect } from 'react';
import { FcCancel, FcRules, FcOk, FcCalculator } from 'react-icons/fc';

interface FormulaBuilderProps {
  variables: string[];
  onSave: (formula: string, name: string, color: string, scope: 'table' | 'workspace', tableId?: string) => void;
  onCancel: () => void;
  isVisible: boolean;
  availableTables?: Array<{ id: string; name: string; }>;
  currentTableId?: string;
}

// Excel-like simple formula structure
interface SimpleFormula {
  targetVariable: string; // Left side - the variable to evaluate
  comparison: '>' | '<' | '>=' | '<=' | '==' | '!=';
  rightSideExpression: string; // Right side - can contain any expression with variables, numbers, operations
}

export default function FormulaBuilder({ 
  variables, 
  onSave, 
  onCancel, 
  isVisible, 
  availableTables = [], 
  currentTableId 
}: FormulaBuilderProps) {
  // Single formula state - Excel-like simplicity
  const [formula, setFormula] = useState<SimpleFormula>({
    targetVariable: variables[0] || '',
    comparison: '>',
    rightSideExpression: '320'
  });
  
  const [formulaName, setFormulaName] = useState('');
  const [formulaColor, setFormulaColor] = useState('#ff4444');
  const [formulaScope, setFormulaScope] = useState<'table' | 'workspace'>('table');
  const [selectedTableId, setSelectedTableId] = useState<string>(currentTableId || '');

  // Reset form when visibility changes
  useEffect(() => {
    if (isVisible) {
      setFormula({
        targetVariable: variables[0] || '',
        comparison: '>',
        rightSideExpression: '320'
      });
      setFormulaName('');
      setFormulaColor('#ff4444');
      setFormulaScope('table');
      setSelectedTableId(currentTableId || '');
    }
  }, [isVisible, variables, currentTableId]);

  // Update target variable when variables change
  useEffect(() => {
    if (variables.length > 0 && formula.targetVariable && !variables.includes(formula.targetVariable)) {
      setFormula(prev => ({
        ...prev,
        targetVariable: variables[0]
      }));
    }
  }, [variables, formula.targetVariable]);

  const comparisonOperators = [
    { value: '>', label: 'büyük (>)' },
    { value: '<', label: 'küçük (<)' },
    { value: '>=', label: 'büyük eşit (≥)' },
    { value: '<=', label: 'küçük eşit (≤)' },
    { value: '==', label: 'eşit (=)' },
    { value: '!=', label: 'eşit değil (≠)' }
  ];

  // Generate the formula string in the format expected by the evaluator
  const generateFormulaString = (): string => {
    // Convert to the format: [targetVariable] comparison rightSideExpression
    const leftSide = `[${formula.targetVariable}]`;
    const rightSide = formula.rightSideExpression;
    
    return `${leftSide} ${formula.comparison} ${rightSide}`;
  };

  // Insert variable into right side expression at cursor
  const insertVariable = (variable: string) => {
    const variableWithBrackets = `[${variable}]`;
    setFormula(prev => ({
      ...prev,
      rightSideExpression: prev.rightSideExpression + variableWithBrackets
    }));
  };

  // Quick insert common operations
  const insertOperation = (operation: string) => {
    setFormula(prev => ({
      ...prev,
      rightSideExpression: prev.rightSideExpression + operation
    }));
  };

  // Validate the right side expression
  const validateExpression = (): { isValid: boolean; error?: string } => {
    try {
      // Replace variable references with dummy values for validation
      let testExpression = formula.rightSideExpression;
      variables.forEach(variable => {
        const regex = new RegExp(`\\[${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
        testExpression = testExpression.replace(regex, '100'); // Use 100 as test value
      });
      
      // Try to evaluate the expression
      new Function('return ' + testExpression)();
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Geçersiz matematiksel ifade' 
      };
    }
  };

  const handleSave = () => {
    if (!formulaName.trim()) {
      alert('Lütfen formül adı girin');
      return;
    }
    
    if (!formula.targetVariable) {
      alert('Lütfen hedef değişken seçin');
      return;
    }
    
    if (!formula.rightSideExpression.trim()) {
      alert('Lütfen karşılaştırma ifadesi girin');
      return;
    }
    
    const validation = validateExpression();
    if (!validation.isValid) {
      alert(`Formül hatası: ${validation.error}`);
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
    setFormula({
      targetVariable: variables[0] || '',
      comparison: '>',
      rightSideExpression: '320'
    });
    setFormulaName('');
    setFormulaColor('#ff4444');
    setFormulaScope('table');
    setSelectedTableId(currentTableId || '');
  };

  if (!isVisible) return null;

  const validation = validateExpression();

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FcCalculator className="mr-3 text-2xl" />
          Excel-tarzı Formül Oluştur
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
        >
          <FcCancel className="w-5 h-5" />
        </button>
      </div>

      {/* Formula Name, Color and Scope */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Formül Adı</label>
          <input
            type="text"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            className="w-full text-base font-medium text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Örn: İletkenlik Kontrol"
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
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kapsam</label>
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
            <option value="table">📊 Bu Tablo</option>
            <option value="workspace">🌐 Tüm Workspace</option>
          </select>
        </div>
      </div>
      
      {/* Table Selection (when scope is table) */}
      {formulaScope === 'table' && (
        <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <label className="block text-sm font-semibold text-purple-700 mb-2">
            Hedef Tablo
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
        </div>
      )}

      {/* Excel-like Formula Builder */}
      <div className="mb-6 p-6 border-2 border-green-200 rounded-lg bg-green-50">
        <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
          <FcCalculator className="mr-2" />
          Excel-tarzı Formül Editörü
        </h4>
        
        {/* Formula Structure Display */}
        <div className="mb-4 p-4 bg-white border border-gray-300 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Formül Yapısı:</div>
          <div className="text-lg font-mono bg-gray-100 p-3 rounded border">
            <span className="text-blue-600 font-bold">[{formula.targetVariable}]</span>
            <span className="text-purple-600 mx-2 font-bold">{formula.comparison}</span>
            <span className="text-green-600 font-bold">{formula.rightSideExpression || '...'}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Otomatik olarak oluşturulan formül: {generateFormulaString()}
          </div>
        </div>

        {/* Target Variable Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Hedef Değişken (Sol Taraf)
            </label>
            <select
              value={formula.targetVariable}
              onChange={(e) => setFormula(prev => ({ ...prev, targetVariable: e.target.value }))}
              className="w-full text-base font-medium text-blue-800 border-2 border-blue-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50"
            >
              {variables.map(variable => (
                <option key={variable} value={variable}>{variable}</option>
              ))}
            </select>
            <div className="text-xs text-gray-600 mt-1">Bu değişkenin değeri kontrol edilecek</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⚖️ Karşılaştırma Operatörü
            </label>
            <select
              value={formula.comparison}
              onChange={(e) => setFormula(prev => ({ ...prev, comparison: e.target.value as any }))}
              className="w-full text-base font-medium text-purple-800 border-2 border-purple-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-purple-50"
            >
              {comparisonOperators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🧮 Değerlendirme Durumu
            </label>
            <div className={`p-3 rounded-lg border-2 ${validation.isValid ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
              {validation.isValid ? (
                <div className="flex items-center text-green-700">
                  <FcOk className="mr-2" />
                  <span className="font-medium">Geçerli formül</span>
                </div>
              ) : (
                <div className="text-red-700 text-sm">
                  <span className="font-medium">Hata:</span> {validation.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Expression Builder */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🧮 Karşılaştırma İfadesi (Sağ Taraf)
          </label>
          <textarea
            value={formula.rightSideExpression}
            onChange={(e) => setFormula(prev => ({ ...prev, rightSideExpression: e.target.value }))}
            className={`w-full h-24 text-lg font-mono border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-200 ${
              validation.isValid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
            }`}
            placeholder="Örn: 320 veya [başka_değişken] * 2 + 100"
          />
          <div className="text-sm text-gray-600 mt-2">
            💡 Sayılar, değişkenler ([değişken_adı]) ve matematik işlemler (+, -, *, /, parantez) kullanabilirsiniz
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Bir değeri alır ve diğeriyle kıyaslar. Büyüktür, küçüktür gibi
            karşılaştırma operatörleri kullanabilirsiniz.
          </p>
        </div>

        {/* Quick Insert Buttons */}
        <div className="mt-4">
          <div className="mb-3">
            <span className="text-sm font-semibold text-gray-700">Hızlı Ekle - Değişkenler:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {variables.slice(0, 6).map(variable => (
                <button
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
                >
                  📊 {variable}
                </button>
              ))}
              {variables.length > 6 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertVariable(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 text-xs border border-blue-300 rounded"
                >
                  <option value="">Diğer değişkenler...</option>
                  {variables.slice(6).map(variable => (
                    <option key={variable} value={variable}>{variable}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-700">Hızlı Ekle - İşlemler:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { op: ' + ', label: 'Toplama' },
                { op: ' - ', label: 'Çıkarma' },
                { op: ' * ', label: 'Çarpma' },
                { op: ' / ', label: 'Bölme' },
                { op: ' ( ', label: '(' },
                { op: ' ) ', label: ')' }
              ].map(({ op, label }) => (
                <button
                  key={op}
                  onClick={() => insertOperation(op)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Example Formulas */}
      <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <h5 className="text-sm font-bold text-yellow-800 mb-2">💡 Örnek Formüller:</h5>
        <div className="space-y-2 text-sm">
          <div>
            <code className="bg-white px-2 py-1 rounded border">[iletkenlik] {'>'} 320</code>
            <span className="text-gray-600 ml-2">- İletkenlik 320'den büyükse</span>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded border">[pH] {`>=`} 6.5 AND [pH] {`<=`} 8.5</code>
            <span className="text-gray-600 ml-2">- pH değeri 6.5-8.5 arasındaysa</span>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded border">[toplam_klor] {'>'} [serbest_klor] * 2</code>
            <span className="text-gray-600 ml-2">- Toplam klor, serbest klorun 2 katından büyükse</span>
          </div>
        </div>
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={!validation.isValid || !formulaName.trim()}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            validation.isValid && formulaName.trim()
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FcOk className="inline mr-2" />
          Formülü Kaydet
        </button>
      </div>
    </div>
  );
} 