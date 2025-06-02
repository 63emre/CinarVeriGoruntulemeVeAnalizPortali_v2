'use client';

import React, { useState, useCallback } from 'react';
import { FaEdit, FaTrash, FaCopy, FaArrowUp, FaArrowDown, FaEye, FaChartPie, FaCalculator } from 'react-icons/fa';
import { FcOk, FcCancel } from 'react-icons/fc';

export interface FormulaSegment {
  id: string;
  name: string;
  expression: string;
  color: string;
  description?: string;
  result: number;
  percentage: number;
  isValid: boolean;
  error?: string;
}

interface SegmentManagerProps {
  segments: FormulaSegment[];
  onSegmentsChange: (segments: FormulaSegment[]) => void;
  selectedSegmentId: string | null;
  onSegmentSelect: (id: string | null) => void;
  onEditSegment: (segment: FormulaSegment) => void;
  cellHeight: number;
  showVisualization?: boolean;
  isTestMode?: boolean;
  testResults?: { [key: string]: number };
}

export default function SegmentManager({
  segments,
  onSegmentsChange,
  selectedSegmentId,
  onSegmentSelect,
  onEditSegment,
  cellHeight,
  showVisualization = true,
  isTestMode = false,
  testResults = {}
}: SegmentManagerProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Segment silme
  const handleDeleteSegment = useCallback((segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment && confirm(`"${segment.name}" segmentini silmek istediğinizden emin misiniz?`)) {
      const newSegments = segments.filter(s => s.id !== segmentId);
      onSegmentsChange(newSegments);
      
      if (selectedSegmentId === segmentId) {
        onSegmentSelect(null);
      }
    }
  }, [segments, selectedSegmentId, onSegmentsChange, onSegmentSelect]);

  // Segment kopyalama
  const handleDuplicateSegment = useCallback((segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      const duplicatedSegment: FormulaSegment = {
        ...segment,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: `${segment.name} (Kopya)`,
      };
      
      const newSegments = [...segments, duplicatedSegment];
      onSegmentsChange(newSegments);
    }
  }, [segments, onSegmentsChange]);

  // Segment yukarı taşıma
  const moveSegmentUp = useCallback((segmentId: string) => {
    const index = segments.findIndex(s => s.id === segmentId);
    if (index > 0) {
      const newSegments = [...segments];
      [newSegments[index], newSegments[index - 1]] = [newSegments[index - 1], newSegments[index]];
      onSegmentsChange(newSegments);
    }
  }, [segments, onSegmentsChange]);

  // Segment aşağı taşıma
  const moveSegmentDown = useCallback((segmentId: string) => {
    const index = segments.findIndex(s => s.id === segmentId);
    if (index < segments.length - 1) {
      const newSegments = [...segments];
      [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
      onSegmentsChange(newSegments);
    }
  }, [segments, onSegmentsChange]);

  // Toplam sonuç hesaplama
  const totalResult = segments.reduce((sum, s) => sum + (s.isValid ? s.result : 0), 0);
  const validSegments = segments.filter(s => s.isValid);

  if (segments.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <FaChartPie className="mx-auto text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Henüz Segment Eklenmedi</h3>
        <p className="text-gray-500">Formül segmentleri ekleyerek başlayın</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Excel Cell Görselleştirmesi */}
      {showVisualization && (
        <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-gray-100 to-blue-50 px-4 py-3 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <FaChartPie className="mr-2" />
                Excel Hücre Görselleştirmesi
              </h3>
              {isTestMode && (
                <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                  🧪 Test Modu Aktif
                </span>
              )}
            </div>
          </div>
          
          <div 
            className="flex relative bg-white"
            style={{ height: `${cellHeight}px` }}
          >
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedSegmentId === segment.id 
                    ? 'ring-4 ring-blue-400 ring-opacity-60 z-10' 
                    : 'hover:brightness-110'
                } ${
                  !segment.isValid ? 'opacity-50' : ''
                }`}
                style={{
                  width: `${Math.max(segment.percentage, 0.5)}%`,
                  backgroundColor: segment.color,
                  minWidth: '20px',
                  borderRight: index < segments.length - 1 ? '2px solid rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => onSegmentSelect(segment.id)}
                onMouseEnter={() => setHoveredSegment(segment.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {/* Segment İçeriği */}
                <div className="h-full flex flex-col justify-center items-center text-white text-xs font-bold p-2">
                  <div className="truncate w-full text-center text-shadow">
                    {segment.name}
                  </div>
                  <div className="text-xs opacity-90 text-shadow">
                    {segment.isValid ? segment.result.toFixed(1) : 'HATA'}
                  </div>
                  <div className="text-xs opacity-80 text-shadow">
                    {segment.percentage.toFixed(1)}%
                  </div>
                  {isTestMode && testResults[segment.id] !== undefined && (
                    <div className="text-xs bg-black bg-opacity-30 rounded px-1 mt-1">
                      T: {testResults[segment.id].toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Gelişmiş Hover Tooltip */}
                {hoveredSegment === segment.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap max-w-sm shadow-xl">
                    <div className="font-bold text-blue-300">{segment.name}</div>
                    <div className="mt-1">📝 İfade: <span className="font-mono">{segment.expression}</span></div>
                    <div>📊 Sonuç: <span className="font-mono">{segment.isValid ? segment.result.toFixed(4) : 'Geçersiz'}</span></div>
                    <div>📈 Yüzde: <span className="font-mono">{segment.percentage.toFixed(2)}%</span></div>
                    <div>🎨 Renk: <span className="font-mono">{segment.color}</span></div>
                    {segment.description && (
                      <div className="mt-1 text-blue-200">💡 {segment.description}</div>
                    )}
                    {segment.error && (
                      <div className="mt-1 text-red-300">❌ Hata: {segment.error}</div>
                    )}
                    
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}

                {/* Hover Butonları */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSegment(segment);
                    }}
                    className="w-7 h-7 bg-white text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-50 shadow-md transition-colors"
                    title="Düzenle"
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSegment(segment.id);
                    }}
                    className="w-7 h-7 bg-white text-green-600 rounded-full flex items-center justify-center hover:bg-green-50 shadow-md transition-colors"
                    title="Kopyala"
                  >
                    <FaCopy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSegment(segment.id);
                    }}
                    className="w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-50 shadow-md transition-colors"
                    title="Sil"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                {/* Hata İndikatörü */}
                {!segment.isValid && (
                  <div className="absolute top-2 left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" 
                       title={segment.error}>
                    !
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Alt Bilgi Paneli */}
          <div className="bg-gradient-to-r from-gray-100 to-blue-50 px-4 py-3 border-t border-gray-300">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4 text-gray-700">
                <div className="flex items-center">
                  <FaCalculator className="mr-1" />
                  <span className="font-mono">{totalResult.toFixed(2)}</span>
                </div>
                <div>|</div>
                <div>
                  <span className="font-medium">{segments.length}</span> segment 
                  (<span className="text-green-600 font-medium">{validSegments.length}</span> geçerli)
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Segmentlere tıklayarak seçin ve düzenleyin
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segment Listesi */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 px-4 py-3 border-b border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <FaEye className="mr-2" />
            Segment Listesi ({segments.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedSegmentId === segment.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              } ${
                !segment.isValid ? 'bg-red-50' : ''
              }`}
              onClick={() => onSegmentSelect(segment.id)}
            >
              {/* Sol Taraf - Bilgiler */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Sıralama Butonları */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSegmentUp(segment.id);
                    }}
                    disabled={index === 0}
                    className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                      index === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-200 cursor-pointer'
                    }`}
                    title="Yukarı Taşı"
                  >
                    <FaArrowUp size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSegmentDown(segment.id);
                    }}
                    disabled={index === segments.length - 1}
                    className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                      index === segments.length - 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-200 cursor-pointer'
                    }`}
                    title="Aşağı Taşı"
                  >
                    <FaArrowDown size={10} />
                  </button>
                </div>

                {/* Renk */}
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: segment.color }}
                ></div>

                {/* Bilgiler */}
                <div className="flex-1">
                  <div className="font-medium text-gray-800 flex items-center">
                    {segment.name}
                    {!segment.isValid && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                        Geçersiz
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-mono text-gray-600 mt-1">{segment.expression}</div>
                  {segment.description && (
                    <div className="text-xs text-gray-500 mt-1">{segment.description}</div>
                  )}
                  {segment.error && (
                    <div className="text-xs text-red-600 mt-1">❌ {segment.error}</div>
                  )}
                </div>
              </div>

              {/* Sağ Taraf - Sonuçlar ve Butonlar */}
              <div className="flex items-center space-x-4">
                {/* Sonuçlar */}
                <div className="text-sm text-gray-600 text-right">
                  <div>
                    Sonuç: <span className="font-mono font-medium">
                      {segment.isValid ? segment.result.toFixed(4) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    Pay: <span className="font-mono font-medium">
                      {segment.percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* İşlem Butonları */}
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSegment(segment);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSegment(segment.id);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Kopyala"
                  >
                    <FaCopy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSegment(segment.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 