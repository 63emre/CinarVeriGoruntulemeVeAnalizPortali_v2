'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FcCalculator, FcPlus, FcCancel, FcOk, FcRules, FcDeleteDatabase } from 'react-icons/fc';
import { FaEdit, FaTrash, FaEye, FaPlus, FaPalette } from 'react-icons/fa';

interface FormulaSegment {
  id: string;
  name: string;
  expression: string;
  color: string;
  description?: string;
  result: number;
  percentage: number;
}

interface ExcelCellFormulaBuilderProps {
  onSave: (segments: FormulaSegment[], baseVariable: string, baseValue: number) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function ExcelCellFormulaBuilder({ 
  onSave, 
  onCancel, 
  isVisible 
}: ExcelCellFormulaBuilderProps) {
  const [baseVariable, setBaseVariable] = useState('x');
  const [baseValue, setBaseValue] = useState(10);
  const [segments, setSegments] = useState<FormulaSegment[]>([]);
  const [isAddingFormula, setIsAddingFormula] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  
  // New formula form state
  const [newFormula, setNewFormula] = useState({
    name: '',
    expression: '',
    color: DEFAULT_COLORS[0],
    description: ''
  });

  // Calculate results and percentages when base value or segments change
  const calculateResults = useCallback(() => {
    const updatedSegments = segments.map(segment => {
      try {
        // Replace the base variable with actual value
        const expression = segment.expression.replace(/x/g, baseValue.toString());
        
        // Evaluate the expression safely
        const result = Function('"use strict"; return (' + expression + ')')();
        
        return {
          ...segment,
          result: typeof result === 'number' && !isNaN(result) ? Math.max(0, result) : 0
        };
      } catch (error) {
        return {
          ...segment,
          result: 0
        };
      }
    });

    // Calculate total and percentages
    const total = updatedSegments.reduce((sum, segment) => sum + segment.result, 0);
    
    const segmentsWithPercentages = updatedSegments.map(segment => ({
      ...segment,
      percentage: total > 0 ? (segment.result / total) * 100 : 0
    }));

    setSegments(segmentsWithPercentages);
  }, [segments, baseValue]);

  // Recalculate when base value changes
  useEffect(() => {
    calculateResults();
  }, [baseValue]);

  // Recalculate when segments change (but avoid infinite loop)
  useEffect(() => {
    if (segments.length > 0) {
      const hasUnprocessedResults = segments.some(s => s.result === undefined);
      if (hasUnprocessedResults) {
        calculateResults();
      }
    }
  }, [segments.length]);

  const handleAddFormula = () => {
    if (!newFormula.name.trim() || !newFormula.expression.trim()) {
      alert('Lütfen formül adı ve ifadesi girin');
      return;
    }

    // Test the expression
    try {
      const testExpression = newFormula.expression.replace(/x/g, '1');
      const testResult = Function('"use strict"; return (' + testExpression + ')')();
      
      if (typeof testResult !== 'number' || isNaN(testResult)) {
        throw new Error('Geçersiz sonuç');
      }
    } catch (error) {
      alert('Geçersiz matematiksel ifade. Lütfen kontrol edin.');
      return;
    }

    const newSegment: FormulaSegment = {
      id: Date.now().toString(),
      name: newFormula.name,
      expression: newFormula.expression,
      color: newFormula.color,
      description: newFormula.description,
      result: 0,
      percentage: 0
    };

    setSegments(prev => [...prev, newSegment]);
    
    // Reset form
    setNewFormula({
      name: '',
      expression: '',
      color: DEFAULT_COLORS[(segments.length + 1) % DEFAULT_COLORS.length],
      description: ''
    });
    setIsAddingFormula(false);
  };

  const handleEditSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      setNewFormula({
        name: segment.name,
        expression: segment.expression,
        color: segment.color,
        description: segment.description || ''
      });
      setEditingSegmentId(segmentId);
      setIsAddingFormula(true);
    }
  };

  const handleUpdateSegment = () => {
    if (!editingSegmentId || !newFormula.name.trim() || !newFormula.expression.trim()) {
      alert('Lütfen formül adı ve ifadesi girin');
      return;
    }

    // Test the expression
    try {
      const testExpression = newFormula.expression.replace(/x/g, '1');
      const testResult = Function('"use strict"; return (' + testExpression + ')')();
      
      if (typeof testResult !== 'number' || isNaN(testResult)) {
        throw new Error('Geçersiz sonuç');
      }
    } catch (error) {
      alert('Geçersiz matematiksel ifade. Lütfen kontrol edin.');
      return;
    }

    setSegments(prev => prev.map(segment => 
      segment.id === editingSegmentId 
        ? {
            ...segment,
            name: newFormula.name,
            expression: newFormula.expression,
            color: newFormula.color,
            description: newFormula.description
          }
        : segment
    ));

    // Reset form
    setNewFormula({
      name: '',
      expression: '',
      color: DEFAULT_COLORS[0],
      description: ''
    });
    setEditingSegmentId(null);
    setIsAddingFormula(false);
  };

  const handleDeleteSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment && confirm(`&quot;${segment.name}&quot; formülünü silmek istediğinize emin misiniz?`)) {
      setSegments(prev => prev.filter(s => s.id !== segmentId));
    }
  };

  const handleSave = () => {
    if (segments.length === 0) {
      alert('En az bir formül segment eklemelisiniz');
      return;
    }
    
    onSave(segments, baseVariable, baseValue);
  };

  const clearAllFormulas = () => {
    if (confirm('Tüm formülleri temizlemek istediğinize emin misiniz?')) {
      setSegments([]);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcCalculator className="mr-3 text-3xl" />
          Excel Hücre Formül Oluşturucu
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
        >
          <FcCancel className="w-6 h-6" />
        </button>
      </div>

      {/* Base Variable Section */}
      <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <FcRules className="mr-2" />
          Ana Değişken
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Değişken Adı
            </label>
            <input
              type="text"
              value={baseVariable}
              onChange={(e) => setBaseVariable(e.target.value)}
              className="w-full text-base font-mono text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="x"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Güncel Değer
            </label>
            <input
              type="number"
              step="0.1"
              value={baseValue}
              onChange={(e) => setBaseValue(parseFloat(e.target.value) || 0)}
              className="w-full text-base font-mono text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="10"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          💡 Formüllerde &quot;{baseVariable}&quot; yerine {baseValue} değeri kullanılacak. Değer değiştirildiğinde tüm hesaplamalar güncellenir.
        </div>
      </div>

      {/* Excel Cell Visualization */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <FaPalette className="mr-2" />
          Hücre Görünümü
        </h4>
        
        {segments.length > 0 ? (
          <div className="border-4 border-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="flex h-24 relative">
              {segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className="relative group cursor-pointer transition-all duration-300 hover:brightness-110"
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: segment.color,
                    minWidth: '20px'
                  }}
                  title={`${segment.name}: ${segment.result.toFixed(2)} (${segment.percentage.toFixed(1)}%)`}
                >
                  {/* Content */}
                  <div className="h-full flex flex-col justify-center items-center text-white text-xs font-bold p-1">
                    <div className="truncate w-full text-center">
                      {segment.name}
                    </div>
                    <div className="text-xs opacity-90">
                      {segment.result.toFixed(1)}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    <div className="font-bold">{segment.name}</div>
                    <div>İfade: {segment.expression}</div>
                    <div>Sonuç: {segment.result.toFixed(2)}</div>
                    <div>Oran: {segment.percentage.toFixed(1)}%</div>
                    {segment.description && <div>Not: {segment.description}</div>}
                    
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>

                  {/* Edit/Delete buttons on hover */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSegment(segment.id);
                      }}
                      className="w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-50 text-xs"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSegment(segment.id);
                      }}
                      className="w-5 h-5 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-50 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Segment separators */}
                  {index < segments.length - 1 && (
                    <div className="absolute right-0 top-0 h-full w-0.5 bg-gray-800"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Cell Info */}
            <div className="bg-gray-100 p-2 text-xs text-gray-600 border-t">
              Toplam: {segments.reduce((sum, s) => sum + s.result, 0).toFixed(2)} | 
              Segment Sayısı: {segments.length} |
              Taban Değer: {baseVariable} = {baseValue}
            </div>
          </div>
        ) : (
          <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FcPlus className="mx-auto text-4xl mb-4" />
            <p className="text-gray-500 text-lg">Henüz formül eklenmedi</p>
            <p className="text-gray-400 text-sm">Aşağıdaki &quot;+ Formül Ekle&quot; butonunu kullanın</p>
          </div>
        )}
      </div>

      {/* Add/Edit Formula Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-800">Formül Yönetimi</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsAddingFormula(true);
                setEditingSegmentId(null);
                setNewFormula({
                  name: '',
                  expression: '',
                  color: DEFAULT_COLORS[segments.length % DEFAULT_COLORS.length],
                  description: ''
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <FaPlus className="mr-2" />
              Formül Ekle
            </button>
            {segments.length > 0 && (
              <button
                onClick={clearAllFormulas}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
              >
                <FcDeleteDatabase className="mr-2" />
                Tümünü Temizle
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {isAddingFormula && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h5 className="text-md font-bold text-blue-800 mb-4">
              {editingSegmentId ? 'Formül Düzenle' : 'Yeni Formül Ekle'}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formül Adı *
                </label>
                <input
                  type="text"
                  value={newFormula.name}
                  onChange={(e) => setNewFormula(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-base text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Örn: Çarpan İşlem"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Renk
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newFormula.color}
                    onChange={(e) => setNewFormula(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex space-x-1">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewFormula(prev => ({ ...prev, color }))}
                        className={`w-6 h-6 rounded border-2 ${newFormula.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Matematiksel İfade *
              </label>
              <input
                type="text"
                value={newFormula.expression}
                onChange={(e) => setNewFormula(prev => ({ ...prev, expression: e.target.value }))}
                className="w-full text-base font-mono text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder={`Örn: ${baseVariable} * 2 + 5`}
              />
              <div className="text-sm text-gray-600 mt-1">
                💡 &quot;{baseVariable}&quot; kullanarak ana değişkeni referans alın. +, -, *, /, ( ) işlemleri desteklenir.
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Açıklama (Opsiyonel)
              </label>
              <input
                type="text"
                value={newFormula.description}
                onChange={(e) => setNewFormula(prev => ({ ...prev, description: e.target.value }))}
                className="w-full text-base text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Bu formülün ne yaptığını açıklayın..."
              />
            </div>

            {/* Preview */}
            {newFormula.expression && (
              <div className="mb-4 p-3 bg-white border border-gray-300 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Önizleme:</div>
                <div className="font-mono text-sm">
                  {newFormula.expression.replace(new RegExp(baseVariable, 'g'), baseValue.toString())} = {
                    (() => {
                      try {
                        const result = Function('"use strict"; return (' + newFormula.expression.replace(new RegExp(baseVariable, 'g'), baseValue.toString()) + ')')();
                        return typeof result === 'number' && !isNaN(result) ? result.toFixed(2) : 'Hata';
                      } catch {
                        return 'Geçersiz İfade';
                      }
                    })()
                  }
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingFormula(false);
                  setEditingSegmentId(null);
                  setNewFormula({
                    name: '',
                    expression: '',
                    color: DEFAULT_COLORS[0],
                    description: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={editingSegmentId ? handleUpdateSegment : handleAddFormula}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {editingSegmentId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Formula List */}
      {segments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-3">Formül Listesi</h4>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-800">{segment.name}</div>
                    <div className="text-sm font-mono text-gray-600">{segment.expression}</div>
                    {segment.description && (
                      <div className="text-xs text-gray-500">{segment.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    <div>Sonuç: <span className="font-mono">{segment.result.toFixed(2)}</span></div>
                    <div>Oran: <span className="font-mono">{segment.percentage.toFixed(1)}%</span></div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditSegment(segment.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(segment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example Formulas */}
      <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <h5 className="text-sm font-bold text-yellow-800 mb-2">💡 Örnek Formüller:</h5>
        <div className="space-y-2 text-sm">
          <div>
            <code className="bg-white px-2 py-1 rounded border">{baseVariable} * 2</code>
            <span className="text-gray-600 ml-2">- Ana değişkenin 2 katı</span>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded border">{baseVariable} / 3 + 5</code>
            <span className="text-gray-600 ml-2">- Ana değişkeni 3&apos;e böl, 5 ekle</span>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded border">({baseVariable} + 10) * 1.5</code>
            <span className="text-gray-600 ml-2">- Ana değişkene 10 ekle, 1.5 ile çarp</span>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded border">Math.sqrt({baseVariable})</code>
            <span className="text-gray-600 ml-2">- Ana değişkenin karekökü</span>
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
          disabled={segments.length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            segments.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FcOk className="inline mr-2" />
          Hücre Formülünü Kaydet
        </button>
      </div>
    </div>
  );
} 