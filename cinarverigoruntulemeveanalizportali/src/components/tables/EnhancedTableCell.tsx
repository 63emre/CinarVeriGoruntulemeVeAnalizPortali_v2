import React, { useState, useMemo } from 'react';

// Local helper function to process table cell values
function processTableCellValue(value: string | number | null): {
  displayValue: string;
  numericValue: number | null;
  isLimitValue: boolean;
  originalValue: string | number | null;
} {
  if (value === null || value === undefined) {
    return { displayValue: '', numericValue: null, isLimitValue: false, originalValue: value };
  }
  
  const stringValue = String(value).trim();
  
  // Check for limit values like "<0.001", ">1000" etc.
  const limitMatch = stringValue.match(/^(<|>|<=|>=)\s*(\d+(?:\.\d+)?)/);
  if (limitMatch) {
    const numericPart = parseFloat(limitMatch[2]);
    return {
      displayValue: stringValue,
      numericValue: numericPart,
      isLimitValue: true,
      originalValue: value
    };
  }
  
  // Try to parse as number
  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue)) {
    return {
      displayValue: stringValue,
      numericValue: numericValue,
      isLimitValue: false,
      originalValue: value
    };
  }
  
  // Return as string
  return {
    displayValue: stringValue,
    numericValue: null,
    isLimitValue: false,
    originalValue: value
  };
}

interface FormulaDetail {
  id: string;
  name: string;
  formula: string;
  leftResult?: number;
  rightResult?: number;
  color: string;
}

interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
  formulaIds?: string[]; // IDs of formulas that triggered the highlight
  formulaDetails?: FormulaDetail[];
}

interface EnhancedTableCellProps {
  rowId: string;
  colId: string;
  value: string | number | null;
  highlights?: HighlightedCell[];
  onClick?: (rowId: string, colId: string, value: string | number | null) => void;
  isSelected?: boolean;
  showDataTypes?: boolean;
  cellBorderWidth?: number;
}

