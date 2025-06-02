import React, { useState, useMemo } from 'react';

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

interface TableCellProps {
  rowId: string;
  colId: string;
  value: string | number | null;
  highlights?: HighlightedCell[];
  onClick?: (rowId: string, colId: string, value: string | number | null) => void;
  isSelected?: boolean;
}

export default function TableCell({ 
  rowId, 
  colId, 
  value, 
  highlights = [],
  onClick,
  isSelected = false
}: TableCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // OPTIMIZED: Memoize cell highlights calculation
  const cellHighlights = useMemo(() => 
    highlights.filter(h => h.row === rowId && h.col === colId),
    [highlights, rowId, colId]
  );
  
  // OPTIMIZED: Memoize cell style calculation  
  const cellStyle = useMemo((): React.CSSProperties => {
    if (cellHighlights.length === 0) {
      return isSelected ? { backgroundColor: '#e3f2fd', fontWeight: 'bold' } : {};
    }
    
    // ENHANCED: Collect all unique colors from formula details
    const formulaColors: string[] = [];
    cellHighlights.forEach(highlight => {
      if (highlight.formulaDetails && highlight.formulaDetails.length > 0) {
        highlight.formulaDetails.forEach(detail => {
          if (detail.color) {
            const cleanColor = detail.color.startsWith('#') ? detail.color : `#${detail.color}`;
            if (!formulaColors.includes(cleanColor)) {
              formulaColors.push(cleanColor);
            }
          }
        });
      }
      
      // Also add the main highlight color if not already present
      const mainColor = highlight.color.startsWith('#') ? highlight.color : `#${highlight.color}`;
      if (!formulaColors.includes(mainColor)) {
        formulaColors.push(mainColor);
      }
    });
    
    // Ensure we have colors
    if (formulaColors.length === 0) {
      return isSelected ? { backgroundColor: '#e3f2fd', fontWeight: 'bold' } : {};
    }
    
    if (formulaColors.length === 1) {
      // Single formula - standard highlighting
      const color = formulaColors[0];
      return {
        backgroundColor: color + '40', // 25% opacity
        color: '#000',
        fontWeight: 'bold' as const,
        border: `2px solid ${color}`,
        position: 'relative' as const,
        transition: 'all 0.15s ease-in-out',
        boxShadow: `0 0 4px ${color}60`
      };
    }
    
    // ENHANCED: Multiple formulas - create symmetric pizza slices
    const totalSlices = formulaColors.length;
    const sliceAngle = 360 / totalSlices;
    const gradientStops: string[] = [];
    
    // Create equal segments for each formula
    formulaColors.forEach((color, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      
      // Add smooth transitions between colors
      gradientStops.push(`${color} ${startAngle}deg`);
      gradientStops.push(`${color} ${endAngle}deg`);
    });
    
    const conicGradient = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    
    return {
      background: conicGradient,
      color: '#000',
      fontWeight: 'bold' as const,
      border: '3px solid #333',
      borderRadius: totalSlices > 2 ? '50%' : '8px', // Circular for 3+ formulas
      position: 'relative' as const,
      transition: 'all 0.2s ease-in-out',
      textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
      boxShadow: '0 0 8px rgba(0,0,0,0.4), inset 0 0 10px rgba(255,255,255,0.3)',
      transform: 'scale(1.05)',
      zIndex: 10
    };
  }, [cellHighlights, isSelected]);

  // OPTIMIZED: Memoize cell value formatting
  const formattedValue = useMemo(() => {
    if (value === null) return '';
    if (typeof value === 'number') {
      if (value % 1 === 0) return value.toString();
      return value.toLocaleString('tr-TR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 3 
      });
    }
    return value;
  }, [value]);

  // Handle mouse events
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (cellHighlights.length > 0) {
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

  // OPTIMIZED: Simplified tooltip content
  const getTooltipContent = () => {
    if (cellHighlights.length === 0) return null;
    
    return (
      <div className="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-600 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-blue-300 text-sm">
            Hücre: {rowId}, {colId}
          </span>
          {cellHighlights.length > 1 && (
            <div
              className="w-4 h-4 rounded-full border border-gray-400 ml-2"
              style={{
                background: cellStyle.background || cellHighlights[0].color
              }}
              title="Çoklu formül gösterimi"
            />
          )}
        </div>
        
        <div className="text-xs text-yellow-300 mb-2">
          Değer: <span className="font-mono bg-gray-800 px-1 rounded">{formattedValue}</span>
        </div>
        
        {/* ENHANCED: Separate section for each formula */}
        <div className="space-y-2">
          {cellHighlights.flatMap((highlight, highlightIdx) => 
            highlight.formulaDetails?.map((formulaDetail, detailIdx) => (
              <div key={`formula-${highlightIdx}-${detailIdx}`} 
                   className="border-l-3 pl-3 py-2 rounded-r-lg"
                   style={{ 
                     borderLeftColor: formulaDetail.color,
                     backgroundColor: `${formulaDetail.color}15` // Light background
                   }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2 border border-white shadow-sm" 
                      style={{ backgroundColor: formulaDetail.color }}
                    />
                    <span className="font-semibold text-yellow-300 text-xs">
                      {formulaDetail.name}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                    ✓ Koşul Sağlandı
                  </span>
                </div>
                
                {/* Formula expression */}
                <div className="bg-gray-800 rounded p-2 mt-1">
                  <code className="text-xs text-cyan-300 font-mono">
                    {formulaDetail.formula}
                  </code>
                </div>
                
                {/* ENHANCED: Show calculation results if available */}
                {(formulaDetail.leftResult !== undefined || formulaDetail.rightResult !== undefined) && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 rounded p-1 text-center">
                      <div className="text-blue-400 font-medium">Sol Taraf</div>
                      <div className="text-green-300 font-mono">
                        {formulaDetail.leftResult?.toFixed(3) || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-1 text-center">
                      <div className="text-blue-400 font-medium">Sağ Taraf</div>
                      <div className="text-green-300 font-mono">
                        {formulaDetail.rightResult?.toFixed(3) || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )) ||
            // Fallback for highlights without formulaDetails
            [
              <div key={`basic-${highlightIdx}`} 
                   className="border-l-3 pl-3 py-1 rounded-r"
                   style={{ borderLeftColor: highlight.color }}>
                <div className="text-yellow-300 text-xs font-medium">
                  {highlight.message}
                </div>
              </div>
            ]
          )}
        </div>
        
        {/* Summary for multiple formulas */}
        {cellHighlights.length > 1 && (
          <div className="mt-3 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400 text-center">
              <span className="font-medium">{cellHighlights.length} formül</span> bu hücreyi etkiliyor
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <td
        className={`px-2 py-1 border-2 border-gray-400 relative cursor-pointer hover:bg-gray-50 transition-colors text-xs ${
          cellHighlights.length > 0 ? 'highlighted-cell' : ''
        }`}
        style={cellStyle}
        onClick={() => onClick && onClick(rowId, colId, value)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className={`${isSelected ? 'font-medium' : ''} truncate block`} style={{ position: 'relative', zIndex: 10 }}>
          {formattedValue}
        </span>
        
        {/* ENHANCED: Formula indicators with count and visual distinction */}
        {cellHighlights.length > 1 && (
          <div className="absolute top-0 right-0 flex items-center" style={{ zIndex: 15 }}>
            <span className="text-xs font-bold text-white bg-red-600 rounded-full px-1.5 py-0.5 min-w-[18px] h-5 flex items-center justify-center shadow-lg border-2 border-white">
              {cellHighlights.length}
            </span>
          </div>
        )}
        
        {cellHighlights.length === 1 && (
          <div className="absolute top-0 right-0" style={{ zIndex: 15 }}>
            <div 
              className="w-3 h-3 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: cellHighlights[0].formulaDetails?.[0]?.color || cellHighlights[0].color }}
            ></div>
          </div>
        )}
        
        {showTooltip && getTooltipContent()}
      </td>
    </>
  );
} 