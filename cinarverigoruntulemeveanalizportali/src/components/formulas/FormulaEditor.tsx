'use client';

import { useState, useEffect } from 'react';
import { FcInfo, FcRules } from 'react-icons/fc';
import { MdDelete } from 'react-icons/md';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface FormulaEditorProps {
  workspaceId: string;
  tableId: string | null;
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
    
    // Ensure we have a selected table
    if (!selectedTableId) {
      setError('Formül oluşturmak için bir tablo seçmelisiniz');
      setLoading(false);
      return;
    }
    
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
          tableId: selectedTableId  // Link the formula to the selected table
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

  // after existing state declarations, add a computed state for form availability
  const isFormAvailable = !!selectedTableId;

  // add this right before rendering the form:
  const renderNoTableWarning = () => {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <HiOutlineExclamationCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Formül oluşturmak için önce bir tablo seçmelisiniz. Formüller bir tabloya bağlı olarak çalışır.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
        <FcRules className="mr-2 h-6 w-6" />
        Formül Yönetimi
      </h2>
      
      {formulas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Mevcut Formüller</h3>
          <div className="space-y-3">
            {formulas.map(formula => (
              <div
                key={formula.id}
                className="p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{formula.name}</h4>
                    {formula.description && (
                      <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                    )}
                    <div className="mt-1 text-sm">
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs">
                        {formula.formula}
                      </code>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteFormula(formula.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Formülü sil"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isFormAvailable && renderNoTableWarning()}
      
      <div className={isFormAvailable ? "" : "opacity-50 pointer-events-none"}>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Yeni Formül Oluştur</h3>
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
    </div>
  );
} 