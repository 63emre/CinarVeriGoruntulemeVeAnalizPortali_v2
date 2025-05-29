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
        boxShadow: `0 0 8px ${highlight.color}40`,
        position: 'relative' as const,
        transition: 'all 0.2s ease-in-out'
      };
      console.log(`🎨 Single highlight style for [${rowId}, ${colId}]:`, style);
      return style;
    }

    // ENHANCED: Multiple highlights - create advanced pizza slice effect using conic-gradient
    const totalFormulas = cellHighlights.length;
    
    // ENHANCED: Get colors from formulaDetails with improved fallback logic
    const formulaColors: string[] = [];
    const formulaNames: string[] = [];
    
    cellHighlights.forEach(highlight => {
      if (highlight.formulaDetails && highlight.formulaDetails.length > 0) {
        // Use colors from formulaDetails for accurate pizza slices
        highlight.formulaDetails.forEach(detail => {
          if (detail.color) {
            formulaColors.push(detail.color);
            formulaNames.push(detail.name || 'Bilinmeyen Formül');
          }
        });
      } else {
        // Enhanced fallback with better color extraction
        const cleanColor = highlight.color.startsWith('#') ? highlight.color : `#${highlight.color}`;
        formulaColors.push(cleanColor);
        formulaNames.push(highlight.message || 'Bilinmeyen Formül');
      }
    });
    
    console.log(`🍕 ENHANCED PIZZA SLICE for [${rowId}, ${colId}]:`, {
      totalFormulas,
      totalColors: formulaColors.length,
      colors: formulaColors,
      names: formulaNames,
      highlights: cellHighlights.map(h => ({
        message: h.message,
        color: h.color,
        formulaDetailsCount: h.formulaDetails?.length || 0
      }))
    });
    
    // ENHANCED: Create balanced conic-gradient pizza slices with better color distribution
    const sliceAngle = 360 / formulaColors.length;
    const gradientStops: string[] = [];
    
    formulaColors.forEach((color, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      
      // Add slight overlap to prevent gaps between slices
      const adjustedEndAngle = index === formulaColors.length - 1 ? 360 : endAngle + 0.5;
      
      gradientStops.push(`${color} ${startAngle}deg ${adjustedEndAngle}deg`);
    });
    
    // ENHANCED: Improved conic-gradient with better visual appearance and animation
    const conicGradient = `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    
    const style = {
      position: 'relative' as const,
      background: conicGradient,
      border: '3px solid #333',
      borderRadius: formulaColors.length > 2 ? '50%' : '6px', // Circular for 3+ slices, rounded square for 2
      fontWeight: 'bold' as const,
      transition: 'all 0.3s ease-in-out',
      color: '#000000', // Ensure text is visible
      textShadow: '3px 3px 6px rgba(255,255,255,0.9)', // Strong text shadow for readability
      boxShadow: '0 0 16px rgba(0,0,0,0.4), inset 0 0 8px rgba(255,255,255,0.3)', // Enhanced shadow
      transform: 'scale(1.08)', // Slightly larger to indicate multiple formulas
      zIndex: 10,
      // ENHANCED: Add animation hint
      animation: formulaColors.length > 2 ? 'pizza-pulse 3s infinite' : undefined,
    };
    
    console.log(`🍕 ENHANCED PIZZA SLICE APPLIED for [${rowId}, ${colId}]:`, {
      totalFormulas: formulaColors.length,
      gradient: conicGradient,
      finalStyle: style
    });
    
    return style;
  };

  // ENHANCED: Render cell layers for complex visualizations - now includes SVG overlays for premium pizza effect
  const renderCellLayers = () => {
    if (cellHighlights.length <= 1) return null;
    
    // For 3+ formulas, add an SVG overlay with slice indicators
    if (cellHighlights.length >= 3) {
      const formulaColors = cellHighlights.flatMap(h => 
        h.formulaDetails?.map(d => d.color) || [h.color]
      );
      
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          <svg 
            width="100%" 
            height="100%" 
            className="absolute inset-0"
            style={{ borderRadius: 'inherit' }}
          >
            {formulaColors.map((color, index) => {
              const sliceAngle = 360 / formulaColors.length;
              const startAngle = (index * sliceAngle - 90) * (Math.PI / 180); // -90 to start from top
              
              // Calculate slice path for thin divider lines
              const centerX = 50;
              const centerY = 50;
              const radius = 45;
              
              const x1 = centerX + radius * Math.cos(startAngle);
              const y1 = centerY + radius * Math.sin(startAngle);
              
              return (
                <line
                  key={`divider-${index}`}
                  x1={`${centerX}%`}
                  y1={`${centerY}%`}
                  x2={`${x1}%`}
                  y2={`${y1}%`}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                  className="slice-divider"
                />
              );
            })}
          </svg>
        </div>
      );
    }
    
    return null;
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

  // ENHANCED: Get tooltip content with improved pizza chart info and better formatting
  const getTooltipContent = () => {
    if (cellHighlights.length === 0) return null;

    return (
      <div className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg py-4 px-5 shadow-2xl border border-gray-700 min-w-[350px] max-w-[600px]"
           style={{
             left: `${tooltipPosition.x}px`,
             top: `${tooltipPosition.y}px`,
             transform: 'translate(-50%, -100%)',
             position: 'fixed'
           }}>
        {/* ENHANCED: Header with Pizza Slice Indicator and animation */}
        <div className="flex items-center justify-between font-bold mb-3 text-blue-300 border-b border-gray-700 pb-2">
          <span className="text-base">
            {cellHighlights.length === 1 ? 'Aktif Formül:' : `🍕 ${cellHighlights.length} Aktif Formül:`}
          </span>
          {cellHighlights.length > 1 && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-yellow-300 font-normal">Pizza Dilimi Görünümü</span>
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-400 animate-spin"
                style={{
                  background: cellHighlights.length > 1 ? 
                    `conic-gradient(from 0deg, ${
                      cellHighlights.flatMap(h => 
                        h.formulaDetails?.map(d => d.color) || [h.color]
                      ).map((color, idx, arr) => {
                        const angle = 360 / arr.length;
                        const start = idx * angle;
                        const end = (idx + 1) * angle;
                        return `${color} ${start}deg ${end}deg`;
                      }).join(', ')
                    })` : cellHighlights[0].color,
                  animationDuration: '4s'
                }}
                title="Pizza dilimi görünümü"
              />
            </div>
          )}
        </div>
        
        {/* ENHANCED: Formula details with better layout and slice information */}
        <div className="space-y-4">
          {cellHighlights.flatMap((highlight, highlightIdx) => 
            highlight.formulaDetails?.map((formulaDetail, detailIdx) => {
              const globalIndex = cellHighlights.slice(0, highlightIdx).reduce((sum, h) => sum + (h.formulaDetails?.length || 1), 0) + detailIdx;
              const totalSlices = cellHighlights.reduce((sum, h) => sum + (h.formulaDetails?.length || 1), 0);
              const sliceAngle = totalSlices > 1 ? 360 / totalSlices : 360;
              const startAngle = globalIndex * sliceAngle;
              const endAngle = (globalIndex + 1) * sliceAngle;
              
              return (
                <div key={`formula-${highlightIdx}-${detailIdx}`} 
                     className="border-l-4 pl-4 py-2 bg-gray-800 rounded-r-lg transition-all hover:bg-gray-750" 
                     style={{ borderColor: formulaDetail.color }}>
                  {/* ENHANCED: Formula name with slice info and visual indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3 border-2 border-gray-400 flex-shrink-0" 
                        style={{ backgroundColor: formulaDetail.color }}
                      ></div>
                      <span className="font-semibold text-yellow-300 text-base">{formulaDetail.name}</span>
                    </div>
                    {totalSlices > 1 && (
                      <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        Dilim {globalIndex + 1}/{totalSlices} ({Math.round(startAngle)}°-{Math.round(endAngle)}°)
                      </div>
                    )}
                  </div>
                  
                  {/* ENHANCED: Formula calculation details if available */}
                  {(formulaDetail.leftResult !== undefined || formulaDetail.rightResult !== undefined) && (
                    <div className="text-xs space-y-2 ml-7 text-gray-300">
                      <div className="grid grid-cols-2 gap-4 bg-gray-900 p-3 rounded border border-gray-600">
                        <div className="text-center">
                          <span className="text-blue-400 font-semibold block">Sol İfade</span>
                          <span className="ml-1 font-mono text-green-300 text-lg font-bold">
                            {formatNumericValue(formulaDetail.leftResult)}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-blue-400 font-semibold block">Sağ İfade</span>
                          <span className="ml-1 font-mono text-green-300 text-lg font-bold">
                            {formatNumericValue(formulaDetail.rightResult)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gray-800 rounded text-xs font-mono text-gray-200 border border-gray-600">
                        <span className="text-blue-400 font-semibold">Formül: </span>
                        {formulaDetail.formula}
                      </div>
                    </div>
                  )}
                </div>
              );
            }) || [
              <div key={`highlight-${highlightIdx}`} 
                   className="border-l-4 pl-4 py-2 bg-gray-800 rounded-r-lg" 
                   style={{ borderColor: highlight.color }}>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 border-2 border-gray-400" 
                    style={{ backgroundColor: highlight.color }}
                  ></div>
                  <span className="font-semibold text-yellow-300">{highlight.message}</span>
                </div>
              </div>
            ]
          )}
        </div>
        
        {/* ENHANCED: Cell info with pizza slice explanation and visual guide */}
        <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div><strong>Hücre:</strong> {colId} - {rowId}</div>
            <div><strong>Değer:</strong> {formatCellValue(value)}</div>
          </div>
          {cellHighlights.length > 1 && (
            <div className="text-yellow-400 mt-2 p-3 bg-gray-800 rounded border border-yellow-600">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🍕</span>
                <strong>Pizza Dilimi Açıklaması:</strong>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Bu hücre <strong>{cellHighlights.length}</strong> farklı formül koşulunu karşılıyor. 
                Her renk dilimi farklı bir formülü temsil eder ve hücrenin arka planı 
                {cellHighlights.length > 2 ? ' dairesel' : ' dikdörtgen'} pasta dilimlerine bölünmüştür.
              </p>
              {cellHighlights.length > 2 && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 İpucu: 3 veya daha fazla formül için dairesel görünüm kullanılır.
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* ENHANCED: Tooltip arrow with better positioning */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-gray-900"></div>
      </div>
    );
  };
  
  return (
    <>
      {/* ENHANCED: Add CSS for improved animations and effects */}
      <style jsx>{`
        @keyframes pizza-pulse {
          0% { 
            box-shadow: 0 0 16px rgba(0,0,0,0.4), inset 0 0 8px rgba(255,255,255,0.3);
            transform: scale(1.08);
          }
          50% { 
            box-shadow: 0 0 20px rgba(0,0,0,0.6), inset 0 0 12px rgba(255,255,255,0.4);
            transform: scale(1.12);
          }
          100% { 
            box-shadow: 0 0 16px rgba(0,0,0,0.4), inset 0 0 8px rgba(255,255,255,0.3);
            transform: scale(1.08);
          }
        }
        
        @keyframes slice-glow {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        .multi-formula-cell {
          animation: pizza-pulse 3s infinite;
        }
        
        .slice-divider {
          animation: slice-glow 2s infinite;
        }
        
        .highlighted-cell:hover {
          transform: scale(1.02) !important;
          z-index: 15 !important;
          transition: transform 0.2s ease-in-out !important;
        }
        
        .pizza-slice-indicator {
          background: conic-gradient(from 0deg, #ff6b6b 0deg 120deg, #4ecdc4 120deg 240deg, #45b7d1 240deg 360deg);
          animation: spin 4s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        {/* ENHANCED: Render cell layers for multiple formulas with SVG overlays */}
        {renderCellLayers()}
        
        <span className={isSelected ? 'font-medium' : ''} style={{ position: 'relative', zIndex: 12 }}>
          {formatCellValue(value)}
        </span>
        
        {/* ENHANCED: Multi-formula indicator with animation and count */}
        {cellHighlights.length > 1 && (
          <div className="absolute top-1 right-1 flex items-center space-x-1" style={{ zIndex: 20 }}>
            <div className="w-2 h-2 bg-yellow-400 rounded-full border border-white shadow-sm animate-bounce"></div>
            <span className="text-xs font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-lg border border-white">
              {cellHighlights.length}
            </span>
          </div>
        )}
        
        {/* ENHANCED: Single formula indicator with subtle glow */}
        {cellHighlights.length === 1 && (
          <div className="absolute top-1 right-1" style={{ zIndex: 20 }}>
            <div className="w-3 h-3 bg-green-400 rounded-full border border-white shadow-md animate-pulse"></div>
          </div>
        )}
        
        {/* Tooltip */}
        {showTooltip && getTooltipContent()}
      </td>
    </>
  );
} 