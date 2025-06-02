'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BoxColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  customColors?: string[];
  onCustomColorAdd?: (color: string) => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Önceden tanımlanmış renk paleti - kutucuk şeklinde
const PREDEFINED_COLORS = [
  // İlk satır - Temel renkler
  '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF00', '#00CED1',
  // İkinci satır - Mavi tonları
  '#0000FF', '#4169E1', '#1E90FF', '#87CEEB', '#87CEFA', '#B0E0E6', '#ADD8E6', '#F0F8FF',
  // Üçüncü satır - Mor ve pembe tonları
  '#8A2BE2', '#9400D3', '#9932CC', '#BA55D3', '#DA70D6', '#EE82EE', '#DDA0DD', '#FFB6C1',
  // Dördüncü satır - Yeşil tonları
  '#006400', '#008000', '#228B22', '#32CD32', '#90EE90', '#98FB98', '#00FF7F', '#00FA9A',
  // Beşinci satır - Kahverengi ve gri tonları
  '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3',
  // Altıncı satır - Koyu renkler
  '#000000', '#2F4F4F', '#696969', '#778899', '#708090', '#2E2E2E', '#1C1C1C', '#0E0E0E'
];

// ESC key handler hook
function useEscapeKey(callback: () => void) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
}

// Click outside handler hook  
function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

export default function BoxColorPicker({
  selectedColor,
  onColorSelect,
  customColors = [],
  onCustomColorAdd,
  position = 'bottom'
}: BoxColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const pickerRef = React.useRef<HTMLDivElement>(null);
  
  // Close picker on ESC or click outside
  useEscapeKey(() => setIsOpen(false));
  useClickOutside(pickerRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsOpen(false);
  };

  const handleCustomColorAdd = () => {
    const color = customColorInput.trim();
    if (color && color.match(/^#[0-9A-F]{6}$/i)) {
      onCustomColorAdd?.(color);
      handleColorSelect(color);
      setCustomColorInput('');
    }
  };

  const handleCustomColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    setCustomColorInput(value);
  };

  const getContrastText = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const ColorPicker = () => (
    <div
      ref={pickerRef}
      className="bg-white border-2 border-gray-300 rounded-xl shadow-2xl p-4 z-[10000] min-w-[320px]"
    >
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          🎨 Renk Seçici
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Seçili renk göstergesi */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Seçili Renk</div>
            <div className="text-xs text-gray-500 font-mono">{selectedColor.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Önceden tanımlanmış renk kutuları */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Hazır Renkler</div>
        <div className="grid grid-cols-8 gap-2">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                selectedColor === color 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Özel renk ekleme */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Özel Renk</div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customColorInput}
            onChange={handleCustomColorInputChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#FF6B6B"
            maxLength={7}
          />
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setCustomColorInput(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
          <button
            onClick={handleCustomColorAdd}
            disabled={!customColorInput.match(/^#[0-9A-F]{6}$/i)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ➕
          </button>
        </div>
      </div>

      {/* Kullanıcı tanımlı renkler */}
      {customColors.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Kayıtlı Özel Renkler</div>
          <div className="grid grid-cols-8 gap-2">
            {customColors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                  selectedColor === color 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alt bilgi */}
      <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-3">
        💡 ESC tuşu veya dışarı tıklayarak kapatabilirsiniz
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Renk seçici tetikleyici butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm font-medium text-gray-700">{selectedColor.toUpperCase()}</span>
        <span className="text-gray-400">▼</span>
      </button>

      {/* Portal için renk seçici */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-25">
          <ColorPicker />
        </div>,
        document.body
      )}
    </div>
  );
} 