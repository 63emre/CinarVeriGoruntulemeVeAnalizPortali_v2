import React, { useState } from 'react';

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
  
  // Find all highlights that apply to this cell
  const cellHighlights = highlights.filter(
    h => h.row === rowId && h.col === colId
  );
  
  // Debug logging for cell highlights
  if (cellHighlights.length > 0) {
    console.log(`🎨 Cell [${rowId}, ${colId}] has ${cellHighlights.length} highlights:`, cellHighlights);
  }
  
  // Function to format the cell value
  const formatCellValue = (val: string | number | null): string => {
    if (val === null) return '';
    if (typeof val === 'number') {
      // Format number with appropriate precision
      if (val % 1 === 0) return val.toString(); // Integer
      return val.toLocaleString('tr-TR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 4 
      });
    }
    return val;
  };

  // Format numeric value for display
  const formatNumericValue = (val?: number): string => {
    if (val === undefined) return 'N/A';
    if (val % 1 === 0) return val.toString(); // Integer
    return val.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4 
    });
  };

  // Get cell styling based on highlights
  const getCellStyle = (): React.CSSProperties => {
    if (cellHighlights.length === 0) {
      return isSelected ? { backgroundColor: '#e3f2fd', fontWeight: 'bold' } : {};
    }

    if (cellHighlights.length === 1) {
      // Single highlight
      const highlight = cellHighlights[0];
      const style = {
        backgroundColor: highlight.color,
        color: '#000',
        fontWeight: 'bold' as const,
        border: `2px solid ${highlight.color}`,
        boxShadow: `0 0 4px ${highlight.color}40`,
        position: 'relative' as const,
        transition: 'all 0.2s ease-in-out'
      };
      console.log(`🎨 Single highlight style for [${rowId}, ${colId}]:`, style);
      return style;
    }

    // FIXED: Multiple highlights - create proper pizza slice effect using conic-gradient
    const totalFormulas = cellHighlights.length;
    
    // ENHANCED: Get colors from formulaDetails if available, otherwise use highlight.color
    const formulaColors: string[] = [];
    
    cellHighlights.forEach(highlight => {
      if (highlight.formulaDetails && highlight.formulaDetails.length > 0) {
        // Use colors from formulaDetails for accurate pizza slices
        highlight.formulaDetails.forEach(detail => {
          if (detail.color) {
            formulaColors.push(detail.color);
          }
        });
      } else {
        // Fallback to highlight.color
        formulaColors.push(highlight.color);
      }
    });
    
    console.log(`🍕 CREATING PIZZA SLICE for [${rowId}, ${colId}]:`, {
      totalFormulas,
      totalColors: formulaColors.length,
      colors: formulaColors,
      highlights: cellHighlights.map(h => ({
        message: h.message,
        color: h.color,
        formulaDetailsCount: h.formulaDetails?.length || 0
      }))
    });
    
    // Create conic-gradient pizza slices
    const sliceAngle = 360 / totalFormulas;
    const gradientStops: string[] = [];
    
    formulaColors.forEach((color, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      gradientStops.push(`${color} ${startAngle}deg ${endAngle}deg`);
    });
    
    // FIXED: Improved conic-gradient with better visual appearance
    const conicGradient = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    
    const style = {
      position: 'relative' as const,
      background: conicGradient,
      border: '3px solid #333',
      borderRadius: '6px',
      fontWeight: 'bold' as const,
      transition: 'all 0.3s ease-in-out',
      color: '#000000', // Ensure text is visible
      textShadow: '2px 2px 4px rgba(255,255,255,0.9)', // Strong text shadow for readability
      boxShadow: '0 0 12px rgba(0,0,0,0.4), inset 0 0 6px rgba(255,255,255,0.3)', // Enhanced shadow
      transform: 'scale(1.05)', // Slightly larger to indicate multiple formulas
      zIndex: 10
    };
    
    console.log(`🍕 PIZZA SLICE APPLIED for [${rowId}, ${colId}]:`, {
      totalFormulas,
      gradient: conicGradient,
      finalStyle: style
    });
    
    return style;
  };

  // Render cell layers for multiple formulas - now simplified since we use conic-gradient
  const renderCellLayers = () => {
    // No longer needed since we use CSS conic-gradient for pizza slices
    return null;
  };

  // Handle mouse enter with position tracking
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (cellHighlights.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Get tooltip content
  const getTooltipContent = () => {
    if (cellHighlights.length === 0) return null;

    return (
      <div className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-xl border border-gray-700 min-w-[300px] max-w-[500px]"
           style={{
             left: `${tooltipPosition.x}px`,
             top: `${tooltipPosition.y}px`,
             transform: 'translate(-50%, -100%)',
             position: 'fixed'
           }}>
        {/* Header */}
        <div className="font-bold mb-2 text-blue-300 border-b border-gray-700 pb-2">
          {cellHighlights.length === 1 ? 'Aktif Formül:' : `${cellHighlights.length} Aktif Formül:`}
        </div>
        
        {/* Formula list */}
        <div className="space-y-3">
          {cellHighlights.map((highlight, idx) => {
            const formulaDetail = highlight.formulaDetails?.[0];
            return (
              <div key={`formula-${idx}`} className="border-l-4 pl-3 py-1" 
                   style={{ borderColor: highlight.color }}>
                {/* Formula name and color indicator */}
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full mr-2 border border-gray-400" 
                       style={{ backgroundColor: highlight.color }}></div>
                  <span className="font-semibold text-yellow-300">{highlight.message}</span>
                </div>
                
                {/* Formula details if available */}
                {formulaDetail && (
                  <div className="text-xs space-y-1 ml-5 text-gray-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-blue-300">Sol İfade:</span>
                        <span className="ml-1 font-mono text-green-300">
                          {formatNumericValue(formulaDetail.leftResult)}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-300">Sağ İfade:</span>
                        <span className="ml-1 font-mono text-green-300">
                          {formatNumericValue(formulaDetail.rightResult)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-200 border border-gray-600">
                      {formulaDetail.formula}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Cell info */}
        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
          <div>Hücre: {colId} - {rowId}</div>
          <div>Değer: {formatCellValue(value)}</div>
          {cellHighlights.length > 1 && (
            <div className="text-yellow-400 mt-1">
              ⚠️ Bu hücre birden fazla formül koşulunu karşılıyor
            </div>
          )}
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    );
  };
  
  return (
    <>
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 8px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 12px rgba(0,0,0,0.6); }
          100% { box-shadow: 0 0 8px rgba(0,0,0,0.4); }
        }
        
        .multi-formula-cell {
          animation: pulse 2s infinite;
        }
        
        .highlighted-cell:hover {
          transform: scale(1.02);
          z-index: 10;
        }
      `}</style>
      
      <td
        className={`px-4 py-2 border-b border-gray-200 relative cursor-pointer hover:bg-gray-50 transition-colors ${
          cellHighlights.length > 0 ? 'highlighted-cell' : ''
        } ${cellHighlights.length > 1 ? 'multi-formula-cell' : ''}`}
        style={getCellStyle()}
        onClick={() => onClick && onClick(rowId, colId, value)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Render cell layers for multiple formulas */}
        {renderCellLayers()}
        
        <span className={isSelected ? 'font-medium' : ''} style={{ position: 'relative', zIndex: 10 }}>
          {formatCellValue(value)}
        </span>
        
        {/* Enhanced multi-formula indicator */}
        {cellHighlights.length > 1 && (
          <div className="absolute top-1 right-1 flex items-center space-x-1" style={{ zIndex: 15 }}>
            <div className="w-2 h-2 bg-yellow-400 rounded-full border border-white shadow-sm animate-bounce"></div>
            <span className="text-xs font-bold text-white bg-red-500 rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center shadow-sm">
              {cellHighlights.length}
            </span>
          </div>
        )}
        
        {/* Single formula indicator */}
        {cellHighlights.length === 1 && (
          <div className="absolute top-1 right-1" style={{ zIndex: 15 }}>
            <div className="w-2 h-2 bg-green-400 rounded-full border border-white shadow-sm"></div>
          </div>
        )}
      </td>
      
      {/* Enhanced tooltip portal */}
      {showTooltip && cellHighlights.length > 0 && getTooltipContent()}
    </>
  );
} 