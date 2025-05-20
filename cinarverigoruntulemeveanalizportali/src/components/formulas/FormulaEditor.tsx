'use client';

import { useState, useEffect } from 'react';
import { FcInfo, FcRules, FcDatabase, FcCheckmark } from 'react-icons/fc';

interface FormulaEditorProps {
  workspaceId: string;
  tableId?: string | null;
  onFormulaAdded?: (formula: Formula) => void;
}

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  color: string;
  tableId: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
}

interface Variable {
  name: string;
  values: string[];
}

type FormulaType = 'cellValidation' | 'ratioRelation';

// Yeni arayüzler
interface FormulaPart {
  id: string;
  type: 'variable' | 'operator' | 'comparison' | 'constant' | 'logic';
  value: string;
}

interface FormulaCondition {
  id: string;
  leftParts: FormulaPart[];
  comparisonOperator: FormulaPart;
  rightParts: FormulaPart[];
}

interface ComplexFormula {
  conditions: FormulaCondition[];
  logicalOperators: FormulaPart[];
}

interface TableData {
  id: string;
  name: string;
  sheetName: string;
  columns: string[];
  data: (string | number | null)[][];
}

export default function FormulaEditor({ workspaceId, tableId, onFormulaAdded }: FormulaEditorProps) {
  // Shared state
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [formulaType, setFormulaType] = useState<FormulaType>('cellValidation');
  
  // Basic formula editor state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expression, setExpression] = useState('');
  const [color, setColor] = useState('#ef4444');
  
  // Yeni kompleks formül editörü durumu
  const [complexFormula, setComplexFormula] = useState<ComplexFormula>({
    conditions: [
      {
        id: '1',
        leftParts: [
          { id: '1-1', type: 'variable', value: '' }
        ],
        comparisonOperator: { id: '1-comp', type: 'comparison', value: '>' },
        rightParts: [
          { id: '1-2', type: 'variable', value: '' }
        ]
      }
    ],
    logicalOperators: []
  });
  
  // Operatörler için sabitler
  const arithmeticOperators = ['+', '-', '*', '/'];
  const comparisonOperators = ['>', '<', '>=', '<=', '==', '!='];

  // Add with other state values in the component
  const [tables, setTables] = useState<{ id: string; name: string; sheetName: string }[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tableId || null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [showTableData, setShowTableData] = useState(false);

  // If tableId prop changes, update the selected table
  useEffect(() => {
    if (tableId) {
      setSelectedTableId(tableId);
    }
  }, [tableId]);

  // Load existing formulas and variables when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch formulas
        const formulasResponse = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (formulasResponse.ok) {
          const formulasData = await formulasResponse.json();
          setFormulas(formulasData);
        }
        
        // Fetch tables
        const tablesResponse = await fetch(`/api/workspaces/${workspaceId}/tables`);
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          setTables(tablesData);
          
          // If there are tables, get variables from the first one
          if (tablesData && tablesData.length > 0) {
            if (tableId) {
              setSelectedTableId(tableId);
            } else if (!selectedTableId) {
              setSelectedTableId(tablesData[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load formulas or tables. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [workspaceId, tableId, selectedTableId]);

  const clearBasicForm = () => {
    setName('');
    setDescription('');
    setExpression('');
    setColor('#ef4444');
  };
  
  // Kompleks formül yönetimi fonksiyonları
  const clearComplexForm = () => {
    setComplexFormula({
      conditions: [
        {
          id: '1',
          leftParts: [
            { id: '1-1', type: 'variable', value: '' }
          ],
          comparisonOperator: { id: '1-comp', type: 'comparison', value: '>' },
          rightParts: [
            { id: '1-2', type: 'variable', value: '' }
          ]
        }
      ],
      logicalOperators: []
    });
  };
  
  // Değişken eklemek için yardımcı fonksiyon
  const addVariable = (conditionId: string, side: 'left' | 'right') => {
    setComplexFormula(prev => {
      const updatedConditions = prev.conditions.map(condition => {
        if (condition.id === conditionId) {
          if (side === 'left') {
            const newPart: FormulaPart = {
              id: `${conditionId}-left-${condition.leftParts.length + 1}`,
              type: 'operator',
              value: '+'
            };
            const newVariable: FormulaPart = {
              id: `${conditionId}-left-${condition.leftParts.length + 2}`,
              type: 'variable',
              value: ''
            };
            return {
              ...condition,
              leftParts: [...condition.leftParts, newPart, newVariable]
            };
          } else {
            const newPart: FormulaPart = {
              id: `${conditionId}-right-${condition.rightParts.length + 1}`,
              type: 'operator',
              value: '+'
            };
            const newVariable: FormulaPart = {
              id: `${conditionId}-right-${condition.rightParts.length + 2}`,
              type: 'variable',
              value: ''
            };
            return {
              ...condition,
              rightParts: [...condition.rightParts, newPart, newVariable]
            };
          }
        }
        return condition;
      });
      
      return {
        ...prev,
        conditions: updatedConditions
      };
    });
  };
  
  // Değişken kaldırmak için yardımcı fonksiyon
  const removeVariable = (conditionId: string, side: 'left' | 'right') => {
    setComplexFormula(prev => {
      const updatedConditions = prev.conditions.map(condition => {
        if (condition.id === conditionId) {
          if (side === 'left' && condition.leftParts.length > 1) {
            // En son eklenen değişkeni ve operatörü kaldır
            const newParts = [...condition.leftParts];
            newParts.pop(); // Değişkeni kaldır
            if (newParts.length > 1) newParts.pop(); // Operatörü kaldır
            return {
              ...condition,
              leftParts: newParts
            };
          } else if (side === 'right' && condition.rightParts.length > 1) {
            // En son eklenen değişkeni ve operatörü kaldır
            const newParts = [...condition.rightParts];
            newParts.pop(); // Değişkeni kaldır
            if (newParts.length > 1) newParts.pop(); // Operatörü kaldır
            return {
              ...condition,
              rightParts: newParts
            };
          }
        }
        return condition;
      });
      
      return {
        ...prev,
        conditions: updatedConditions
      };
    });
  };
  
  // Yeni koşul eklemek için fonksiyon
  const addCondition = () => {
    const newConditionId = `${complexFormula.conditions.length + 1}`;
    
    // Yeni bir mantıksal operatör ekle
    const newLogicalOperator: FormulaPart = {
      id: `logic-${complexFormula.logicalOperators.length + 1}`,
      type: 'logic',
      value: 'AND'
    };
    
    // Yeni bir koşul ekle
    const newCondition: FormulaCondition = {
      id: newConditionId,
      leftParts: [
        { id: `${newConditionId}-left-1`, type: 'variable', value: '' }
      ],
      comparisonOperator: { id: `${newConditionId}-comp`, type: 'comparison', value: '>' },
      rightParts: [
        { id: `${newConditionId}-right-1`, type: 'variable', value: '' }
      ]
    };
    
    setComplexFormula(prev => ({
      conditions: [...prev.conditions, newCondition],
      logicalOperators: [...prev.logicalOperators, newLogicalOperator]
    }));
  };
  
  // Koşul silmek için fonksiyon
  const removeCondition = (conditionId: string) => {
    if (complexFormula.conditions.length <= 1) {
      return; // En az bir koşul olmalı
    }
    
    const conditionIndex = complexFormula.conditions.findIndex(c => c.id === conditionId);
    if (conditionIndex === -1) return;
    
    setComplexFormula(prev => {
      // Koşulu ve ilgili mantıksal operatörü kaldır
      const newConditions = prev.conditions.filter(c => c.id !== conditionId);
      const newLogicalOperators = [...prev.logicalOperators];
      
      // Eğer ilk koşul kaldırılıyorsa ilk mantıksal operatörü kaldır
      // Değilse, bir önceki mantıksal operatörü kaldır
      if (conditionIndex === 0 && newLogicalOperators.length > 0) {
        newLogicalOperators.shift();
      } else if (conditionIndex > 0 && newLogicalOperators.length >= conditionIndex) {
        newLogicalOperators.splice(conditionIndex - 1, 1);
      }
      
      return {
        conditions: newConditions,
        logicalOperators: newLogicalOperators
      };
    });
  };
  
  // Formül parçasının değerini değiştirmek için fonksiyon
  const updateFormulaPartValue = (
    conditionId: string, 
    partId: string, 
    newValue: string, 
    partType: 'leftParts' | 'rightParts' | 'comparisonOperator' | 'logicalOperators'
  ) => {
    if (partType === 'logicalOperators') {
      // Mantıksal operatörleri güncelle
      const logicalOperatorIndex = complexFormula.logicalOperators.findIndex(op => op.id === partId);
      if (logicalOperatorIndex === -1) return;
      
      setComplexFormula(prev => {
        const newLogicalOperators = [...prev.logicalOperators];
        newLogicalOperators[logicalOperatorIndex] = {
          ...newLogicalOperators[logicalOperatorIndex],
          value: newValue
        };
        return {
          ...prev,
          logicalOperators: newLogicalOperators
        };
      });
      return;
    }
    
    // Koşul parçalarını güncelle
    setComplexFormula(prev => {
      const updatedConditions = prev.conditions.map(condition => {
        if (condition.id === conditionId) {
          if (partType === 'comparisonOperator') {
            return {
              ...condition,
              comparisonOperator: {
                ...condition.comparisonOperator,
                value: newValue
              }
            };
          } else {
            // Parçaları güncelle (left veya right)
            const parts = [...condition[partType]];
            const partIndex = parts.findIndex(part => part.id === partId);
            if (partIndex !== -1) {
              parts[partIndex] = {
                ...parts[partIndex],
                value: newValue
              };
            }
            return {
              ...condition,
              [partType]: parts
            };
          }
        }
        return condition;
      });
      
      return {
        ...prev,
        conditions: updatedConditions
      };
    });
  };
  
  // Formülü önizleme için string'e dönüştür
  const getFormulaPreview = (): string => {
    if (complexFormula.conditions.length === 0) return '';
    
    return complexFormula.conditions.map((condition, index) => {
      // Sol taraf parçalarını birleştir
      const leftSide = condition.leftParts.map(part => {
        if (part.type === 'variable') {
          return part.value ? part.value : '?';
        }
        return part.value;
      }).join(' ');
      
      // Sağ taraf parçalarını birleştir
      const rightSide = condition.rightParts.map(part => {
        if (part.type === 'variable') {
          return part.value ? part.value : '?';
        }
        return part.value;
      }).join(' ');
      
      // Karşılaştırma operatörünü ekle
      const comparisonOp = condition.comparisonOperator.value;
      
      // Tek bir koşulu oluştur
      const singleCondition = `(${leftSide}) ${comparisonOp} (${rightSide})`;
      
      // Eğer ilk koşul değilse, mantıksal operatörü ekle
      if (index === 0) {
        return singleCondition;
      } else {
        const logicalOp = complexFormula.logicalOperators[index - 1]?.value || 'AND';
        return ` ${logicalOp} ${singleCondition}`;
      }
    }).join('');
  };

  // Formülün geçerli olup olmadığını kontrol et
  const isFormulaValid = (): boolean => {
    return complexFormula.conditions.every(condition => {
      // En az bir değişken olmalı
      const hasLeftVariable = condition.leftParts.some(part => 
        part.type === 'variable' && part.value.trim() !== '');
      
      const hasRightVariable = condition.rightParts.some(part => 
        part.type === 'variable' && part.value.trim() !== '');
      
      return hasLeftVariable && hasRightVariable;
    });
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !expression) {
      setError('Formül adı ve formül ifadesi gereklidir');
      return;
    }
    
    await saveFormula({
      name,
      description,
      formula: expression,
      color,
      type: formulaType
    });
  };
  
  const handleComplexSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('Formül adı gereklidir');
      return;
    }
    
    if (!isFormulaValid()) {
      setError('Tüm koşullar için gerekli değişkenler seçilmelidir');
      return;
    }
    
    const formulaExpression = getFormulaPreview();
    
    await saveFormula({
      name,
      description: description || `${formulaType === 'cellValidation' ? 'Hücre Doğrulama' : 'Oran ve Toplam İlişkisi'} formülü`,
      formula: formulaExpression,
      color,
      type: formulaType
    });
  };
  
  const saveFormula = async (formulaData: { 
    name: string; 
    description: string | null; 
    formula: string; 
    color: string;
    type: FormulaType;
  }) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formulaData.name,
          description: formulaData.description,
          expression: formulaData.formula,
          color: formulaData.color,
          tableId: null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Formül eklenirken bir hata oluştu');
      }
      
      const formula = await response.json();
      
      setSuccess('Formül başarıyla eklendi');
      
      // Update formulas list
      setFormulas(prev => [...prev, formula]);
      
      // Clear forms
      clearBasicForm();
      clearComplexForm();
      
      if (onFormulaAdded) {
        onFormulaAdded(formula);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFormula = async (formulaId: string) => {
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${formulaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Formül silinirken bir hata oluştu');
      }
      
      // Remove formula from list
      setFormulas(formulas.filter(f => f.id !== formulaId));
      setSuccess('Formül başarıyla silindi');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async () => {
    if (!selectedTableId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/tables/${selectedTableId}`);
      
      if (!response.ok) {
        throw new Error('Tablo verisi yüklenemedi');
      }
      
      const data = await response.json();
      setTableData(data);
      setShowTableData(true);
      
      // Find the Variable column index and update variables state
      const variableColumnIndex = data.columns.findIndex(
        (col: string) => col === 'Variable'
      );
      
      if (variableColumnIndex >= 0) {
        // Extract unique variable values
        const uniqueVariables = new Set<string>();
        data.data.forEach((row: Array<string | number>) => {
          const varValue = row[variableColumnIndex];
          if (varValue && typeof varValue === 'string') {
            uniqueVariables.add(varValue);
          }
        });
        
        // Create variables array
        setVariables([
          {
            name: 'Variable',
            values: Array.from(uniqueVariables)
          }
        ]);
        
        console.log('Found variables:', Array.from(uniqueVariables));
      } else {
        console.log('No Variable column found in data');
        setVariables([]);
      }
    } catch (err) {
      console.error('Error loading table data:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load table data automatically when selectedTableId changes
  useEffect(() => {
    if (selectedTableId) {
      loadTableData();
    }
  }, [selectedTableId]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h2 className="text-2xl font-bold">Formül Yönetimi</h2>
        <p className="text-sm opacity-80">Veri doğrulama ve tablolar arası ilişkileri tanımlayın</p>
      </div>
      
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="p-6">
          {/* Table Selector */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-3 flex items-center text-blue-800">
              <FcDatabase className="mr-2" size={24} /> 
              Tablo Seçimi
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Formül oluşturmak için hangi tablo üzerinde çalışacağınızı seçin. Seçilen tablonun değişkenlerini formüllerde kullanabilirsiniz.
            </p>
            
            {tables.length === 0 ? (
              <div className="text-orange-600 p-3 bg-orange-50 rounded-md">
                <p className="font-medium">Henüz hiç tablo bulunmuyor.</p>
                <p className="text-sm">Önce Excel dosyası yükleyerek tablo oluşturmalısınız.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tables.map(table => (
                  <div 
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`border p-3 rounded-md cursor-pointer transition ${
                      selectedTableId === table.id 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800">{table.name}</span>
                      {selectedTableId === table.id && (
                        <FcCheckmark className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Sayfa: {table.sheetName}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={loadTableData}
                disabled={!selectedTableId}
                className={`px-4 py-2 rounded-md text-sm ${
                  !selectedTableId 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Tablo Verilerini Göster
              </button>
            </div>
          </div>
          
          {/* Variables section */}
          {selectedTableId && variables.length > 0 && (
            <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold mb-3 flex items-center text-green-800">
                <FcInfo className="mr-2" size={20} />
                Kullanılabilir Değişkenler
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {variables[0]?.values.map((variable, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-green-300 rounded-md px-3 py-1 text-gray-800"
                  >
                    {variable}
                  </div>
                ))}
              </div>
              
              {variables[0]?.values.length === 0 && (
                <p className="text-gray-700">Bu tabloda kullanılabilir değişken bulunamadı.</p>
              )}
            </div>
          )}
          
          {/* Table Data Display (Show/Hide) */}
          {tableData && showTableData && (
            <div className="mb-6 overflow-x-auto border rounded-lg">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{tableData.name} - Veriler</h3>
                <button 
                  onClick={() => setShowTableData(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Gizle
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableData.columns.map((col: string, index: number) => (
                      <th 
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.data.slice(0, 5).map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: any, cellIndex: number) => (
                        <td 
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {cell !== null ? String(cell) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {Array.isArray(tableData.data) && tableData.data.length > 5 && (
                <div className="p-3 text-center text-gray-600 bg-gray-50 border-t">
                  <span>Toplam {tableData.data.length} satırdan ilk 5 tanesi gösteriliyor</span>
                </div>
              )}
            </div>
          )}
          
          {/* Formül Tipi Seçimi */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center text-gray-800">
              <FcRules className="mr-2" />
              Formül Tipi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div
                onClick={() => setFormulaType('cellValidation')}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  formulaType === 'cellValidation' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <h4 className="font-medium mb-1 text-gray-800">Hücre Doğrulama</h4>
                <p className="text-sm text-gray-700">
                  Tablo içindeki değerlerin geçerliliğini kontrol etmek için kullanılır.
                  Örn: pH değeri 0-14 arasında olmalı
                </p>
              </div>
              
              <div
                onClick={() => setFormulaType('ratioRelation')}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  formulaType === 'ratioRelation' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <h4 className="font-medium mb-1 text-gray-800">Oran ve Toplam İlişkisi</h4>
                <p className="text-sm text-gray-700">
                  Tablodaki değerler arasındaki matematiksel ilişkileri kontrol etmek için kullanılır.
                  Örn: Toplam değer, bileşenlerinin toplamına eşit olmalı
                </p>
              </div>
            </div>
          </div>
          
          {/* Formül Editörü */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 text-gray-800">Yeni Formül Oluştur</h3>
            
            <form onSubmit={formulaType === 'cellValidation' ? handleBasicSubmit : handleComplexSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Adı
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-gray-800"
                    placeholder="Formül adı girin"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vurgulama Rengi
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-10 border-0 p-0 mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      Formül geçersiz olduğunda kullanılacak renk
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-800"
                  rows={2}
                  placeholder="Formül için açıklama girin (opsiyonel)"
                />
              </div>
              
              {/* Formula inputs based on type */}
              {formulaType === 'cellValidation' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül İfadesi
                  </label>
                  <div className="p-4 bg-white border rounded-md">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {variables.length > 0 && variables[0].values.map((varName, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setExpression(prev => prev + ` [${varName}]`)}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200"
                        >
                          {varName}
                        </button>
                      ))}
                      {variables.length === 0 && (
                        <div className="text-amber-600 text-sm">
                          Değişken bulunamadı. Lütfen önce bir tablo seçin ve yükleyin.
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['>', '<', '>=', '<=', '==', '!='].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setExpression(prev => prev + ` ${op} `)}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm hover:bg-purple-200"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['+', '-', '*', '/'].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setExpression(prev => prev + ` ${op} `)}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm hover:bg-green-200"
                        >
                          {op}
                        </button>
                      ))}
                      {['&&', '||'].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setExpression(prev => prev + ` ${op} `)}
                          className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm hover:bg-amber-200"
                        >
                          {op}
                        </button>
                      ))}
                      {['(', ')'].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setExpression(prev => prev + op)}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm hover:bg-gray-200"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    
                    <textarea
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md font-mono text-gray-800 bg-gray-50"
                      rows={3}
                      placeholder="Örn: [Toplam Fosfor] > [Orto Fosfat] || [pH] < 7"
                    />
                    
                    <div className="mt-2 text-xs text-gray-600">
                      Değişkenler köşeli parantez içinde yazılmalıdır. Örn: [Değişken Adı]
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karmaşık Formül Oluşturucu
                  </label>
                  <div className="p-4 bg-white border rounded-md">
                    <div className="text-sm text-gray-700 mb-3">
                      Bu modda karmaşık formüller oluşturabilirsiniz. Her bir koşul için, değişkenler, operatörler ve sabitleri seçin.
                    </div>
                    
                    {/* Demo formula builder for now */}
                    <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select 
                          className="p-2 border rounded text-gray-800"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setExpression(prev => {
                                const parts = prev.split(' ');
                                parts[0] = `[${value}]`;
                                return parts.join(' ');
                              });
                            }
                          }}
                        >
                          <option value="">Değişken Seç</option>
                          {variables.length > 0 && variables[0].values.map((varName, idx) => (
                            <option key={idx} value={varName}>{varName}</option>
                          ))}
                        </select>
                        
                        <select 
                          className="p-2 border rounded text-gray-800"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setExpression(prev => {
                                const parts = prev.split(' ');
                                parts[1] = value;
                                return parts.join(' ');
                              });
                            }
                          }}
                        >
                          <option value="">Operatör Seç</option>
                          {['>', '<', '>=', '<=', '==', '!='].map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                        
                        <select 
                          className="p-2 border rounded text-gray-800"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setExpression(prev => {
                                const parts = prev.split(' ');
                                parts[2] = `[${value}]`;
                                return parts.join(' ');
                              });
                            }
                          }}
                        >
                          <option value="">Değişken Seç</option>
                          {variables.length > 0 && variables[0].values.map((varName, idx) => (
                            <option key={idx} value={varName}>{varName}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mt-3 flex justify-center">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Sabit Değer"
                          className="p-2 border rounded text-gray-800 w-40"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              setExpression(prev => {
                                const parts = prev.split(' ');
                                parts[2] = value;
                                return parts.join(' ');
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <textarea
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md font-mono text-gray-800 bg-gray-50"
                      rows={3}
                      placeholder="Yukarıdaki seçimlere göre oluşturulan formül burada görünecek"
                    />
                  </div>
                </div>
              )}
                
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                <div className="flex items-start">
                  <FcInfo className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Formül Önizleme</p>
                    <pre className="mt-2 bg-white p-2 rounded border border-gray-200 text-sm overflow-x-auto text-gray-800">
                      {expression || 'Formül oluşturulmadı'}
                    </pre>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !expression || !name}
                  className={`px-4 py-2 rounded-md ${
                    loading || !expression || !name
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'İşleniyor...' : 'Formülü Kaydet'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Existing formulas */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-800">Mevcut Formüller</h3>
            
            {formulas.length === 0 ? (
              <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
                Henüz oluşturulmuş formül bulunmuyor.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {formulas.map(formula => (
                  <div 
                    key={formula.id}
                    className="border rounded-md p-4 hover:border-blue-300 transition bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{formula.name}</h4>
                        {formula.description && (
                          <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => deleteFormula(formula.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-1">Formül:</div>
                      <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto text-gray-800">
                        {formula.formula}
                      </pre>
                    </div>
                    
                    <div className="mt-2 flex items-center">
                      <div 
                        className="h-4 w-4 rounded-full mr-2" 
                        style={{ backgroundColor: formula.color || '#ef4444' }}
                      ></div>
                      <span className="text-xs text-gray-600">
                        {formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'Oran/Toplam İlişkisi'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 