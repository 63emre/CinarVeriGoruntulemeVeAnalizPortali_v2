import React, { useState, CSSProperties } from 'react';

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
  
  // Find all highlights that apply to this cell
  const cellHighlights = highlights.filter(
    h => h.row === rowId && h.col === colId
  );
  
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
  
  // Generate cell style based on highlights
  const getCellStyle = (): CSSProperties => {
    if (cellHighlights.length === 0) {
      return isSelected ? { backgroundColor: '#e5f6fd' } : {};
    }
    
    if (cellHighlights.length === 1) {
      // Single highlight - use its color directly
      return { 
        backgroundColor: cellHighlights[0].color,
        position: 'relative' as const
      };
    }
    
    // Multiple highlights - create a gradient
    const colors = cellHighlights.map(h => h.color);
    
    if (colors.length === 2) {
      // Two colors - diagonal gradient
      return {
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 49%, ${colors[1]} 51%, ${colors[1]} 100%)`,
        position: 'relative' as const
      };
    } else if (colors.length === 3) {
      // Three colors - radial gradient
      return {
        background: `radial-gradient(circle, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        position: 'relative' as const
      };
    } else {
      // More than three - striped gradient
      const stripeWidth = 100 / colors.length;
      const gradientStops = colors.map((color, index) => {
        const start = index * stripeWidth;
        const end = (index + 1) * stripeWidth;
        return `${color} ${start}%, ${color} ${end}%`;
      }).join(', ');
      
      return {
        background: `linear-gradient(135deg, ${gradientStops})`,
        position: 'relative' as const
      };
    }
  };
  
  return (
    <td
      className="px-4 py-2 border-b border-gray-200 relative"
      style={getCellStyle()}
      onClick={() => onClick && onClick(rowId, colId, value)}
      onMouseEnter={() => cellHighlights.length > 0 && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={isSelected ? 'font-medium' : ''}>
        {formatCellValue(value)}
      </span>
      
      {/* Formula tooltip */}
      {showTooltip && cellHighlights.length > 0 && (
        <div className="absolute z-10 bg-gray-800 text-white text-sm rounded py-2 px-3 left-0 -top-10 min-w-[250px] max-w-[400px] shadow-lg">
          <div className="font-semibold mb-1">Formüller:</div>
          <ul className="list-none pl-1 space-y-2">
            {cellHighlights.map((highlight, idx) => {
              const formulaDetail = highlight.formulaDetails?.[0];
              return (
                <li key={`formula-${idx}`} className="border-l-4 pl-2" style={{ borderColor: highlight.color }}>
                  <div className="font-medium">{highlight.message}</div>
                  {formulaDetail && (
                    <div className="text-xs mt-1 opacity-90">
                      <div className="flex justify-between">
                        <span>Sol İfade:</span>
                        <span>{formatNumericValue(formulaDetail.leftResult)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sağ İfade:</span>
                        <span>{formatNumericValue(formulaDetail.rightResult)}</span>
                      </div>
                      <div className="text-xs mt-1 text-gray-300">
                        {formulaDetail.formula}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="absolute h-2 w-2 bg-gray-800 transform rotate-45 left-4 -bottom-1"></div>
        </div>
      )}
      
      {/* Small indicator dot for highlighted cells when not hovering */}
      {cellHighlights.length > 0 && !showTooltip && (
        <div 
          className="absolute top-0 right-0 h-2 w-2 rounded-full"
          style={{ backgroundColor: cellHighlights[0].color }}
        />
      )}
    </td>
  );
} 