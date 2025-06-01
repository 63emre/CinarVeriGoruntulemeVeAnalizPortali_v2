import React, { useState, useRef, useEffect } from 'react';

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
  formulaIds: string[];
  formulaDetails?: FormulaDetail[];
}

interface EnhancedTableCellProps {
  rowId: string;
  colId: string;
  value: string | number | null;
  highlights?: HighlightedCell[];
  onClick?: (rowId: string, colId: string, value: string | number | null) => void;
  isSelected?: boolean;
  showAnimations?: boolean;
}

export default function EnhancedTableCell({ 
  rowId, 
  colId, 
  value, 
  highlights = [],
  onClick,
  isSelected = false,
  showAnimations = true
}: EnhancedTableCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const cellRef = useRef<HTMLTableCellElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Find all highlights that apply to this cell
  const cellHighlights = highlights.filter(
    h => h.row === rowId && h.col === colId
  );
  
  // Enhanced logging for debugging
  useEffect(() => {
    if (cellHighlights.length > 0) {
      console.log(`🎨 Enhanced cell [${rowId}, ${colId}] has ${cellHighlights.length} highlights:`, {
        highlights: cellHighlights,
        formulaCount: cellHighlights.reduce((sum, h) => sum + (h.formulaDetails?.length || 1), 0),
        colors: cellHighlights.flatMap(h => h.formulaDetails?.map(d => d.color) || [h.color])
      });
    }
  }, [cellHighlights, rowId, colId]);

  // Format cell value
  const formatCellValue = (val: string | number | null): string => {
    if (val === null) return '';
    if (typeof val === 'number') {
      if (val % 1 === 0) return val.toString();
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
    if (val % 1 === 0) return val.toString();
    return val.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4 
    });
  };

  // Get all formula details from highlights
  const getAllFormulaDetails = (): FormulaDetail[] => {
    return cellHighlights.flatMap(highlight => 
      highlight.formulaDetails || [{
        id: highlight.formulaIds[0] || 'unknown',
        name: highlight.message,
        formula: '',
        color: highlight.color
      }]
    );
  };

  // Create pizza slice effect using Canvas
  const drawPizzaSlices = () => {
    const canvas = canvasRef.current;
    if (!canvas || cellHighlights.length <= 1) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const allFormulas = getAllFormulaDetails();
    if (allFormulas.length <= 1) return;

    // Set canvas size to match cell
    const rect = cellRef.current?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pizza slices
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 2;
    
    const sliceAngle = (2 * Math.PI) / allFormulas.length;

    allFormulas.forEach((formula, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2; // Start from top
      const endAngle = (index + 1) * sliceAngle - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Fill with formula color
      ctx.fillStyle = formula.color;
      ctx.fill();

      // Add border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add subtle shadow for depth
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    });

    // Add center highlight
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.stroke();

    console.log(`🍕 Drew pizza slices for [${rowId}, ${colId}] with ${allFormulas.length} slices`);
  };

  // Update canvas when highlights change
  useEffect(() => {
    if (cellHighlights.length > 1) {
      // Small delay to ensure DOM is ready
      setTimeout(drawPizzaSlices, 50);
    }
  }, [cellHighlights.length, rowId, colId]);

  // Get cell styling based on highlights
  const getCellStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      transition: showAnimations ? 'all 0.2s ease-in-out' : 'none'
    };

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#e3f2fd',
        fontWeight: 'bold',
        border: '2px solid #2196f3'
      };
    }

    if (cellHighlights.length === 0) {
      return baseStyle;
    }

    if (cellHighlights.length === 1) {
      // Single highlight
      const highlight = cellHighlights[0];
      return {
        ...baseStyle,
        backgroundColor: highlight.color,
        color: getContrastColor(highlight.color),
        fontWeight: 'bold',
        border: `2px solid ${highlight.color}`,
        boxShadow: `0 0 8px ${highlight.color}40`,
        transform: showAnimations ? 'scale(1.02)' : 'none'
      };
    }

    // Multiple highlights - use transparent background for canvas overlay
    return {
      ...baseStyle,
      backgroundColor: 'transparent',
      color: '#000000',
      fontWeight: 'bold',
      border: '3px solid #333333',
      borderRadius: getAllFormulaDetails().length > 2 ? '50%' : '8px',
      boxShadow: '0 0 16px rgba(0,0,0,0.4)',
      transform: showAnimations ? 'scale(1.08)' : 'none',
      zIndex: 10
    };
  };

  // Calculate contrast color for text
  const getContrastColor = (hexColor: string): string => {
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Handle mouse enter with position tracking
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

  // Enhanced tooltip content
  const getTooltipContent = () => {
    if (cellHighlights.length === 0) return null;

    const allFormulas = getAllFormulaDetails();

    return (
      <div 
        className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg py-4 px-5 shadow-2xl border border-gray-700 min-w-[400px] max-w-[700px]"
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between font-bold mb-3 text-blue-300 border-b border-gray-700 pb-2">
          <span className="text-base">
            {allFormulas.length === 1 ? 'Aktif Formül:' : `🍕 ${allFormulas.length} Aktif Formül:`}
          </span>
          {allFormulas.length > 1 && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-yellow-300 font-normal">Pizza Dilimi Görünümü</span>
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-400"
                style={{
                  background: allFormulas.length > 1 ? 
                    `conic-gradient(from 0deg, ${
                      allFormulas.map((formula, idx) => {
                        const angle = 360 / allFormulas.length;
                        const start = idx * angle;
                        const end = (idx + 1) * angle;
                        return `${formula.color} ${start}deg ${end}deg`;
                      }).join(', ')
                    })` : allFormulas[0].color,
                  animation: showAnimations ? 'spin 4s linear infinite' : 'none'
                }}
                title="Pizza dilimi görünümü"
              />
            </div>
          )}
        </div>
        
        {/* Formula details */}
        <div className="space-y-4">
          {allFormulas.map((formula, index) => {
            const totalSlices = allFormulas.length;
            const sliceAngle = totalSlices > 1 ? 360 / totalSlices : 360;
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            
            return (
              <div 
                key={`${formula.id}-${index}`}
                className="border-l-4 pl-4 py-2 bg-gray-800 rounded-r-lg transition-all hover:bg-gray-750" 
                style={{ borderColor: formula.color }}
              >
                {/* Formula name with slice info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 border-2 border-gray-400 flex-shrink-0" 
                      style={{ backgroundColor: formula.color }}
                    />
                    <span className="font-semibold text-yellow-300 text-base">{formula.name}</span>
                  </div>
                  {totalSlices > 1 && (
                    <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      Dilim {index + 1}/{totalSlices} ({Math.round(startAngle)}°-{Math.round(endAngle)}°)
                    </div>
                  )}
                </div>
                
                {/* Formula calculation details */}
                {(formula.leftResult !== undefined || formula.rightResult !== undefined) && (
                  <div className="text-xs space-y-2 ml-7 text-gray-300">
                    <div className="grid grid-cols-2 gap-4 bg-gray-900 p-3 rounded border border-gray-600">
                      <div className="text-center">
                        <span className="text-blue-400 font-semibold block">Sol İfade</span>
                        <span className="ml-1 font-mono text-green-300 text-lg font-bold">
                          {formatNumericValue(formula.leftResult)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-blue-400 font-semibold block">Sağ İfade</span>
                        <span className="ml-1 font-mono text-green-300 text-lg font-bold">
                          {formatNumericValue(formula.rightResult)}
                        </span>
                      </div>
                    </div>
                    {formula.formula && (
                      <div className="mt-3 p-3 bg-gray-800 rounded text-xs font-mono text-gray-200 border border-gray-600">
                        <span className="text-blue-400 font-semibold">Formül: </span>
                        {formula.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Cell info */}
        <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div><strong>Hücre:</strong> {colId} - {rowId}</div>
            <div><strong>Değer:</strong> {formatCellValue(value)}</div>
          </div>
          {allFormulas.length > 1 && (
            <div className="text-yellow-400 mt-2 p-3 bg-gray-800 rounded border border-yellow-600">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🍕</span>
                <strong>Pizza Dilimi Açıklaması:</strong>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Bu hücre <strong>{allFormulas.length}</strong> farklı formül koşulunu karşılıyor. 
                Her renk dilimi farklı bir formülü temsil eder ve hücrenin arka planı 
                {allFormulas.length > 2 ? ' dairesel' : ' dikdörtgen'} pasta dilimlerine bölünmüştür.
              </p>
              {allFormulas.length > 2 && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 İpucu: 3 veya daha fazla formül için dairesel görünüm kullanılır.
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-gray-900" />
      </div>
    );
  };
  
  return (
    <>
      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes pizza-pulse {
          0% { 
            box-shadow: 0 0 16px rgba(0,0,0,0.4);
            transform: scale(1.08);
          }
          50% { 
            box-shadow: 0 0 20px rgba(0,0,0,0.6);
            transform: scale(1.12);
          }
          100% { 
            box-shadow: 0 0 16px rgba(0,0,0,0.4);
            transform: scale(1.08);
          }
        }
        
        @keyframes slice-glow {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .multi-formula-cell {
          animation: ${showAnimations ? 'pizza-pulse 3s infinite' : 'none'};
        }
        
        .enhanced-cell:hover {
          transform: scale(1.02) !important;
          z-index: 15 !important;
          transition: transform 0.2s ease-in-out !important;
        }
      `}</style>
      
      <td
        ref={cellRef}
        className={`px-4 py-2 border-b border-gray-200 relative cursor-pointer hover:bg-gray-50 transition-colors enhanced-cell ${
          cellHighlights.length > 1 ? 'multi-formula-cell' : ''
        }`}
        style={getCellStyle()}
        onClick={() => onClick && onClick(rowId, colId, value)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Canvas overlay for pizza slices */}
        {cellHighlights.length > 1 && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ 
              zIndex: 1,
              borderRadius: 'inherit'
            }}
          />
        )}
        
        {/* Cell content */}
        <span 
          className={isSelected ? 'font-medium' : ''} 
          style={{ 
            position: 'relative', 
            zIndex: 12,
            textShadow: cellHighlights.length > 1 ? '1px 1px 2px rgba(255,255,255,0.8)' : 'none'
          }}
        >
          {formatCellValue(value)}
        </span>
        
        {/* Multi-formula indicator */}
        {cellHighlights.length > 1 && (
          <div className="absolute top-1 right-1 flex items-center space-x-1" style={{ zIndex: 20 }}>
            <div className={`w-2 h-2 bg-yellow-400 rounded-full border border-white shadow-sm ${showAnimations ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-lg border border-white">
              {cellHighlights.length}
            </span>
          </div>
        )}
        
        {/* Single formula indicator */}
        {cellHighlights.length === 1 && (
          <div className="absolute top-1 right-1" style={{ zIndex: 20 }}>
            <div className={`w-3 h-3 bg-green-400 rounded-full border border-white shadow-md ${showAnimations ? 'animate-pulse' : ''}`} />
          </div>
        )}
        
        {/* Tooltip */}
        {showTooltip && getTooltipContent()}
      </td>
    </>
  );
} 