'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import DataTable from '@/components/tables/DataTable';
import { evaluateFormulasWithDataRows } from '@/lib/enhancedFormulaEvaluator';

// Define the HighlightedCell interface
interface HighlightedCell {
  row: string;
  col: string;
  color: string;
  message: string;
  formulaIds: string[];
  formulaDetails?: {
    id: string;
    name: string;
    formula: string;
    leftResult?: number;
    rightResult?: number;
  }[];
}

// Test formulas for validation and system testing
const testFormulas = [
  {
    id: '1',
    name: 'İletkenlik > Alkalinite',
    description: 'İletkenlik değeri Alkalinite değerinden büyükse hücreyi vurgula',
    formula: 'İletkenlik > Alkalinite Tayini',
    color: '#ff9900',
    tableId: 'table1',
    workspaceId: 'workspace1',
    type: 'CELL_VALIDATION' as const,
    active: true
  },
  {
    id: '2',
    name: 'Toplam Fosfor > Orto Fosfat',
    description: 'Toplam Fosfor değeri Orto Fosfat değerinden büyükse hücreyi vurgula',
    formula: 'Toplam Fosfor > Orto Fosfat',
    color: '#00cc99',
    tableId: 'table1',
    workspaceId: 'workspace1',
    type: 'CELL_VALIDATION' as const,
    active: true
  },
  {
    id: '3',
    name: 'Karmaşık Formül',
    description: 'Birden fazla değişken ve işlem içeren formül',
    formula: '(İletkenlik + Toplam Fosfor) > (Orto Fosfat * 2 + Alkalinite Tayini)',
    color: '#cc00ff',
    tableId: 'table1',
    workspaceId: 'workspace1',
    type: 'CELL_VALIDATION' as const,
    active: true
  }
];

const testData = [
  {
    id: 'row-1',
    'Variable': 'İletkenlik',
    'Nisan 22': 374,
    'Mayıs 22': 390,
    'Haziran 22': 405
  },
  {
    id: 'row-2',
    'Variable': 'Alkalinite Tayini',
    'Nisan 22': 170.4,
    'Mayıs 22': 180.5,
    'Haziran 22': 410
  },
  {
    id: 'row-3',
    'Variable': 'Toplam Fosfor',
    'Nisan 22': 0.05,
    'Mayıs 22': 0.06,
    'Haziran 22': 0.07
  },
  {
    id: 'row-4',
    'Variable': 'Orto Fosfat',
    'Nisan 22': 0.01,
    'Mayıs 22': 0.01,
    'Haziran 22': 0.02
  }
];

const testColumns = [
  { id: 'Variable', name: 'Değişken', type: 'string' },
  { id: 'Nisan 22', name: 'Nisan 22', type: 'number' },
  { id: 'Mayıs 22', name: 'Mayıs 22', type: 'number' },
  { id: 'Haziran 22', name: 'Haziran 22', type: 'number' }
];

export default function FormulaTestPage() {
  const [highlightedCells, setHighlightedCells] = useState<HighlightedCell[]>([]);
  const [activeFormulas, setActiveFormulas] = useState(testFormulas);

  // Evaluate formulas when component mounts or active formulas change
  useEffect(() => {
    try {
      const result = evaluateFormulasWithDataRows(
        activeFormulas,
        testData,
        testColumns.map(col => col.id)
      );
      setHighlightedCells(result);
    } catch (error) {
      console.error('Error evaluating formulas:', error);
    }
  }, [activeFormulas]);

  // Toggle formula active state
  const toggleFormula = (formulaId: string) => {
    setActiveFormulas(prevFormulas => 
      prevFormulas.map(formula => 
        formula.id === formulaId 
          ? { ...formula, active: !formula.active } 
          : formula
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Formül Renklendirme Test Sayfası</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Aktif Formüller</h2>
        <div className="space-y-2">
          {testFormulas.map(formula => (
            <div 
              key={formula.id} 
              className="flex items-center p-3 border rounded-lg"
              style={{ borderLeftColor: formula.color, borderLeftWidth: '4px' }}
            >
              <input
                type="checkbox"
                checked={activeFormulas.find(f => f.id === formula.id)?.active || false}
                onChange={() => toggleFormula(formula.id)}
                className="mr-3 h-5 w-5"
              />
              <div>
                <div className="font-medium">{formula.name}</div>
                <div className="text-sm text-gray-500">{formula.formula}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Test Verisi</h2>
        <DataTable
          data={testData}
          columns={testColumns}
          title="Formül Test Tablosu"
          highlightedCells={highlightedCells}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Vurgulanan Hücreler</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {JSON.stringify(highlightedCells, null, 2)}
        </pre>
      </div>
    </div>
  );
} 