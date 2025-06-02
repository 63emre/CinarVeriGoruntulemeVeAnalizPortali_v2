'use client';

import React, { useState } from 'react';
import { FaPalette, FaPlus, FaTimes, FaEyeDropper, FaStar } from 'react-icons/fa';

interface AdvancedColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onCustomColorAdd?: (color: string) => void;
  customColors?: string[];
}

// Genişletilmiş modern renk paleti - 24 temel renk
const POPULAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F39C12', '#E74C3C',
  '#9B59B6', '#3498DB', '#1ABC9C', '#F1C40F', '#E67E22', '#34495E',
  '#16A085', '#27AE60', '#8E44AD', '#2980B9', '#E67E22', '#C0392B'
];

// Kategorize edilmiş renkler
const COLOR_CATEGORIES = {
  'Kırmızı Tonları': ['#FF6B6B', '#E74C3C', '#C0392B', '#EC7063', '#CD6155'],
  'Mavi Tonları': ['#45B7D1', '#3498DB', '#2980B9', '#5DADE2', '#85C1E9'],
  'Yeşil Tonları': ['#1ABC9C', '#27AE60', '#16A085', '#58D68D', '#82E0AA'],
  'Mor Tonları': ['#9B59B6', '#8E44AD', '#BB8FCE', '#A569BD', '#D7BDE2'],
  'Turuncu Tonları': ['#F39C12', '#E67E22', '#F1C40F', '#F7DC6F', '#FDEAA7'],
  'Gri Tonları': ['#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB']
};

// Popüler renk kombinasyonları
const POPULAR_COMBINATIONS = [
  { name: 'Ocean', colors: ['#45B7D1', '#1ABC9C', '#4ECDC4'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#F39C12', '#FFEAA7'] },
  { name: 'Forest', colors: ['#27AE60', '#16A085', '#96CEB4'] },
  { name: 'Royal', colors: ['#9B59B6', '#8E44AD', '#BB8FCE'] },
  { name: 'Fire', colors: ['#E74C3C', '#F39C12', '#F1C40F'] }
];

export default function AdvancedColorPalette({
  selectedColor,
  onColorSelect,
  onCustomColorAdd,
  customColors = []
}: AdvancedColorPaletteProps) {
  const [showPalette, setShowPalette] = useState(false);
  const [activeTab, setActiveTab] = useState<'popular' | 'categories' | 'combinations' | 'custom'>('popular');
  const [customColorInput, setCustomColorInput] = useState('#');
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Renk seçimi handler
  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    
    // Son kullanılan renkleri güncelle
    const newRecent = [color, ...recentColors.filter(c => c !== color)].slice(0, 8);
    setRecentColors(newRecent);
    
    setShowPalette(false);
  };

  // Custom renk ekleme
  const handleCustomColorAdd = () => {
    if (customColorInput.match(/^#[0-9A-F]{6}$/i)) {
      onCustomColorAdd?.(customColorInput);
      handleColorSelect(customColorInput);
      setCustomColorInput('#');
    }
  };

  // Hex kodundan RGB'ye çevirme
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Rengin açık/koyu olup olmadığını kontrol et
  const isLightColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return false;
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  };

  return (
    <div className="relative">
      {/* Renk Seçici Trigger */}
      <div className="flex items-center space-x-3">
        <div
          onClick={() => setShowPalette(!showPalette)}
          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group"
          style={{ backgroundColor: selectedColor }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
            <FaPalette className={`${isLightColor(selectedColor) ? 'text-gray-800' : 'text-white'} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">Seçilen Renk</div>
          <div className="text-xs text-gray-500 font-mono">{selectedColor.toUpperCase()}</div>
        </div>
        
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
        >
          <FaPalette />
          <span>Palet</span>
        </button>
      </div>

      {/* Gelişmiş Renk Paleti */}
      {showPalette && (
        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 z-50 w-96">
          {/* Başlık */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <FaPalette className="mr-2" />
              Gelişmiş Renk Paleti
            </h3>
            <button
              onClick={() => setShowPalette(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'popular', label: 'Popüler', icon: FaStar },
              { key: 'categories', label: 'Kategoriler', icon: FaPalette },
              { key: 'combinations', label: 'Kombinasyonlar', icon: FaEyeDropper },
              { key: 'custom', label: 'Özel', icon: FaPlus }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Son Kullanılan Renkler */}
          {recentColors.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-600 mb-2">Son Kullanılan</div>
              <div className="flex space-x-1">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                      selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab İçeriği */}
          <div className="max-h-64 overflow-y-auto">
            {/* Popüler Renkler */}
            {activeTab === 'popular' && (
              <div className="grid grid-cols-8 gap-2">
                {POPULAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-lg border-2 hover:scale-110 transition-transform ${
                      selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}

            {/* Kategoriler */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                {Object.entries(COLOR_CATEGORIES).map(([category, colors]) => (
                  <div key={category}>
                    <div className="text-xs font-medium text-gray-600 mb-2">{category}</div>
                    <div className="flex space-x-1">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                            selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Kombinasyonlar */}
            {activeTab === 'combinations' && (
              <div className="space-y-3">
                {POPULAR_COMBINATIONS.map(combo => (
                  <div key={combo.name} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">{combo.name}</div>
                    <div className="flex space-x-1">
                      {combo.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                            selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Özel Renkler */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                {/* Hex Input */}
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Hex Kod Gir</div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#FF6B6B"
                      maxLength={7}
                    />
                    <button
                      onClick={handleCustomColorAdd}
                      disabled={!customColorInput.match(/^#[0-9A-F]{6}$/i)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Renk Seçici</div>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Custom Colors Grid */}
                {customColors.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">Kayıtlı Özel Renkler</div>
                    <div className="grid grid-cols-8 gap-2">
                      {customColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => handleColorSelect(color)}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                            selectedColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Alt Bilgi */}
          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
            💡 Renk seçmek için kutucuklara tıklayın
          </div>
        </div>
      )}
    </div>
  );
} 