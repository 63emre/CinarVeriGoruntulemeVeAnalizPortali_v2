'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FcCalculator, FcCancel, FcOk, FcSettings, FcRules } from 'react-icons/fc';
import { FaPlus, FaRedo, FaFlask, FaBolt, FaDatabase, FaChartPie } from 'react-icons/fa';
import AdvancedColorPalette from './AdvancedColorPalette';
import SegmentManager, { FormulaSegment } from './SegmentManager';

interface OptimizedExcelCellFormulaBuilderProps {
  onSave: (segments: FormulaSegment[], baseVariable: string, baseValue: number, cellFormulaData: any) => void;
  onCancel: () => void;
  isVisible: boolean;
  initialData?: {
    segments?: FormulaSegment[];
    baseVariable?: string;
    baseValue?: number;
  };
}

// Gelişmiş renk paleti - kullanıcı custom renkler ekleyebilir
const EXTENDED_DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F39C12', '#E74C3C',
  '#9B59B6', '#3498DB', '#1ABC9C', '#F1C40F', '#E67E22', '#34495E',
  '#16A085', '#27AE60', '#8E44AD', '#2980B9', '#C0392B', '#D35400'
];

export default function OptimizedExcelCellFormulaBuilder({ 
  onSave, 
  onCancel, 
  isVisible,
  initialData 
}: OptimizedExcelCellFormulaBuilderProps) {
  // Ana state yönetimi
  const [baseVariable, setBaseVariable] = useState(initialData?.baseVariable || 'x');
  const [baseValue, setBaseValue] = useState(initialData?.baseValue || 10);
  const [segments, setSegments] = useState<FormulaSegment[]>(initialData?.segments || []);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  // UI state
  const [cellHeight, setCellHeight] = useState(150);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Formül ekleme/düzenleme state
  const [isAddingFormula, setIsAddingFormula] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [formulaForm, setFormulaForm] = useState({
    name: '',
    expression: '',
    color: EXTENDED_DEFAULT_COLORS[0],
    description: ''
  });
  
  // Gelişmiş özellikler
  const [testResults, setTestResults] = useState<{[key: string]: number}>({});
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [calculationHistory, setCalculationHistory] = useState<any[]>([]);

  // Memoized hesaplamalar
  const totalResult = useMemo(() => {
    return segments.reduce((sum, s) => sum + (s.isValid ? s.result : 0), 0);
  }, [segments]);

  const validSegmentsCount = useMemo(() => {
    return segments.filter(s => s.isValid).length;
  }, [segments]);

  // Gelişmiş ifade doğrulayıcı
  const validateExpression = useCallback((expression: string): { isValid: boolean; error?: string } => {
    if (!expression.trim()) {
      return { isValid: false, error: 'İfade boş olamaz' };
    }

    // Güvenlik kontrolleri
    const dangerousPatterns = [
      /eval\s*\(/i, /Function\s*\(/i, /setTimeout\s*\(/i, /setInterval\s*\(/i,
      /import\s*\(/i, /require\s*\(/i, /process\./i, /global\./i, 
      /window\./i, /document\./i, /alert\s*\(/i, /confirm\s*\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        return { isValid: false, error: 'Güvenlik riski tespit edildi' };
      }
    }

    // Matematiksel fonksiyon kontrolü
    const allowedFunctions = [
      'Math.sqrt', 'Math.pow', 'Math.abs', 'Math.sin', 'Math.cos', 'Math.tan',
      'Math.log', 'Math.exp', 'Math.min', 'Math.max', 'Math.round', 
      'Math.floor', 'Math.ceil', 'Math.PI', 'Math.E'
    ];

    // Test ifadesi oluştur
    try {
      const testExpression = expression.replace(new RegExp(`\\b${baseVariable}\\b`, 'g'), '1');
      
      // Güvenli eval fonksiyonu
      const safeEval = new Function(
        'Math',
        `"use strict"; 
         const sqrt = Math.sqrt, pow = Math.pow, abs = Math.abs;
         const sin = Math.sin, cos = Math.cos, tan = Math.tan;
         const log = Math.log, exp = Math.exp, PI = Math.PI, E = Math.E;
         const min = Math.min, max = Math.max;
         const round = Math.round, floor = Math.floor, ceil = Math.ceil;
         return (${testExpression});`
      );
      
      const result = safeEval(Math);
      
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Geçersiz sayısal sonuç');
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }, [baseVariable]);

  // Gelişmiş hesaplama motoru
  const calculateResults = useCallback(() => {
    const history = {
      timestamp: new Date(),
      baseVariable,
      baseValue,
      segmentCount: segments.length
    };

    const updatedSegments = segments.map(segment => {
      try {
        let expression = segment.expression;
        
        // Base variable değiştir
        const regex = new RegExp(`\\b${baseVariable}\\b`, 'g');
        expression = expression.replace(regex, baseValue.toString());
        
        // Güvenli hesaplama
        const safeEval = new Function(
          'Math',
          `"use strict"; 
           const sqrt = Math.sqrt, pow = Math.pow, abs = Math.abs;
           const sin = Math.sin, cos = Math.cos, tan = Math.tan;
           const log = Math.log, exp = Math.exp, PI = Math.PI, E = Math.E;
           const min = Math.min, max = Math.max;
           const round = Math.round, floor = Math.floor, ceil = Math.ceil;
           return (${expression});`
        );
        
        const result = safeEval(Math);
        
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
          throw new Error('Geçersiz sonuç');
        }

        return {
          ...segment,
          result: Math.max(0, result), // Negatif değerleri önle
          isValid: true,
          error: undefined
        };
      } catch (error) {
        return {
          ...segment,
          result: 0,
          isValid: false,
          error: (error as Error).message
        };
      }
    });

    // Yüzde hesaplamaları
    const validResults = updatedSegments.filter(s => s.isValid && s.result > 0);
    const total = validResults.reduce((sum, segment) => sum + segment.result, 0);
    
    const segmentsWithPercentages = updatedSegments.map(segment => ({
      ...segment,
      percentage: total > 0 && segment.isValid && segment.result > 0 
        ? (segment.result / total) * 100 
        : 0
    }));

    setSegments(segmentsWithPercentages);
    
    // Test modunda sonuçları kaydet
    if (isTestMode) {
      const results: {[key: string]: number} = {};
      segmentsWithPercentages.forEach(segment => {
        results[segment.id] = segment.result;
      });
      setTestResults(results);
    }

    // Hesaplama geçmişine ekle
    setCalculationHistory(prev => [...prev.slice(-9), history]);
  }, [segments, baseValue, baseVariable, isTestMode]);

  // Otomatik hesaplama
  useEffect(() => {
    if (autoCalculate && segments.length > 0) {
      const timeoutId = setTimeout(calculateResults, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [baseValue, baseVariable, autoCalculate, calculateResults]);

  // Segment ekleme/güncelleme
  const handleSaveFormula = useCallback(() => {
    if (!formulaForm.name.trim() || !formulaForm.expression.trim()) {
      alert('Formül adı ve ifadesi gereklidir');
      return;
    }

    const validation = validateExpression(formulaForm.expression);
    if (!validation.isValid) {
      alert(`Geçersiz ifade: ${validation.error}`);
      return;
    }

    if (editingSegmentId) {
      // Güncelleme
      setSegments(prev => prev.map(segment => 
        segment.id === editingSegmentId 
          ? {
              ...segment,
              name: formulaForm.name,
              expression: formulaForm.expression,
              color: formulaForm.color,
              description: formulaForm.description,
              isValid: true,
              error: undefined
            }
          : segment
      ));
    } else {
      // Yeni ekleme
      const newSegment: FormulaSegment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: formulaForm.name,
        expression: formulaForm.expression,
        color: formulaForm.color,
        description: formulaForm.description,
        result: 0,
        percentage: 0,
        isValid: true
      };

      setSegments(prev => [...prev, newSegment]);
    }

    // Formu temizle
    setFormulaForm({
      name: '',
      expression: '',
      color: EXTENDED_DEFAULT_COLORS[segments.length % EXTENDED_DEFAULT_COLORS.length],
      description: ''
    });
    setIsAddingFormula(false);
    setEditingSegmentId(null);
    
    // Otomatik hesapla
    if (autoCalculate) {
      setTimeout(calculateResults, 100);
    }
  }, [formulaForm, editingSegmentId, validateExpression, segments.length, autoCalculate, calculateResults]);

  // Segment düzenleme başlatma
  const handleEditSegment = useCallback((segment: FormulaSegment) => {
    setFormulaForm({
      name: segment.name,
      expression: segment.expression,
      color: segment.color,
      description: segment.description || ''
    });
    setEditingSegmentId(segment.id);
    setIsAddingFormula(true);
  }, []);

  // Custom renk ekleme
  const handleCustomColorAdd = useCallback((color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors(prev => [...prev, color]);
    }
  }, [customColors]);

  // Kaydetme işlemi
  const handleSave = useCallback(() => {
    if (segments.length === 0) {
      alert('En az bir segment eklemelisiniz');
      return;
    }

    const invalidSegments = segments.filter(s => !s.isValid);
    if (invalidSegments.length > 0) {
      const confirmSave = confirm(
        `${invalidSegments.length} geçersiz segment var. Yine de kaydetmek istiyor musunuz?`
      );
      if (!confirmSave) return;
    }
    
    const cellFormulaData = {
      type: 'OPTIMIZED_EXCEL_CELL_FORMULA',
      baseVariable,
      baseValue,
      totalSegments: segments.length,
      validSegments: validSegmentsCount,
      totalResult,
      cellHeight,
      autoCalculate,
      customColors,
      isTestMode,
      version: '2.0',
      createdAt: new Date().toISOString(),
      calculationHistory: calculationHistory.slice(-5) // Son 5 hesaplamayı kaydet
    };

    onSave(segments, baseVariable, baseValue, cellFormulaData);
  }, [segments, baseVariable, baseValue, validSegmentsCount, totalResult, cellHeight, autoCalculate, customColors, isTestMode, calculationHistory, onSave]);

  // Hızlı örnek formüller
  const insertQuickExamples = useCallback(() => {
    const examples = [
      {
        name: 'Doğrusal Büyüme',
        expression: `${baseVariable} * 2.5 + 15`,
        color: EXTENDED_DEFAULT_COLORS[0],
        description: 'Basit doğrusal hesaplama'
      },
      {
        name: 'Karesel Fonksiyon',
        expression: `Math.pow(${baseVariable}, 2) / 2`,
        color: EXTENDED_DEFAULT_COLORS[1],
        description: 'Quadratik büyüme modeli'
      },
      {
        name: 'Karekök Hesabı',
        expression: `Math.sqrt(${baseVariable} + 5) * 8`,
        color: EXTENDED_DEFAULT_COLORS[2],
        description: 'Karekök tabanlı hesaplama'
      },
      {
        name: 'Trigonometrik',
        expression: `Math.abs(Math.sin(${baseVariable} / 10)) * 50`,
        color: EXTENDED_DEFAULT_COLORS[3],
        description: 'Sinüs dalga fonksiyonu'
      }
    ];

    const newSegments = examples.map((example, index) => ({
      id: Date.now().toString() + index + Math.random().toString(36).substr(2, 5),
      ...example,
      result: 0,
      percentage: 0,
      isValid: true
    }));

    setSegments(prev => [...prev, ...newSegments]);
    
    if (autoCalculate) {
      setTimeout(calculateResults, 100);
    }
  }, [baseVariable, autoCalculate, calculateResults]);

  if (!isVisible) return null;

  return (
    <div className="bg-white border-2 border-indigo-300 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcCalculator className="mr-3 text-3xl" />
          Optimize Edilmiş Excel Hücre Formül Builder
          <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">v2.0</span>
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTestMode(!isTestMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
              isTestMode 
                ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <FaFlask />
            <span>{isTestMode ? 'Test Modu AÇIK' : 'Test Modu'}</span>
          </button>
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <FcSettings />
            <span>Ayarlar</span>
          </button>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
          >
            <FcCancel className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Gelişmiş Ayarlar */}
      {showAdvancedSettings && (
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200 rounded-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FcRules className="mr-2" />
            Gelişmiş Konfigürasyon
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Mevcut Değer
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
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hücre Yüksekliği ({cellHeight}px)
              </label>
              <input
                type="range"
                min="100"
                max="400"
                value={cellHeight}
                onChange={(e) => setCellHeight(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span>Otomatik Hesaplama</span>
              </label>
              <button
                onClick={calculateResults}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
              >
                <FaRedo />
                <span>Manuel Hesapla</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              💡 <strong>Ipucu:</strong> Formüllerde "{baseVariable}" kullanın. Mevcut değer: {baseValue}
            </div>
          </div>
        </div>
      )}

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm">Toplam Segment</div>
              <div className="text-2xl font-bold">{segments.length}</div>
            </div>
            <FaDatabase className="text-3xl text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100 text-sm">Geçerli Segment</div>
              <div className="text-2xl font-bold">{validSegmentsCount}</div>
            </div>
            <FaBolt className="text-3xl text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-100 text-sm">Toplam Sonuç</div>
              <div className="text-2xl font-bold font-mono">{totalResult.toFixed(2)}</div>
            </div>
            <FaChartPie className="text-3xl text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-100 text-sm">Hücre Boyutu</div>
              <div className="text-2xl font-bold">{cellHeight}px</div>
            </div>
            <div className="text-3xl text-orange-200">📏</div>
          </div>
        </div>
      </div>

      {/* Segment Yönetimi */}
      <SegmentManager
        segments={segments}
        onSegmentsChange={setSegments}
        selectedSegmentId={selectedSegmentId}
        onSegmentSelect={setSelectedSegmentId}
        onEditSegment={handleEditSegment}
        cellHeight={cellHeight}
        showVisualization={true}
        isTestMode={isTestMode}
        testResults={testResults}
      />

      {/* Formül Ekleme/Düzenleme */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Formül Yönetimi</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsAddingFormula(true);
                setEditingSegmentId(null);
                setFormulaForm({
                  name: '',
                  expression: '',
                  color: EXTENDED_DEFAULT_COLORS[segments.length % EXTENDED_DEFAULT_COLORS.length],
                  description: ''
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <FaPlus />
              <span>Yeni Formül</span>
            </button>
            
            {segments.length === 0 && (
              <button
                onClick={insertQuickExamples}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Örnek Formüller
              </button>
            )}
          </div>
        </div>

        {/* Formül Formu */}
        {isAddingFormula && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <h4 className="text-lg font-bold text-blue-800 mb-4">
              {editingSegmentId ? 'Formül Düzenle' : 'Yeni Formül Ekle'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formül Adı *
                </label>
                <input
                  type="text"
                  value={formulaForm.name}
                  onChange={(e) => setFormulaForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-base text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Örn: Doğrusal Büyüme"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Renk Seçimi
                </label>
                <AdvancedColorPalette
                  selectedColor={formulaForm.color}
                  onColorSelect={(color) => setFormulaForm(prev => ({ ...prev, color }))}
                  onCustomColorAdd={handleCustomColorAdd}
                  customColors={customColors}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Matematiksel İfade *
              </label>
              <input
                type="text"
                value={formulaForm.expression}
                onChange={(e) => setFormulaForm(prev => ({ ...prev, expression: e.target.value }))}
                className="w-full text-base font-mono text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder={`Örn: ${baseVariable} * 2 + 5 veya Math.sqrt(${baseVariable}) * 10`}
              />
              <div className="text-sm text-gray-600 mt-2">
                💡 Kullanılabilir: +, -, *, /, (), Math.sqrt, Math.pow, Math.abs, Math.sin, Math.cos, vb.
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Açıklama (İsteğe Bağlı)
              </label>
              <textarea
                value={formulaForm.description}
                onChange={(e) => setFormulaForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full text-base text-gray-800 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Bu formülün ne yaptığını açıklayın..."
              />
            </div>

            {/* Canlı Önizleme */}
            {formulaForm.expression && (
              <div className="mb-6 p-4 bg-white border-2 border-gray-300 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Canlı Önizleme:</div>
                <div className="font-mono text-sm">
                  {formulaForm.expression.replace(new RegExp(baseVariable, 'g'), baseValue.toString())} = {
                    (() => {
                      try {
                        const validation = validateExpression(formulaForm.expression);
                        if (!validation.isValid) {
                          return <span className="text-red-600 font-bold">❌ {validation.error}</span>;
                        }
                        
                        const testExpr = formulaForm.expression.replace(new RegExp(baseVariable, 'g'), baseValue.toString());
                        const result = new Function('Math', `"use strict"; 
                          const sqrt = Math.sqrt, pow = Math.pow, abs = Math.abs;
                          const sin = Math.sin, cos = Math.cos, tan = Math.tan;
                          const log = Math.log, exp = Math.exp, PI = Math.PI, E = Math.E;
                          const min = Math.min, max = Math.max;
                          const round = Math.round, floor = Math.floor, ceil = Math.ceil;
                          return (${testExpr});`)(Math);
                        
                        return <span className="text-green-600 font-bold">✅ {result.toFixed(4)}</span>;
                      } catch {
                        return <span className="text-red-600 font-bold">❌ Geçersiz İfade</span>;
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
                  setFormulaForm({
                    name: '',
                    expression: '',
                    color: EXTENDED_DEFAULT_COLORS[0],
                    description: ''
                  });
                }}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <FcCancel className="inline mr-2" />
                İptal
              </button>
              <button
                onClick={handleSaveFormula}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FcOk className="inline mr-2" />
                {editingSegmentId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kaydet/İptal Butonları */}
      <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Toplam: {validSegmentsCount}/{segments.length} geçerli segment
        </div>
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          İptal Et
        </button>
        <button
          onClick={handleSave}
          disabled={segments.length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            segments.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FcOk className="inline mr-2" />
          Excel Hücre Formülünü Kaydet ({validSegmentsCount}/{segments.length})
        </button>
      </div>
    </div>
  );
} 