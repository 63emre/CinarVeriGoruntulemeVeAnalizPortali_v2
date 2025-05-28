'use client';

import React, { useState, useEffect } from 'react';
import { FcRules, FcPlus, FcSettings, FcApproval, FcHighPriority, FcSearch } from 'react-icons/fc';
import { FiEdit, FiEye, FiTrash2, FiSave, FiX, FiFilter } from 'react-icons/fi';

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  color: string;
  active: boolean;
  tableId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Table {
  id: string;
  name: string;
  sheetName: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface Variable {
  name: string;
  type: 'numeric' | 'text';
  unit?: string;
}

interface FormulaManagementPageProps {
  workspaceId: string;
}

// ENHANCED: Improved Formula Editor with better UI
const EnhancedFormulaEditor = ({ 
  variables, 
  onFormulaChange, 
  initialFormula,
  readOnly = false
}: {
  variables: Variable[];
  onFormulaChange?: (formula: string, valid: boolean) => void;
  initialFormula?: string;
  readOnly?: boolean;
}) => {
  const [formula, setFormula] = useState(initialFormula || '');
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  const validateFormula = (formulaText: string) => {
    if (!formulaText.trim()) {
      setIsValid(false);
      setValidationMessage('Formül boş olamaz');
      return false;
    }

    // Basic validation for formula structure
    const hasComparison = /[><=!]+/.test(formulaText);
    if (!hasComparison) {
      setIsValid(false);
      setValidationMessage('Formül bir karşılaştırma operatörü içermelidir (>, <, >=, <=, ==)');
      return false;
    }

    setIsValid(true);
    setValidationMessage('');
    return true;
  };

  const handleFormulaChange = (value: string) => {
    setFormula(value);
    const valid = validateFormula(value);
    if (onFormulaChange) {
      onFormulaChange(value, valid);
    }
  };

  const insertVariable = (varName: string) => {
    if (readOnly) return;
    const newFormula = formula + `[${varName}]`;
    handleFormulaChange(newFormula);
  };

  const insertOperator = (operator: string) => {
    if (readOnly) return;
    const newFormula = formula + ` ${operator} `;
    handleFormulaChange(newFormula);
  };

  return (
    <div className="space-y-4">
      {/* ENHANCED: Formula Input with better styling */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formül İfadesi
        </label>
        <textarea
          className={`w-full p-3 border-2 rounded-lg font-mono text-sm transition-colors ${
            isValid 
              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
              : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
          }`}
          placeholder="Örn: [İletkenlik] + [Toplam Fosfor] > [Orto Fosfat] - [Alkalinite Tayini]"
          value={formula}
          onChange={(e) => handleFormulaChange(e.target.value)}
          readOnly={readOnly}
          rows={3}
        />
        {!isValid && validationMessage && (
          <p className="text-red-600 text-xs mt-1">{validationMessage}</p>
        )}
      </div>

      {!readOnly && (
        <>
          {/* ENHANCED: Variable Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Değişken Ekle
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {variables.map(variable => (
                <button
                  key={variable.name}
                  onClick={() => insertVariable(variable.name)}
                  className="text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                  title={`${variable.name} ekle`}
                >
                  {variable.name}
                </button>
              ))}
            </div>
          </div>

          {/* ENHANCED: Operator Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operatör Ekle
            </label>
            <div className="flex flex-wrap gap-2">
              {['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!=', 'AND', 'OR'].map(op => (
                <button
                  key={op}
                  onClick={() => insertOperator(op)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-mono transition-colors"
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* ENHANCED: Formula Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Örnek Formüller:</h4>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="font-mono bg-blue-100 p-1 rounded">[İletkenlik] &gt; 300</div>
              <div className="font-mono bg-blue-100 p-1 rounded">[İletkenlik] + [Toplam Fosfor] &gt; [Orto Fosfat]</div>
              <div className="font-mono bg-blue-100 p-1 rounded">[pH] &gt;= 7 AND [pH] &lt;= 8.5</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function FormulaManagementPage({ workspaceId }: FormulaManagementPageProps) {
  // State management
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter states
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(workspaceId);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'CELL_VALIDATION' | 'RELATIONAL'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);

  // Form states
  const [formulaName, setFormulaName] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');
  const [formulaType, setFormulaType] = useState<'CELL_VALIDATION' | 'RELATIONAL'>('CELL_VALIDATION');
  const [formulaColor, setFormulaColor] = useState('#3b82f6');
  const [formulaActive, setFormulaActive] = useState(true);
  const [formulaExpression, setFormulaExpression] = useState('');
  const [isFormulaValid, setIsFormulaValid] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchWorkspaces();
    fetchFormulas();
  }, [selectedWorkspace]);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchTables();
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    if (selectedTable) {
      fetchVariables();
    }
  }, [selectedWorkspace, selectedTable]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (!response.ok) throw new Error('Çalışma alanları yüklenirken bir hata oluştu');
      const data = await response.json();
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError((err as Error).message);
    }
  };

  const fetchTables = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables`);
      if (!response.ok) throw new Error('Tablolar yüklenirken bir hata oluştu');
      const data = await response.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormulas = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas`);
      if (!response.ok) throw new Error('Formüller yüklenirken bir hata oluştu');
      const data = await response.json();
      setFormulas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching formulas:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariables = async () => {
    if (!selectedWorkspace || !selectedTable) return;
    
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables/${selectedTable}`);
      if (!response.ok) throw new Error('Değişkenler yüklenirken bir hata oluştu');
      const data = await response.json();
      
      // Extract variables from the table data
      const variableColumnIndex = data.columns.findIndex((col: string) => col === 'Variable');
      let extractedVariables: Variable[] = [];
      
      if (variableColumnIndex !== -1) {
        const uniqueVars = new Set<string>();
        data.data.forEach((row: (string | number | null)[]) => {
          const varValue = row[variableColumnIndex];
          if (varValue && typeof varValue === 'string' && varValue.trim() !== '') {
            uniqueVars.add(varValue);
          }
        });
        
        extractedVariables = Array.from(uniqueVars).map(varName => ({
          name: varName,
          type: 'numeric' as const,
          unit: 'mg/L'
        }));
      }
      
      setVariables(extractedVariables);
    } catch (err) {
      console.error('Error fetching variables:', err);
      setError((err as Error).message);
    }
  };

  const handleCreateFormula = async () => {
    if (!isFormulaValid || !formulaName.trim() || !formulaExpression.trim()) {
      setError('Lütfen tüm gerekli alanları doldurun ve geçerli bir formül oluşturun.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formulaName,
          description: formulaDescription || null,
          formula: formulaExpression,
          type: formulaType,
          color: formulaColor,
          active: formulaActive,
          tableId: selectedTable || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Formül oluşturulurken bir hata oluştu');
      }

      const newFormula = await response.json();
      setFormulas([...formulas, newFormula]);
      
      // Reset form
      resetForm();
      setShowCreateModal(false);
      setSuccess('Formül başarıyla oluşturuldu');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating formula:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormula = async () => {
    if (!editingFormula || !isFormulaValid || !formulaName.trim() || !formulaExpression.trim()) {
      setError('Lütfen tüm gerekli alanları doldurun ve geçerli bir formül oluşturun.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas/${editingFormula.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formulaName,
          description: formulaDescription || null,
          formula: formulaExpression,
          type: formulaType,
          color: formulaColor,
          active: formulaActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Formül güncellenirken bir hata oluştu');
      }

      const updatedFormula = await response.json();
      setFormulas(formulas.map(f => f.id === updatedFormula.id ? updatedFormula : f));
      
      // Reset form
      resetForm();
      setShowEditModal(false);
      setEditingFormula(null);
      setSuccess('Formül başarıyla güncellendi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating formula:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas/${formulaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Formül silinirken bir hata oluştu');
      }

      setFormulas(formulas.filter(f => f.id !== formulaId));
      setSuccess('Formül başarıyla silindi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting formula:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormulaName('');
    setFormulaDescription('');
    setFormulaType('CELL_VALIDATION');
    setFormulaColor('#3b82f6');
    setFormulaActive(true);
    setFormulaExpression('');
    setIsFormulaValid(false);
  };

  const openEditModal = (formula: Formula) => {
    setEditingFormula(formula);
    setFormulaName(formula.name);
    setFormulaDescription(formula.description || '');
    setFormulaType(formula.type);
    setFormulaColor(formula.color);
    setFormulaActive(formula.active);
    setFormulaExpression(formula.formula);
    setShowEditModal(true);
  };

  const openViewModal = (formula: Formula) => {
    setEditingFormula(formula);
    setShowViewModal(true);
  };

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (formula.description && formula.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && formula.active) ||
                         (statusFilter === 'inactive' && !formula.active);
    const matchesType = typeFilter === 'all' || formula.type === typeFilter;
    const matchesTable = !selectedTable || formula.tableId === selectedTable;

    return matchesSearch && matchesStatus && matchesType && matchesTable;
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FcRules className="mr-3 h-8 w-8" />
          Gelişmiş Formül Yönetimi
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
        >
          <FcPlus className="mr-2" />
          Yeni Formül Oluştur
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <FcHighPriority className="h-5 w-5 mr-2" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-700 hover:text-red-900">
              <FiX />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <FcApproval className="h-5 w-5 mr-2" />
            <p className="text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-700 hover:text-green-900">
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiFilter className="mr-2" />
          Filtreler
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Alanı
            </label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Tümü</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tablo
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={!selectedWorkspace}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Tümü</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
                                      <select               value={statusFilter}               onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}               className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"             >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip
            </label>
            <select
              value={typeFilter}
                             onChange={(e) => setTypeFilter(e.target.value as 'all' | 'CELL_VALIDATION' | 'RELATIONAL')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="all">Tümü</option>
              <option value="CELL_VALIDATION">Hücre Doğrulama</option>
              <option value="RELATIONAL">İlişkisel</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ara
          </label>
          <div className="relative">
            <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Formül adı veya açıklamasında ara..."
              className="w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Formulas Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Formüller ({filteredFormulas.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="text-center py-12">
            <FcRules className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Formül bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Filtreleri değiştirmeyi deneyin veya yeni bir formül oluşturun.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formül
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tablo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renk
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Güncelleme
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFormulas.map((formula) => {
                  const table = tables.find(t => t.id === formula.tableId);
                  
                  return (
                    <tr key={formula.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formula.name}</div>
                          {formula.description && (
                            <div className="text-sm text-gray-500">{formula.description}</div>
                          )}
                          <div className="text-xs text-gray-400 font-mono mt-1">
                            {formula.formula.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişkisel'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formula.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FcApproval className="mr-1" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FcHighPriority className="mr-1" />
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table ? table.name : 'Genel'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="h-6 w-6 rounded-full mr-2" 
                            style={{ backgroundColor: formula.color }}
                          ></div>
                          <span className="text-xs text-gray-600">{formula.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(formula.updatedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openViewModal(formula)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Görüntüle"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(formula)}
                            className="text-green-600 hover:text-green-900"
                            title="Düzenle"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFormula(formula.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center">
                <FcPlus className="mr-2" />
                Yeni Formül Oluştur
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Adı *
                  </label>
                  <input
                    type="text"
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Formül adını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip
                  </label>
                  <select
                    value={formulaType}
                    onChange={(e) => setFormulaType(e.target.value as 'CELL_VALIDATION' | 'RELATIONAL')}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="CELL_VALIDATION">Hücre Doğrulama</option>
                    <option value="RELATIONAL">İlişkisel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renk
                  </label>
                  <input
                    type="color"
                    value={formulaColor}
                    onChange={(e) => setFormulaColor(e.target.value)}
                    className="w-full h-10 border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formulaActive}
                    onChange={(e) => setFormulaActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Aktif formül
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formulaDescription}
                  onChange={(e) => setFormulaDescription(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Formül açıklamasını girin"
                />
              </div>

              {/* Enhanced Formula Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formül İfadesi *
                </label>
                <EnhancedFormulaEditor
                  variables={variables}
                  onFormulaChange={(formula, valid) => {
                    setFormulaExpression(formula);
                    setIsFormulaValid(valid);
                  }}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleCreateFormula}
                disabled={!isFormulaValid || !formulaName.trim() || loading}
                className={`px-4 py-2 rounded-md ${
                  isFormulaValid && formulaName.trim() && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                <FiSave className="inline mr-1" />
                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFormula && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center">
                <FcSettings className="mr-2" />
                Formül Düzenle: {editingFormula.name}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Adı *
                  </label>
                  <input
                    type="text"
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Formül adını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip
                  </label>
                  <select
                    value={formulaType}
                    onChange={(e) => setFormulaType(e.target.value as 'CELL_VALIDATION' | 'RELATIONAL')}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="CELL_VALIDATION">Hücre Doğrulama</option>
                    <option value="RELATIONAL">İlişkisel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renk
                  </label>
                  <input
                    type="color"
                    value={formulaColor}
                    onChange={(e) => setFormulaColor(e.target.value)}
                    className="w-full h-10 border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={formulaActive}
                    onChange={(e) => setFormulaActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="edit-active" className="ml-2 text-sm text-gray-700">
                    Aktif formül
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formulaDescription}
                  onChange={(e) => setFormulaDescription(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Formül açıklamasını girin"
                />
              </div>

              {/* Enhanced Formula Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formül İfadesi *
                </label>
                <EnhancedFormulaEditor
                  variables={variables}
                  initialFormula={editingFormula.formula}
                  onFormulaChange={(formula, valid) => {
                    setFormulaExpression(formula);
                    setIsFormulaValid(valid);
                  }}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFormula(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateFormula}
                disabled={!isFormulaValid || !formulaName.trim() || loading}
                className={`px-4 py-2 rounded-md ${
                  isFormulaValid && formulaName.trim() && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                <FiSave className="inline mr-1" />
                {loading ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && editingFormula && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center">
                <FiEye className="mr-2" />
                Formül Detayları: {editingFormula.name}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tip</label>
                  <p className="text-sm text-gray-900">
                    {editingFormula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişkisel'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <p className="text-sm text-gray-900">
                    {editingFormula.active ? 'Aktif' : 'Pasif'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renk</label>
                  <div className="flex items-center">
                    <div 
                      className="h-6 w-6 rounded-full mr-2" 
                      style={{ backgroundColor: editingFormula.color }}
                    ></div>
                    <span className="text-sm text-gray-900">{editingFormula.color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tablo</label>
                  <p className="text-sm text-gray-900">
                    {tables.find(t => t.id === editingFormula.tableId)?.name || 'Genel'}
                  </p>
                </div>
              </div>

              {editingFormula.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <p className="text-sm text-gray-900">{editingFormula.description}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Formül</label>
                <EnhancedFormulaEditor
                  variables={variables}
                  initialFormula={editingFormula.formula}
                  onFormulaChange={() => {}} // Read-only
                  readOnly={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <label className="block font-medium">Oluşturulma</label>
                  <p>{new Date(editingFormula.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <label className="block font-medium">Son Güncelleme</label>
                  <p>{new Date(editingFormula.updatedAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setEditingFormula(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 