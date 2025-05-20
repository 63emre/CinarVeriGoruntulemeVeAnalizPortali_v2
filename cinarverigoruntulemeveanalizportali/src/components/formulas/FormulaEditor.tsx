'use client';

import { useState, useEffect } from 'react';
import { FcAddRow, FcInfo, FcRules } from 'react-icons/fc';

interface FormulaEditorProps {
  workspaceId: string;
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

export default function FormulaEditor({ workspaceId, onFormulaAdded }: FormulaEditorProps) {
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
        
        // Fetch variables from tables
        const tablesResponse = await fetch(`/api/workspaces/${workspaceId}/tables`);
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          
          if (tablesData && tablesData.length > 0) {
            // Get first table to extract variables
            const firstTableId = tablesData[0].id;
            const tableDataResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${firstTableId}`);
            
            if (tableDataResponse.ok) {
              const tableData = await tableDataResponse.json();
              
              // Find the Variable column index
              const variableColumnIndex = tableData.columns.findIndex(
                (col: string) => col === 'Variable'
              );
              
              if (variableColumnIndex >= 0) {
                // Extract unique variable values
                const uniqueVariables = new Set<string>();
                tableData.data.forEach((row: Array<string | number>) => {
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
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [workspaceId]);

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Formül Yönetimi</h1>
        
        <div className="mb-6">
          <label htmlFor="formulaType" className="block text-sm font-medium text-gray-700 mb-1">
            Formül Tipi:
          </label>
          <div className="relative inline-block w-64">
            <select
              id="formulaType"
              value={formulaType}
              onChange={(e) => setFormulaType(e.target.value as FormulaType)}
              className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cellValidation">Hücre Doğrulama Kuralları</option>
              <option value="ratioRelation">İlişkisel Toplam ve Oran Kuralları</option>
            </select>
          </div>
          
          <div className="float-right">
            <button
              type="button"
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md inline-flex items-center"
            >
              <FcInfo className="mr-2" />
              Formül Yardımı
            </button>
          </div>
        </div>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Formül listesi */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center border-b pb-2">
            <FcRules className="mr-2" />
            {formulaType === 'cellValidation' ? 'Hücre Doğrulama Kuralları' : 'Oran ve Toplam İlişkileri'}
          </h2>
          
          {loading && formulas.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
            </div>
          ) : formulas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz formül yok. Sağdaki form ile ekleyebilirsiniz.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {formulas
                .filter(formula => formula.description?.includes(formulaType === 'cellValidation' ? 'Hücre Doğrulama' : 'Oran ve Toplam'))
                .map(formula => (
                  <li key={formula.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{formula.name}</h3>
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">
                          {formula.formula}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: formula.color }}
                        ></div>
                        <button
                          onClick={() => deleteFormula(formula.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
        
        {/* Sağ Kolon - Formül editörü */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FcAddRow className="mr-2 h-6 w-6" />
              Yeni {formulaType === 'cellValidation' ? 'Hücre Doğrulama' : 'Oran ve İlişki'} Formülü Ekle
            </h2>
            
            {/* Formül Adı ve Açıklama alanları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Formül Adı
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Fosfor Kontrol"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Kısa bir açıklama"
                />
              </div>
            </div>
            
            {/* Temel formül editörü */}
            {formulaType === 'cellValidation' && (
              <form onSubmit={handleBasicSubmit}>
                <div>
                  <label htmlFor="expression" className="block text-sm font-medium text-gray-700 mb-1">
                    Formül İfadesi
                  </label>
                  <textarea
                    id="expression"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="Örn: [Toplam Fosfor] > [Orto Fosfat]"
                    rows={4}
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    Değişken isimleri köşeli parantez içinde olmalıdır. Örn: [Değişken Adı]
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Renk
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-10 mr-2 border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-500">
                      Seçilen renk: {color}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={clearBasicForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loading}
                  >
                    Temizle
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </span>
                    ) : (
                      "Kaydet"
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {/* Gelişmiş (Dropdown-tabanlı) formül editörü */}
            {formulaType === 'ratioRelation' && (
              <form onSubmit={handleComplexSubmit}>
                {/* Formül Koşulları */}
                {complexFormula.conditions.map((condition, conditionIndex) => (
                  <div key={condition.id} className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-semibold text-gray-700">
                        {conditionIndex === 0 ? "Koşul" : `Koşul ${conditionIndex + 1}`}
                      </h3>
                      
                      {complexFormula.conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCondition(condition.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Mantıksal Operatör (AND/OR) */}
                    {conditionIndex > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mantıksal Bağlayıcı
                        </label>
                        <select
                          value={complexFormula.logicalOperators[conditionIndex - 1]?.value || 'AND'}
                          onChange={(e) => updateFormulaPartValue(
                            condition.id,
                            complexFormula.logicalOperators[conditionIndex - 1]?.id || '',
                            e.target.value,
                            'logicalOperators'
                          )}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="AND">VE (AND)</option>
                          <option value="OR">VEYA (OR)</option>
                        </select>
                      </div>
                    )}
                    
                    {/* Sol Taraf - İlk operand ve aritmetik işlemler */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sol Taraf
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {condition.leftParts.map((part) => (
                          <div key={part.id} className="flex items-center">
                            {part.type === 'variable' ? (
                              <select
                                value={part.value}
                                onChange={(e) => updateFormulaPartValue(
                                  condition.id,
                                  part.id,
                                  e.target.value,
                                  'leftParts'
                                )}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Değişken Seçin</option>
                                {variables[0]?.values.map(variable => (
                                  <option key={variable} value={variable}>{variable}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={part.value}
                                onChange={(e) => updateFormulaPartValue(
                                  condition.id,
                                  part.id,
                                  e.target.value,
                                  'leftParts'
                                )}
                                className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                {arithmeticOperators.map(op => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                        
                        {/* Değişken Ekle/Çıkar Butonları */}
                        <div className="ml-2 flex space-x-1">
                          <button
                            type="button"
                            onClick={() => addVariable(condition.id, 'left')}
                            className="bg-blue-100 text-blue-800 p-2 rounded-md hover:bg-blue-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          {condition.leftParts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariable(condition.id, 'left')}
                              className="bg-red-100 text-red-800 p-2 rounded-md hover:bg-red-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Karşılaştırma Operatörü */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Karşılaştırma
                      </label>
                      <select
                        value={condition.comparisonOperator.value}
                        onChange={(e) => updateFormulaPartValue(
                          condition.id,
                          condition.comparisonOperator.id,
                          e.target.value,
                          'comparisonOperator'
                        )}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {comparisonOperators.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Sağ Taraf - İkinci operand ve aritmetik işlemler */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sağ Taraf
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {condition.rightParts.map((part) => (
                          <div key={part.id} className="flex items-center">
                            {part.type === 'variable' ? (
                              <select
                                value={part.value}
                                onChange={(e) => updateFormulaPartValue(
                                  condition.id,
                                  part.id,
                                  e.target.value,
                                  'rightParts'
                                )}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Değişken Seçin</option>
                                {variables[0]?.values.map(variable => (
                                  <option key={variable} value={variable}>{variable}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={part.value}
                                onChange={(e) => updateFormulaPartValue(
                                  condition.id,
                                  part.id,
                                  e.target.value,
                                  'rightParts'
                                )}
                                className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                {arithmeticOperators.map(op => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                        
                        {/* Değişken Ekle/Çıkar Butonları */}
                        <div className="ml-2 flex space-x-1">
                          <button
                            type="button"
                            onClick={() => addVariable(condition.id, 'right')}
                            className="bg-blue-100 text-blue-800 p-2 rounded-md hover:bg-blue-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          {condition.rightParts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariable(condition.id, 'right')}
                              className="bg-red-100 text-red-800 p-2 rounded-md hover:bg-red-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Yeni Koşul Ekle Butonu */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={addCondition}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Koşul Ekle
                  </button>
                </div>
                
                {/* Formül Önizleme */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formül Önizleme
                  </label>
                  <div className="font-mono text-gray-800 bg-white p-3 border border-gray-300 rounded-md min-h-[60px]">
                    {getFormulaPreview() || 'Formül henüz tamamlanmadı...'}
                  </div>
                </div>
                
                {/* Renk Seçici */}
                <div className="mb-6">
                  <label htmlFor="complexColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Vurgulama Rengi
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="complexColor"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-10 mr-2 border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-500">
                      Seçilen renk: {color}
                    </span>
                  </div>
                </div>
                
                {/* Form Butonları */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearBasicForm();
                      clearComplexForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loading}
                  >
                    Temizle
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </span>
                    ) : (
                      "Formül Oluştur"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 