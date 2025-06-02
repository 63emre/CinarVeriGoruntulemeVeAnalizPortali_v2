/**
 * Test utility for formula evaluation
 * 
 * This file contains test functions to verify the formula evaluator functionality
 */

import { evaluateFormulasWithDataRows } from '../enhancedFormulaEvaluator';

// Test data
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

const testColumns = ['Variable', 'id', 'Nisan 22', 'Mayıs 22', 'Haziran 22'];

// Run the test
export function testFormulaEvaluator() {
  console.log('Running formula evaluator test...');
  
  try {
    const highlightedCells = evaluateFormulasWithDataRows(testFormulas, testData, testColumns);
    
    console.log('Formula evaluation completed successfully.');
    console.log(`Generated ${highlightedCells.length} highlighted cells:`);
    console.log(JSON.stringify(highlightedCells, null, 2));
    
    // Verify specific test cases
    const nisanIletkenlikCell = highlightedCells.find(
      cell => cell.row === 'row-1' && cell.col === 'Nisan 22'
    );
    
    if (nisanIletkenlikCell) {
      console.log('✓ Found highlighted cell for İletkenlik in Nisan 22');
      console.log('  Formula IDs:', nisanIletkenlikCell.formulaIds);
      console.log('  Message:', nisanIletkenlikCell.message);
      
      if (nisanIletkenlikCell.formulaDetails) {
        console.log('  Left Result:', nisanIletkenlikCell.formulaDetails[0]?.leftResult);
        console.log('  Right Result:', nisanIletkenlikCell.formulaDetails[0]?.rightResult);
      }
    } else {
      console.log('✗ Failed to find highlighted cell for İletkenlik in Nisan 22');
    }
    
    // Check if the complex formula was evaluated correctly
    const complexFormulaCell = highlightedCells.find(
      cell => cell.formulaIds.includes('3')
    );
    
    if (complexFormulaCell) {
      console.log('✓ Complex formula was evaluated correctly');
      const formulaDetail = complexFormulaCell.formulaDetails?.find(f => f.id === '3');
      if (formulaDetail) {
        console.log('  Left Expression:', formulaDetail.leftResult);
        console.log('  Right Expression:', formulaDetail.rightResult);
      }
    } else {
      console.log('✗ Complex formula was not evaluated correctly');
    }
    
    return highlightedCells;
  } catch (error) {
    console.error('Error during formula evaluation test:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFormulaEvaluator();
}