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

    if (cellHighlights.length === 1) {
      const highlight = cellHighlights[0];
      // Ensure color is in hex format
      const color = highlight.color.startsWith('#') ? highlight.color : `#${highlight.color}`;
      return {
        backgroundColor: color + '40', // Add transparency
        color: '#000',
        fontWeight: 'bold' as const,
        border: `2px solid ${color}`,
        position: 'relative' as const,
        transition: 'all 0.15s ease-in-out'
      };
    }

    // Multiple highlights - enhanced pizza slice effect
    const formulaColors: string[] = [];
    
    // ENHANCED: Collect all unique colors from formula details
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
      // Single unique color - treat as single highlight
      const color = formulaColors[0];
      return {
        backgroundColor: color + '40',
        color: '#000',
        fontWeight: 'bold' as const,
        border: `2px solid ${color}`,
        position: 'relative' as const,
        transition: 'all 0.15s ease-in-out'
      };
    }
    
    // ENHANCED: Multiple unique colors - create improved pizza slices
    const totalSlices = formulaColors.length;
    const sliceAngle = 360 / totalSlices;
    const gradientStops: string[] = [];
    
    formulaColors.forEach((color, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      
      // Create smoother transitions
      if (index === formulaColors.length - 1) {
        // Last slice - connect back to first
        gradientStops.push(`${color} ${startAngle}deg 360deg`);
        gradientStops.push(`${formulaColors[0]} 0deg ${sliceAngle}deg`);
      } else {
        gradientStops.push(`${color} ${startAngle}deg ${endAngle}deg`);
      }
    });
    
    const conicGradient = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    
    return {
      position: 'relative' as const,
      background: conicGradient,
      border: '3px solid #333',
      borderRadius: totalSlices > 2 ? '10px' : '6px',
      fontWeight: 'bold' as const,
      transition: 'all 0.2s ease-in-out',
      color: '#000000',
      textShadow: '1px 1px 3px rgba(255,255,255,0.9)',
      boxShadow: '0 0 8px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.1)',
      transform: 'scale(1.08)',
      zIndex: 15,
      width: '100%',
      height: '100%',
      minHeight: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      <div className="absolute z-50 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-gray-700 min-w-[200px] max-w-[400px]"
           style={{
             left: `${tooltipPosition.x}px`,
             top: `${tooltipPosition.y}px`,
             transform: 'translate(-50%, -100%)',
             position: 'fixed'
           }}>
        <div className="flex items-center justify-between font-bold mb-1 text-blue-300">
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
        
        <div className="space-y-1">
          {cellHighlights.flatMap((highlight, highlightIdx) => 
            highlight.formulaDetails?.map((formulaDetail, detailIdx) => (
              <div key={`formula-${highlightIdx}-${detailIdx}`} 
                   className="border-l-2 pl-2 py-0.5 bg-gray-800 rounded-r" 
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
                   className="border-l-2 pl-2 py-0.5 bg-gray-800 rounded-r" 
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
        
        <div className="mt-2 pt-1 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Hücre: {colId}[{rowId}]</span>
            <span>Değer: {formattedValue}</span>
          </div>
          {cellHighlights.length > 1 && (
            <div className="text-yellow-400 mt-1 text-xs">
              🍕 {cellHighlights.length} formül aktif
            </div>
          )}
        </div>
        
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
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