export default function EnhancedTableCell({ 
  rowId, 
  colId, 
  value, 
  highlights = [],
  onClick,
  isSelected = false,
  showDataTypes = true,
  cellBorderWidth = 2
}: EnhancedTableCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Gelişmiş veri işleme
  const processedValue = useMemo(() => {
    return processTableCellValue(value);
  }, [value]);
  
  // OPTIMIZED: Memoize cell highlights calculation
  const cellHighlights = useMemo(() => 
    highlights.filter(h => h.row === rowId && h.col === colId),
    [highlights, rowId, colId]
  );
  
  // OPTIMIZED: Memoize cell style calculation  
  const cellStyle = useMemo((): React.CSSProperties => {
    // Temel stil - kalın kenarlık
    const baseStyle: React.CSSProperties = {
      border: `${cellBorderWidth}px solid #d1d5db`,
      transition: 'all 0.15s ease-in-out',
      position: 'relative'
    };

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#e3f2fd',
        fontWeight: 'bold',
        border: `${cellBorderWidth}px solid #1976d2`
      };
    }

    if (cellHighlights.length === 0) {
      return baseStyle;
    }

    if (cellHighlights.length === 1) {
      const highlight = cellHighlights[0];
      return {
        ...baseStyle,
        backgroundColor: highlight.color + '40', // Lighter for better performance
        color: '#000',
        fontWeight: 'bold',
        border: `${cellBorderWidth * 1.5}px solid ${highlight.color}`,
        boxShadow: `0 0 8px ${highlight.color}40`
      };
    }

    // Multiple highlights - optimized pizza slice effect
    const formulaColors: string[] = [];
    
    cellHighlights.forEach(highlight => {
      if (highlight.formulaDetails && highlight.formulaDetails.length > 0) {
        highlight.formulaDetails.forEach(detail => {
          if (detail.color) {
            formulaColors.push(detail.color);
          }
        });
      } else {
        const cleanColor = highlight.color.startsWith('#') ? highlight.color : `#${highlight.color}`;
        formulaColors.push(cleanColor);
      }
    });
    
    // Create symmetric pizza slices
    const totalSlices = formulaColors.length;
    const sliceAngle = 360 / totalSlices;
    const gradientStops: string[] = [];
    
    formulaColors.forEach((color, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      gradientStops.push(`${color} ${startAngle}deg ${endAngle}deg`);
    });
    
    const conicGradient = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    
    return {
      ...baseStyle,
      background: conicGradient,
      border: `${cellBorderWidth * 2}px solid #333`,
      borderRadius: totalSlices > 2 ? '8px' : '3px',
      fontWeight: 'bold',
      color: '#000000',
      textShadow: '1px 1px 1px rgba(255,255,255,0.7)',
      boxShadow: '0 0 8px rgba(0,0,0,0.3)',
      transform: 'scale(1.02)',
      zIndex: 5,
    };
  }, [cellHighlights, isSelected, cellBorderWidth]);

  // Veri tipini belirleme
  const getDataTypeInfo = () => {
    if (!showDataTypes) return null;
    
    const { isLimitValue, numericValue, displayValue } = processedValue;
    
    if (isLimitValue) {
      return {
        type: 'limit',
        icon: '📉',
        description: 'Limit değer (< ile başlayan)'
      };
    } else if (numericValue !== null) {
      return {
        type: 'numeric',
        icon: '🔢',
        description: `Sayısal değer: ${numericValue}`
      };
    } else if (displayValue && displayValue.trim() !== '') {
      return {
        type: 'text',
        icon: '📝',
        description: 'Metin değer'
      };
    } else {
      return {
        type: 'empty',
        icon: '⬜',
        description: 'Boş değer'
      };
    }
  };

  // Handle mouse events
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (cellHighlights.length > 0 || showDataTypes) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      setTooltipPosition({
        x: rect.left + scrollX + rect.width / 2,
        y: rect.top + scrollY - 10
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // OPTIMIZED: Enhanced tooltip content
  const getTooltipContent = () => {
    if (!showTooltip) return null;

    const dataTypeInfo = getDataTypeInfo();

    return (
      <div className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg py-3 px-4 shadow-xl border border-gray-700 min-w-[220px] max-w-[400px]"
           style={{
             left: `${tooltipPosition.x}px`,
             top: `${tooltipPosition.y}px`,
             transform: 'translate(-50%, -100%)',
           }}>
        
        {/* Veri Tipi Bilgisi */}
        {dataTypeInfo && (
          <div className="mb-3 p-2 bg-gray-800 rounded border border-gray-600">
            <div className="flex items-center justify-between font-bold mb-1 text-blue-300">
              <span className="text-xs">Veri Tipi</span>
              <span className="text-lg">{dataTypeInfo.icon}</span>
            </div>
            <div className="text-xs text-gray-300">{dataTypeInfo.description}</div>
            
            {/* Orijinal ve işlenmiş değeri göster */}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-400">Orijinal: </span>
                  <span className="font-mono text-green-300">
                    {String(processedValue.originalValue || 'boş')}
                  </span>
                </div>
                <div>
                  <span className="text-blue-400">Görüntü: </span>
                  <span className="font-mono text-green-300">
                    {processedValue.displayValue || 'boş'}
                  </span>
                </div>
              </div>
              
              {processedValue.numericValue !== null && (
                <div className="mt-1">
                  <span className="text-blue-400">Sayısal: </span>
                  <span className="font-mono text-green-300">
                    {processedValue.numericValue.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formül Bilgileri */}
        {cellHighlights.length > 0 && (
          <div>
            <div className="flex items-center justify-between font-bold mb-2 text-blue-300">
              <span className="text-xs">
                {cellHighlights.length === 1 ? 'Aktif Formül' : `${cellHighlights.length} Aktif Formül`}
              </span>
              {cellHighlights.length > 1 && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-400"
                  style={{
                    background: cellStyle.background
                  }}
                />
              )}
            </div>
            
            <div className="space-y-2">
              {cellHighlights.flatMap((highlight, highlightIdx) => 
                highlight.formulaDetails?.map((formulaDetail, detailIdx) => (
                  <div key={`formula-${highlightIdx}-${detailIdx}`} 
                       className="border-l-2 pl-2 py-1 bg-gray-800 rounded-r" 
                       style={{ borderColor: formulaDetail.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1 border border-gray-400" 
                          style={{ backgroundColor: formulaDetail.color }}
                        />
                        <span className="font-medium text-yellow-300 text-xs">{formulaDetail.name}</span>
                      </div>
                    </div>
                    
                    {(formulaDetail.leftResult !== undefined || formulaDetail.rightResult !== undefined) && (
                      <div className="text-xs ml-3 text-gray-300 mt-1">
                        <div className="grid grid-cols-2 gap-1 bg-gray-900 p-1 rounded text-xs">
                          <div className="text-center">
                            <span className="text-blue-400">Sol: </span>
                            <span className="font-mono text-green-300">
                              {formulaDetail.leftResult?.toFixed(2) || 'N/A'}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-blue-400">Sağ: </span>
                            <span className="font-mono text-green-300">
                              {formulaDetail.rightResult?.toFixed(2) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )) || [
                  <div key={`highlight-${highlightIdx}`} 
                       className="border-l-2 pl-2 py-1 bg-gray-800 rounded-r" 
                       style={{ borderColor: highlight.color }}>
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-1 border border-gray-400" 
                        style={{ backgroundColor: highlight.color }}
                      />
                      <span className="font-medium text-yellow-300 text-xs">{highlight.message}</span>
                    </div>
                  </div>
                ]
              )}
            </div>
          </div>
        )}
        
        {/* Hücre Bilgileri */}
        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Hücre: {colId}[{rowId}]</span>
            <span>Değer: {processedValue.displayValue}</span>
          </div>
          {cellHighlights.length > 1 && (
            <div className="text-yellow-400 mt-1 text-xs">
              🍕 {cellHighlights.length} formül aktif (çoklu vurgulama)
            </div>
          )}
        </div>
        
        {/* Tooltip ok */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
      </div>
    );
  };
  
  return (
    <>
      <td
        className={`px-2 py-2 relative cursor-pointer hover:bg-gray-50 transition-all duration-200 text-xs font-medium ${
          cellHighlights.length > 0 ? 'highlighted-cell' : ''
        } ${isSelected ? 'selected-cell' : ''}`}
        style={cellStyle}
        onClick={() => onClick && onClick(rowId, colId, value)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative z-10 flex items-center justify-between">
          <span className="truncate block flex-1" style={{ position: 'relative', zIndex: 10 }}>
            {processedValue.displayValue}
          </span>
          
          {/* Veri tipi göstergesi */}
          {showDataTypes && (
            <div className="ml-1 flex items-center">
              {processedValue.isLimitValue && (
                <span className="text-orange-500 text-xs" title="Limit değer">📉</span>
              )}
              {processedValue.numericValue !== null && !processedValue.isLimitValue && (
                <span className="text-blue-500 text-xs" title="Sayısal değer">🔢</span>
              )}
            </div>
          )}
        </div>
        
        {/* Formula indicators */}
        {cellHighlights.length > 1 && (
          <div className="absolute top-0 right-0 flex items-center" style={{ zIndex: 15 }}>
            <span className="text-xs font-bold text-white bg-red-500 rounded-full px-1 py-0 min-w-[16px] h-4 flex items-center justify-center shadow-sm border border-white">
              {cellHighlights.length}
            </span>
          </div>
        )}
        
        {cellHighlights.length === 1 && (
          <div className="absolute top-0 right-0" style={{ zIndex: 15 }}>
            <div className="w-2 h-2 bg-green-400 rounded-full border border-white shadow-sm"></div>
          </div>
        )}
        
        {showTooltip && getTooltipContent()}
      </td>
    </>
  );
} 