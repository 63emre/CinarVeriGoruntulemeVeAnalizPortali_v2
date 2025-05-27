import React, { useState } from 'react';

interface FormulaDetail {
  id: string;
  name: string;
  formula: string;
  leftResult?: number;
  rightResult?: number;
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

    // Multiple highlights - use base style for the cell
    const style = {
      position: 'relative' as const,
      backgroundColor: '#f8f9fa', // Light background for multi-formula cells
      border: '2px solid #333',
      fontWeight: 'bold' as const,
      transition: 'all 0.2s ease-in-out'
    };
    console.log(`🌈 Multi-highlight base style for [${rowId}, ${colId}]:`, style);
    return style;
  };

  // Render cell layers for multiple formulas
  const renderCellLayers = () => {
    if (cellHighlights.length <= 1) return null;

    const layers = cellHighlights.map((highlight, index) => {
      const totalFormulas = cellHighlights.length;
      let layerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: index + 1
      };

      // Calculate division based on number of formulas
      if (totalFormulas === 2) {
        // Vertical split
        layerStyle = {
          ...layerStyle,
          left: index === 0 ? '0%' : '50%',
          right: index === 0 ? '50%' : '0%',
          backgroundColor: highlight.color,
          opacity: 0.7
        };
      } else if (totalFormulas === 3) {
        // Horizontal thirds
        layerStyle = {
          ...layerStyle,
          top: `${(index * 100) / 3}%`,
          bottom: `${((2 - index) * 100) / 3}%`,
          backgroundColor: highlight.color,
          opacity: 0.7
        };
      } else if (totalFormulas === 4) {
        // Quadrants
        const isTop = index < 2;
        const isLeft = index % 2 === 0;
        layerStyle = {
          ...layerStyle,
          top: isTop ? '0%' : '50%',
          bottom: isTop ? '50%' : '0%',
          left: isLeft ? '0%' : '50%',
          right: isLeft ? '50%' : '0%',
          backgroundColor: highlight.color,
          opacity: 0.7
        };
      } else {
        // For more than 4 formulas, use diagonal stripes
        const angle = (index * 180) / totalFormulas;
        layerStyle = {
          ...layerStyle,
          background: `linear-gradient(${angle}deg, transparent 40%, ${highlight.color} 45%, ${highlight.color} 55%, transparent 60%)`,
          opacity: 0.8
        };
      }

      return (
        <div
          key={`layer-${index}`}
          style={layerStyle}
          className="formula-layer"
        />
      );
    });

    return <>{layers}</>;
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