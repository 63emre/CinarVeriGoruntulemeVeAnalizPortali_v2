'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FcInfo, FcPlus, FcCheckmark, FcHighPriority } from 'react-icons/fc';
import { 
  generateFormulaString, 
  parseFormulaString, 
  FormulaCondition, 
  ComparisonOperator, 
  Formula
} from '@/lib/formula/formula-service';
import type { LogicalOperator } from '@/lib/formula/formula-service';
import toast from 'react-hot-toast';

// Update the Formula interface to explicitly declare createdAt
interface ExtendedFormula extends Formula {
  createdAt: string;
}

export default function FormulasPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [formulaType, setFormulaType] = useState<'CELL_VALIDATION' | 'RELATIONAL'>('CELL_VALIDATION');
  const [formulas, setFormulas] = useState<ExtendedFormula[]>([]);
  
  const [selectedFormula, setSelectedFormula] = useState<ExtendedFormula | null>(null);
  const [formulaName, setFormulaName] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');
  const [formulaColor, setFormulaColor] = useState('#ef4444');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for advanced formula building
  const [conditions, setConditions] = useState<FormulaCondition[]>([{
    operand1: '',
    arithmeticOperator: undefined,
    operand2: undefined,
    comparisonOperator: '>' as ComparisonOperator,
    operand3: '',
    isConstant: false
  }]);
  const [logicalOperators, setLogicalOperators] = useState<LogicalOperator[]>([]);
  const [formulaPreview, setFormulaPreview] = useState('');
  const [variables, setVariables] = useState<{name: string, value: string}[]>([]);
  
  // Fetch workspace data on load
  useEffect(() => {
    if (!workspaceId) return;
    
    const fetchWorkspace = async () => {
      try {
        // Get workspace data
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        if (!response.ok) throw new Error('Çalışma alanı bulunamadı');
        
        // Get formulas for this workspace
        fetchFormulas();
        
        // Get variables for this workspace
        fetchWorkspaceVariables();
      } catch (error) {
        console.error('Error fetching workspace:', error);
        toast.error('Çalışma alanı bilgileri yüklenirken hata oluştu.');
      }
    };
    
    fetchWorkspace();
  }, [workspaceId]);
  
  // Fetch formulas
  const fetchFormulas = async () => {
    if (!workspaceId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
      if (!response.ok) throw new Error('Formüller yüklenirken hata oluştu');
      
      const data = await response.json();
      setFormulas(data);
    } catch (error) {
      console.error('Error fetching formulas:', error);
      toast.error('Formüller yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch variables from workspace tables
  const fetchWorkspaceVariables = async () => {
    if (!workspaceId) return;
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tables`);
      if (!response.ok) throw new Error('Tablolar yüklenirken hata oluştu');
      
      const tables = await response.json();
      
      if (tables.length > 0) {
        // Get the first table's data to extract variables
        const tableResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tables[0].id}`);
        if (!tableResponse.ok) throw new Error('Tablo verileri yüklenirken hata oluştu');
        
        const tableData = await tableResponse.json();
        
        // Find the Variable column
        const variableColumnIndex = tableData.columns.findIndex(
          (col: string) => col.toLowerCase() === 'variable'
        );
        
        if (variableColumnIndex !== -1) {
          // Extract unique variable names
          const variableSet = new Set<string>();
          
          tableData.data.forEach((row: Array<string | number | null>) => {
            const value = row[variableColumnIndex];
            if (typeof value === 'string' && value.trim() !== '') {
              variableSet.add(value);
            }
          });
          
          // Convert to array of objects
          const variableArray = Array.from(variableSet).map(variable => ({
            name: variable,
            value: variable
          }));
          
          setVariables(variableArray);
        }
      }
    } catch (error) {
      console.error('Error fetching variables:', error);
    }
  };
  
  const arithmeticOperators = [
    { name: 'Toplama (+)', value: '+' },
    { name: 'Çıkarma (-)', value: '-' },
    { name: 'Çarpma (*)', value: '*' },
    { name: 'Bölme (/)', value: '/' },
  ];
  
  const comparisonOperators = [
    { name: 'Büyüktür (>)', value: '>' },
    { name: 'Küçüktür (<)', value: '<' },
    { name: 'Büyük veya Eşittir (≥)', value: '>=' },
    { name: 'Küçük veya Eşittir (≤)', value: '<=' },
    { name: 'Eşittir (=)', value: '==' },
    { name: 'Eşit Değildir (≠)', value: '!=' },
  ];
  
  const logicalOperatorOptions = [
    { name: 'VE', value: '&&' },
    { name: 'VEYA', value: '||' },
  ];

  // Preview formula when conditions change
  useEffect(() => {
    generateFormulaPreview();
  }, [conditions, logicalOperators]);

  const generateFormulaPreview = () => {
    if (conditions.length === 0) {
      setFormulaPreview('');
      return;
    }

    // Use the utility function from formula-service
    const formula = generateFormulaString(
      conditions.filter(c => c.operand1 && c.comparisonOperator && c.operand3),
      logicalOperators
    );
    
    setFormulaPreview(formula);
  };

  const handleConditionChange = (index: number, field: keyof FormulaCondition, value: string | boolean | undefined) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = { 
      ...updatedConditions[index], 
      [field]: value 
    };
    setConditions(updatedConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, {
      operand1: '',
      arithmeticOperator: undefined,
      operand2: undefined,
      comparisonOperator: '>' as ComparisonOperator,
      operand3: '',
      isConstant: false
    }]);
    setLogicalOperators([...logicalOperators, '&&']); // Default to AND
  };

  const removeCondition = (index: number) => {
    if (conditions.length <= 1) return;
    
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
    
    const newLogicalOperators = [...logicalOperators];
    if (index === 0 && newLogicalOperators.length > 0) {
      newLogicalOperators.splice(0, 1);
    } else if (index > 0 && index <= newLogicalOperators.length) {
      newLogicalOperators.splice(index - 1, 1);
    }
    setLogicalOperators(newLogicalOperators);
  };

  const handleLogicalOperatorChange = (index: number, value: LogicalOperator) => {
    const newLogicalOperators = [...logicalOperators];
    newLogicalOperators[index] = value;
    setLogicalOperators(newLogicalOperators);
  };

  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulaName || !formulaPreview || !workspaceId) {
      setError('Lütfen formül adını ve geçerli bir formül girişi yapın');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formulaData = {
        name: formulaName,
        description: formulaDescription,
        formula: formulaPreview,
        workspaceId,
        color: formulaColor,
        type: formulaType
      };
      
      let response;
      
      if (selectedFormula) {
        // Update existing formula
        response = await fetch(`/api/workspaces/${workspaceId}/formulas/${selectedFormula.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formulaData),
        });
      } else {
        // Create new formula
        response = await fetch(`/api/workspaces/${workspaceId}/formulas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formulaData),
        });
      }
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      // Refresh formulas list
      fetchFormulas();
      
      // Reset form
      resetForm();
      
      setSuccess('Formül başarıyla kaydedildi');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving formula:', error);
      setError('Formül kaydedilirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedFormula(null);
    setFormulaName('');
    setFormulaDescription('');
    setConditions([{
      operand1: '',
      arithmeticOperator: undefined,
      operand2: undefined,
      comparisonOperator: '>' as ComparisonOperator,
      operand3: '',
      isConstant: false
    }]);
    setLogicalOperators([]);
    setError('');
  };
  
  const toggleFormulaStatus = async (id: string, currentStatus: boolean | undefined) => {
    // Default to false if undefined
    const status = currentStatus ?? false;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !status }),
      });
      
      if (!response.ok) {
        throw new Error('Formül durumu güncellenirken hata oluştu');
      }
      
      // Update local state
      setFormulas(formulas.map(formula => 
        formula.id === id ? { ...formula, active: !status } : formula
      ));
      
      toast.success('Formül durumu güncellendi');
    } catch (error) {
      console.error('Error updating formula status:', error);
      toast.error('Formül durumu güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteFormula = async (id: string) => {
    try {
      const confirmed = window.confirm('Bu formülü silmek istediğinizden emin misiniz?');
      if (!confirmed) return;
      
      setIsLoading(true);
      
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Formül silinirken hata oluştu');
      }
      
      // Update local state
      setFormulas(formulas.filter(formula => formula.id !== id));
      
      toast.success('Formül silindi');
    } catch (error) {
      console.error('Error deleting formula:', error);
      toast.error('Formül silinirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter formulas based on the selected type
  const filteredFormulas = formulas.filter(formula => formula.type === formulaType);
  
  // Function to load a formula for editing
  const loadFormulaForEditing = (formula: ExtendedFormula) => {
    setSelectedFormula(formula);
    setFormulaName(formula.name);
    setFormulaDescription(formula.description || '');
    setFormulaColor(formula.color || '#ef4444');
    
    try {
      // Parse the formula string back into conditions and operators
      const parsed = parseFormulaString(formula.formula);
      setConditions(parsed.conditions);
      setLogicalOperators(parsed.logicalOperators);
    } catch (error) {
      console.error('Error parsing formula:', error);
      toast.error('Formül ayrıştırılırken hata oluştu');
      
      // Set as single condition as fallback
      setConditions([{
        operand1: '',
        comparisonOperator: '>' as ComparisonOperator,
        operand3: '',
        isConstant: false
      }]);
      setLogicalOperators([]);
    }
  };

  // Execute formulas against workspace data
  const runFormulas = async () => {
    if (!workspaceId) return;
    
    try {
      setIsLoading(true);
      
      // Get the table data
      const tablesResponse = await fetch(`/api/workspaces/${workspaceId}/tables`);
      if (!tablesResponse.ok) throw new Error('Tablolar yüklenirken hata oluştu');
      const tables = await tablesResponse.json();
      
      if (tables.length === 0) {
        toast.error('Formülleri çalıştıracak tablo bulunamadı');
        return;
      }
      
      // Get the first table's data
      const tableId = tables[0].id;
      const tableResponse = await fetch(`/api/workspaces/${workspaceId}/tables/${tableId}/apply-formulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formulaType: formulaType,
          formulaIds: filteredFormulas.filter(f => f.active).map(f => f.id)
        }),
      });
      
      if (!tableResponse.ok) throw new Error('Formüller uygulanırken hata oluştu');
      
      toast.success('Formüller başarıyla uygulandı');
    } catch (error) {
      console.error('Error running formulas:', error);
      toast.error(`Formülleri çalıştırırken hata: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto pb-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Formül Yönetimi
        </h1>
        
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-2 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md transition duration-200 font-medium ${
                formulaType === 'CELL_VALIDATION' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFormulaType('CELL_VALIDATION')}
            >
              Hücre Doğrulama Kuralları
            </button>
            <button
              className={`px-4 py-2 rounded-md transition duration-200 font-medium ${
                formulaType === 'RELATIONAL' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFormulaType('RELATIONAL')}
            >
              Oran & Toplam İlişkileri
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <FcHighPriority className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <FcCheckmark className="mr-2" />
            {success}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Existing Formulas List */}
          <div className="lg:col-span-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mevcut Formüller</h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {filteredFormulas.length} formül
                </span>
                {filteredFormulas.length > 0 && (
                  <button
                    onClick={runFormulas}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition"
                    disabled={isLoading}
                  >
                    Formülleri Çalıştır
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <button
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center"
                onClick={resetForm}
              >
                <FcPlus className="mr-2 bg-white rounded-full" />
                Yeni Formül Ekle
              </button>
            </div>
            
            {isLoading && formulas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Formüller yükleniyor...
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredFormulas.map(formula => (
                  <div 
                    key={formula.id} 
                    className={`p-3 rounded-md ${formula.active ? 'bg-white' : 'bg-gray-100'} border shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: formula.color || '#999' }}
                          ></span>
                          {formula.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 break-all max-h-12 overflow-hidden">
                          {formula.formula}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(formula.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className={`p-1 rounded text-xs ${formula.active ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-200'}`}
                          onClick={() => toggleFormulaStatus(formula.id, formula.active)}
                          disabled={isLoading}
                        >
                          {formula.active ? 'Etkin' : 'Pasif'}
                        </button>
                        <button 
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          onClick={() => loadFormulaForEditing(formula)}
                          disabled={isLoading}
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                        <button 
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          onClick={() => deleteFormula(formula.id)}
                          disabled={isLoading}
                        >
                          <span className="text-xs">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredFormulas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz formül oluşturulmadı
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Formula Builder */}
          <div className="lg:col-span-8 bg-white border rounded-lg p-4">
            <form onSubmit={handleCreateFormula}>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                {selectedFormula ? 'Formül Düzenle' : 'Yeni Formül Oluştur'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Başlığı *
                  </label>
                  <input
                    type="text"
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Formül için açıklayıcı bir isim girin"
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vurgulama Rengi
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      className="h-10 w-10 border-0 p-0 mr-2"
                      value={formulaColor}
                      onChange={(e) => setFormulaColor(e.target.value)}
                    />
                    <span className="text-sm text-gray-500">
                      {formulaColor}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bu formülün amacını açıklayın (opsiyonel)"
                  rows={2}
                  value={formulaDescription}
                  onChange={(e) => setFormulaDescription(e.target.value)}
                />
              </div>
              
              <div className="mt-6 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Değişken Listesi</h4>
                  <button 
                    type="button"
                    className="flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition text-xs"
                    onClick={() => {
                      toast((t) => (
                        <div className="max-w-md">
                          <h3 className="font-bold text-lg mb-2">Formül Yazımı Yardımı</h3>
                          <p className="mb-2">Değişkenler için sütunlardaki isimler kullanılır. Örneğin: [Toplam Fosfor] &gt; [Orto Fosfat]</p>
                          <p className="mb-2">Sabit değerler doğrudan sayı olarak girilebilir: [Siyanür] &gt;= 0.05</p>
                          <p className="mb-2">Parantezler ve aritmetik işlemler desteklenir: ([Katyon Toplamı] / [Anyon Toplamı]) &lt;= 9.5</p>
                          <button onClick={() => toast.dismiss(t.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Kapat</button>
                        </div>
                      ), { duration: 10000 });
                    }}
                  >
                    <FcInfo className="mr-1" />
                    <span>Yardım</span>
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto mb-4">
                  <div className="flex flex-wrap gap-2">
                    {variables.map(variable => (
                      <div 
                        key={variable.value} 
                        className="bg-white px-2 py-1 rounded border text-sm cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          // Copy to clipboard or drag-drop implementation
                          navigator.clipboard.writeText(`[${variable.value}]`);
                          toast.success(`"${variable.value}" değişkeni kopyalandı.`);
                        }}
                      >
                        {variable.name}
                      </div>
                    ))}
                    {variables.length === 0 && (
                      <div className="text-gray-500 p-2">Değişken bulunamadı</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-b py-4 mb-4">
                <h4 className="font-medium mb-3">Formül Oluşturucu</h4>
                
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={index}>
                      {index > 0 && (
                        <div className="flex items-center mb-2 pl-2">
                          <select
                            className="mr-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-sm"
                            value={logicalOperators[index-1]}
                            onChange={(e) => handleLogicalOperatorChange(index-1, e.target.value as LogicalOperator)}
                          >
                            {logicalOperatorOptions.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100"
                            onClick={() => removeCondition(index)}
                          >
                            Koşulu Kaldır
                          </button>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* First operand */}
                        <div className="flex-1 min-w-[150px]">
                          <select
                            className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={condition.operand1}
                            onChange={(e) => handleConditionChange(index, 'operand1', e.target.value)}
                          >
                            <option value="">1. Değişken Seçin</option>
                            {variables.map(variable => (
                              <option key={variable.value} value={variable.value}>
                                {variable.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Arithmetic operator */}
                        <div className="w-[80px]">
                          <select
                            className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={condition.arithmeticOperator || ''}
                            onChange={(e) => handleConditionChange(index, 'arithmeticOperator', e.target.value || undefined)}
                          >
                            <option value="">İşlem</option>
                            {arithmeticOperators.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Second operand (conditional) */}
                        {condition.arithmeticOperator && (
                          <div className="flex-1 min-w-[150px]">
                            <select
                              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={condition.operand2 || ''}
                              onChange={(e) => handleConditionChange(index, 'operand2', e.target.value || undefined)}
                            >
                              <option value="">2. Değişken Seçin</option>
                              {variables.map(variable => (
                                <option key={variable.value} value={variable.value}>
                                  {variable.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Comparison operator */}
                        <div className="w-[80px]">
                          <select
                            className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={condition.comparisonOperator}
                            onChange={(e) => handleConditionChange(index, 'comparisonOperator', e.target.value as ComparisonOperator)}
                          >
                            <option value="">Karşılaştırma</option>
                            {comparisonOperators.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Third operand with constant option */}
                        <div className="flex-1 min-w-[150px] flex gap-2">
                          {condition.isConstant ? (
                            <input
                              type="number"
                              step="0.01"
                              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Sayısal değer"
                              value={condition.operand3 || ''}
                              onChange={(e) => handleConditionChange(index, 'operand3', e.target.value)}
                            />
                          ) : (
                            <select
                              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              value={condition.operand3 || ''}
                              onChange={(e) => handleConditionChange(index, 'operand3', e.target.value)}
                            >
                              <option value="">3. Değişken Seçin</option>
                              {variables.map(variable => (
                                <option key={variable.value} value={variable.value}>
                                  {variable.name}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          <button
                            type="button"
                            className={`px-2 py-1 rounded text-xs ${
                              condition.isConstant
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                            onClick={() => handleConditionChange(index, 'isConstant', !condition.isConstant)}
                          >
                            {condition.isConstant ? 'Değişken' : 'Sabit'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <button
                      type="button"
                      className="mt-2 flex items-center text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      onClick={addCondition}
                    >
                      <FcPlus className="mr-1" />
                      Yeni Koşul Ekle
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Formula Preview */}
              <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Formül Önizleme:</h4>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  {formulaPreview || <span className="text-gray-400">Geçerli bir formül oluşturmak için yukarıdaki alanları doldurun</span>}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  İptal
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={!formulaPreview || isLoading}
                >
                  {isLoading ? (
                    <span>İşleniyor...</span>
                  ) : (
                    <>
                      <span>{selectedFormula ? 'Güncelle' : 'Kaydet'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 