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
  scope?: 'table' | 'workspace';
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
    color: string;
  }[];
}

// ENHANCED: Improved Formula Editor with scope-aware context and better validation
const EnhancedFormulaEditor = ({ 
  variables, 
  onFormulaChange, 
  initialFormula,
  readOnly = false,
  context = 'general', // ENHANCED: 'table' | 'analysis' | 'general'
  scope = 'table', // YENI: Formül kapsamı
  tableId // YENI: Hangi tablo için
}: {
  variables: Variable[];
  onFormulaChange?: (formula: string, valid: boolean) => void;
  initialFormula?: string;
  readOnly?: boolean;
  context?: 'table' | 'analysis' | 'general';
  scope?: 'table' | 'workspace'; // YENI
  tableId?: string | null; // YENI
}) => {
  const [formula, setFormula] = useState(initialFormula || '');
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  const validateFormula = async (formulaText: string) => {
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

    // ENHANCED: Scope-aware validation
    try {
      const { validateFormulaScope, validateUnidirectionalFormula } = await import('@/lib/enhancedFormulaEvaluator');
      const availableVarNames = variables.map(v => v.name);
      
      // Use scope-aware validation
      const scopeResult = validateFormulaScope(formulaText, scope, availableVarNames, tableId || undefined);
      
      if (!scopeResult.isValid) {
        setIsValid(false);
        setValidationMessage(`Kapsam hatası: ${scopeResult.error}`);
        return false;
      }
      
      // Show warnings if any
      if (scopeResult.warnings && scopeResult.warnings.length > 0) {
        setValidationMessage(`⚠️ Uyarılar: ${scopeResult.warnings.join(', ')}`);
      }
      
      // Additional context-specific validation
      if (context === 'table' && scope === 'table') {
        const unidirectionalResult = validateUnidirectionalFormula(formulaText, availableVarNames);
        
        if (!unidirectionalResult.isValid) {
          setIsValid(false);
          setValidationMessage(`Tablo modu hatası: ${unidirectionalResult.error}`);
          return false;
        }
        
        // Success message for table mode
        if (unidirectionalResult.targetVariable) {
          setValidationMessage(`✅ Geçerli tek yönlü formül: "${unidirectionalResult.targetVariable}" sütunu vurgulanacak`);
        }
      } else {
        // For workspace scope, show different success message
        setValidationMessage(`✅ Geçerli ${scope === 'workspace' ? 'workspace' : 'tablo'} kapsamı formülü`);
      }
      
    } catch (error) {
      setIsValid(false);
      setValidationMessage('Formül analiz hatası: ' + (error as Error).message);
      return false;
    }

    setIsValid(true);
    return true;
  };

  const handleFormulaChange = (value: string) => {
    setFormula(value);
    validateFormula(value).then(valid => {
      if (onFormulaChange) {
        onFormulaChange(value, valid);
      }
    });
  };

  const insertVariable = (varName: string) => {
    if (readOnly) return;
    
    // ENHANCED: Scope-aware variable insertion logic
    if (scope === 'table' && context === 'table') {
      const currentFormula = formula.trim();
      
      // Eğer formülde zaten karşılaştırma operatörü varsa, sağ tarafa ekle
      const hasComparison = /[><=!]+/.test(currentFormula);
      if (hasComparison) {
        const newFormula = formula + `[${varName}]`;
        handleFormulaChange(newFormula);
      } else {
        // Sol tarafa ilk değişkeni ekle (tek değişken kısıtlaması)
        const leftVariables = currentFormula.match(/\[([^\]]+)\]/g) || [];
        if (leftVariables.length === 0) {
          // Sol tarafa ilk değişken ekleniyor
          const newFormula = formula + `[${varName}]`;
          handleFormulaChange(newFormula);
        } else {
          // Sol tarafta zaten değişken var, sağ tarafa ekle
          const newFormula = formula + ` > [${varName}]`;
          handleFormulaChange(newFormula);
        }
      }
    } else {
      // Normal mod: istediği yere ekleyebilir
      const newFormula = formula + `[${varName}]`;
      handleFormulaChange(newFormula);
    }
  };

  const insertOperator = (operator: string) => {
    if (readOnly) return;
    
    // ENHANCED: Scope-aware operator restrictions
    if (scope === 'table' && context === 'table' && ['AND', 'OR'].includes(operator)) {
      setValidationMessage('⚠️ Tablo kapsamında AND/OR operatörleri desteklenmez');
      return;
    }
    
    const newFormula = formula + ` ${operator} `;
    handleFormulaChange(newFormula);
  };

  return (
    <div className="space-y-4">
      {/* ENHANCED: Context and Scope Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 mb-1">
          🎯 {scope === 'table' ? 'Tablo Kapsamı' : 'Workspace Kapsamı'} - {context === 'table' ? 'Tablo Modu' : 'Genel Mod'}
        </h4>
        <p className="text-xs text-blue-700">
          {scope === 'table' && context === 'table' && (
            <>Bu modda formüller tek yönlü olmalıdır: Sol tarafta sadece bir değişken, sağ tarafta karşılaştırma ifadesi.
            Örnek: &quot;İletkenlik {'>'} 300&quot; veya &quot;pH {'<'} Alkalinite + 2&quot;</>
          )}
          {scope === 'workspace' && (
            <>Bu formül tüm workspace&apos;teki tablolara uygulanacaktır. Karmaşık koşullar (AND/OR) kullanabilirsiniz.
            Örnek: &quot;İletkenlik {'>'} 300 AND pH {'<'} 7&quot;</>
          )}
          {scope === 'table' && context !== 'table' && (
            <>Bu formül sadece seçili tabloya uygulanacaktır. Genel analiz kuralları için kullanışlıdır.</>
          )}
        </p>
      </div>

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
          placeholder={
            scope === 'table' && context === 'table'
              ? "Örn: [İletkenlik] > 300 veya [pH] < [Alkalinite] + 2"
              : scope === 'workspace'
              ? "Örn: [İletkenlik] > 300 AND [pH] < 7 veya [Toplam Fosfor] + [Orto Fosfat] > 5"
              : "Örn: [İletkenlik] + [Toplam Fosfor] > [Orto Fosfat] - [Alkalinite Tayini]"
          }
          value={formula}
          onChange={(e) => handleFormulaChange(e.target.value)}
          readOnly={readOnly}
          rows={3}
        />
        {validationMessage && (
          <p className={`text-xs mt-1 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validationMessage}
          </p>
        )}
      </div>

      {!readOnly && (
        <>
          {/* ENHANCED: Variable Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Değişken Ekle
              {scope === 'table' && context === 'table' && (
                <span className="text-xs text-amber-600 ml-1">(Tablo modunda akıllı ekleme)</span>
              )}
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
              {['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!='].map(op => (
                <button
                  key={op}
                  onClick={() => insertOperator(op)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-mono transition-colors"
                >
                  {op}
                </button>
              ))}
              {scope === 'workspace' && ['AND', 'OR'].map(op => (
                <button
                  key={op}
                  onClick={() => insertOperator(op)}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 border border-green-300 rounded text-sm font-mono transition-colors"
                >
                  {op}
                </button>
              ))}
              {scope === 'table' && (
                <div className="text-xs text-gray-500 italic px-2 py-1 bg-gray-50 rounded border border-gray-200">
                  AND/OR {context === 'table' ? 'tablo modunda' : 'tablo kapsamında'} kısıtlı
                </div>
              )}
            </div>
          </div>

          {/* ENHANCED: Formula Examples based on scope */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 {scope === 'table' ? 'Tablo' : 'Workspace'} Kapsamı Örnekleri:</h4>
            <div className="space-y-1 text-xs text-blue-700">
              {scope === 'table' && context === 'table' ? (
                <>
                  <div className="font-mono bg-blue-100 p-1 rounded">[İletkenlik] {'>'} 300</div>
                  <div className="font-mono bg-blue-100 p-1 rounded">[pH] {'<'} [Alkalinite] + 2</div>
                  <div className="font-mono bg-blue-100 p-1 rounded">[Toplam Fosfor] {'>='} 0.5</div>
                </>
              ) : scope === 'workspace' ? (
                <>
                  <div className="font-mono bg-green-100 p-1 rounded">[İletkenlik] {'>'} 300 AND [pH] {'<'} 7</div>
                  <div className="font-mono bg-green-100 p-1 rounded">[Toplam Fosfor] + [Orto Fosfat] {'>'} 5</div>
                  <div className="font-mono bg-green-100 p-1 rounded">[pH] {'>='} 7 OR [Alkalinite] {'<'} 100</div>
                </>
              ) : (
                <>
                  <div className="font-mono bg-blue-100 p-1 rounded">[İletkenlik] {'>'} 300</div>
                  <div className="font-mono bg-blue-100 p-1 rounded">[İletkenlik] + [Toplam Fosfor] {'>'} [Orto Fosfat]</div>
                  <div className="font-mono bg-blue-100 p-1 rounded">[pH] {'>='} 7 AND [pH] {'<='} 8.5</div>
                </>
              )}
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

  // NEW: Auto-refresh states
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<HighlightedCell[]>([]);
  const [showHighlightPreview, setShowHighlightPreview] = useState(false);

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
  
  // YENI: Formül scope'u için state'ler
  const [formulaScope, setFormulaScope] = useState<'workspace' | 'table'>('table');
  const [formulaScopeTableId, setFormulaScopeTableId] = useState<string>('');

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

  // NEW: Auto-refresh effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(() => {
        fetchFormulas();
        setLastRefresh(new Date());
        // If we have a selected table, also refresh highlights
        if (selectedTable) {
          refreshHighlights();
        }
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, selectedTable]);

  // NEW: Function to refresh highlights
  const refreshHighlights = async () => {
    if (!selectedWorkspace || !selectedTable) return;
    
    try {
      const activeFormulas = formulas.filter(f => f.active);
      if (activeFormulas.length === 0) {
        setHighlightedCells([]);
        return;
      }

      // Fetch table data to apply formulas
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables/${selectedTable}`);
      if (!response.ok) return;
      
      const tableData = await response.json();
      
      // Use the enhanced formula evaluator
      const { evaluateFormulasForTable } = await import('@/lib/enhancedFormulaEvaluator');
      const highlights = evaluateFormulasForTable(activeFormulas, tableData);
      
      setHighlightedCells(highlights);
      console.log(`🔄 Auto-refresh: ${highlights.length} highlighted cells updated`);
    } catch (error) {
      console.error('Error refreshing highlights:', error);
    }
  };

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
    if (!formulaName.trim() || !formulaExpression.trim() || !isFormulaValid) {
      setError('Lütfen tüm gerekli alanları doldurun ve formülün geçerli olduğundan emin olun');
      return;
    }

    try {
      setLoading(true);
      
      const formulaData = {
        name: formulaName,
        description: formulaDescription || null,
        formula: formulaExpression,
        type: formulaType,
        color: formulaColor,
        active: formulaActive,
        scope: formulaScope, // ENHANCED: Explicit scope setting
        tableId: formulaScope === 'table' ? formulaScopeTableId || null : null
      };

      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Formül oluşturulurken bir hata oluştu');
      }

      const newFormula = await response.json();
      setFormulas(prev => [...prev, newFormula]);
      setSuccess('Formül başarıyla oluşturuldu');
      setShowCreateModal(false);
      resetForm();

      // ENHANCED: Trigger data refresh after formula creation
      const { formulaService } = await import('@/lib/formula/formulaService');
      await formulaService.triggerDataRefresh(
        selectedWorkspace,
        formulaScope === 'table' ? formulaScopeTableId : undefined,
        () => {
          console.log('✅ Data refresh triggered successfully after formula creation');
          // Force refresh highlights if we have a selected table
          if (selectedTable) {
            refreshHighlights();
          }
        },
        (error) => {
          console.error('❌ Error triggering data refresh:', error);
        }
      );

    } catch (err) {
      console.error('Error creating formula:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormula = async () => {
    if (!editingFormula || !formulaName.trim() || !formulaExpression.trim() || !isFormulaValid) {
      setError('Lütfen tüm gerekli alanları doldurun ve formülün geçerli olduğundan emin olun');
      return;
    }

    try {
      setLoading(true);
      
      const formulaData = {
        name: formulaName,
        description: formulaDescription || null,
        formula: formulaExpression,
        type: formulaType,
        color: formulaColor,
        active: formulaActive,
        scope: formulaScope, // ENHANCED: Explicit scope setting
        tableId: formulaScope === 'table' ? formulaScopeTableId || null : null
      };

      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas/${editingFormula.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Formül güncellenirken bir hata oluştu');
      }

      const updatedFormula = await response.json();
      setFormulas(prev => prev.map(f => f.id === editingFormula.id ? updatedFormula : f));
      setSuccess('Formül başarıyla güncellendi');
      setShowEditModal(false);
      setEditingFormula(null);
      resetForm();

      // ENHANCED: Trigger data refresh after formula update
      const { formulaService } = await import('@/lib/formula/formulaService');
      await formulaService.triggerDataRefresh(
        selectedWorkspace,
        formulaScope === 'table' ? formulaScopeTableId : undefined,
        () => {
          console.log('✅ Data refresh triggered successfully after formula update');
          // Force refresh highlights if we have a selected table
          if (selectedTable) {
            refreshHighlights();
          }
        },
        (error) => {
          console.error('❌ Error triggering data refresh:', error);
        }
      );

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
        throw new Error(errorData.error || 'Formül silinirken bir hata oluştu');
      }

      // Find the formula being deleted to determine its scope
      const deletedFormula = formulas.find(f => f.id === formulaId);
      
      setFormulas(prev => prev.filter(f => f.id !== formulaId));
      setSuccess('Formül başarıyla silindi');

      // ENHANCED: Trigger data refresh after formula deletion
      const { formulaService } = await import('@/lib/formula/formulaService');
      await formulaService.triggerDataRefresh(
        selectedWorkspace,
        deletedFormula?.scope === 'table' ? deletedFormula.tableId || undefined : undefined,
        () => {
          console.log('✅ Data refresh triggered successfully after formula deletion');
          // Force refresh highlights if we have a selected table
          if (selectedTable) {
            refreshHighlights();
          }
        },
        (error) => {
          console.error('❌ Error triggering data refresh:', error);
        }
      );

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
    // ENHANCED: Reset scope states
    setFormulaScope('table');
    setFormulaScopeTableId('');
  };

  const openEditModal = (formula: Formula) => {
    setEditingFormula(formula);
    setFormulaName(formula.name);
    setFormulaDescription(formula.description || '');
    setFormulaType(formula.type);
    setFormulaColor(formula.color);
    setFormulaActive(formula.active);
    setFormulaExpression(formula.formula);
    // ENHANCED: Set scope information
    setFormulaScope(formula.scope || (formula.tableId ? 'table' : 'workspace'));
    setFormulaScopeTableId(formula.tableId || '');
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
        <div className="flex items-center space-x-4">
          {/* Auto-refresh controls */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span>Otomatik Yenile</span>
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs border-gray-300 rounded"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Son: {lastRefresh.toLocaleTimeString('tr-TR')}
              </span>
            )}
          </div>
          
          {/* Highlight preview toggle */}
          {highlightedCells.length > 0 && (
            <button
              onClick={() => setShowHighlightPreview(!showHighlightPreview)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                showHighlightPreview 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🍕 Pizza Görünümü ({highlightedCells.length})
            </button>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          >
            <FcPlus className="mr-2" />
            Yeni Formül Oluştur
          </button>
        </div>
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
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

      {/* Pizza Chart Preview */}
      {showHighlightPreview && highlightedCells.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            🍕 Pizza Görselleştirme Önizlemesi
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {highlightedCells.length} hücre vurgulandı
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlightedCells.slice(0, 12).map((cell) => (
              <div
                key={`${cell.row}-${cell.col}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {cell.col} - {cell.row}
                  </span>
                  <div className="flex space-x-1">
                    {cell.formulaDetails && cell.formulaDetails.map((detail, idx) => (
                      <div
                        key={`${detail.id}-${idx}`}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: detail.color }}
                        title={detail.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {cell.formulaDetails?.map((detail, idx) => (
                    <div key={`detail-${idx}`} className="text-xs">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: detail.color }}
                        />
                        <span className="font-medium text-gray-700">{detail.name}</span>
                      </div>
                      {detail.leftResult !== undefined && detail.rightResult !== undefined && (
                        <div className="ml-4 text-gray-500">
                          {detail.leftResult.toFixed(2)} vs {detail.rightResult.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Mini pizza slice visualization */}
                {cell.formulaDetails && cell.formulaDetails.length > 1 && (
                  <div className="mt-3 flex justify-center">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{
                        background: `conic-gradient(from 0deg, ${
                          cell.formulaDetails.map((detail, idx) => {
                            const angle = (360 / cell.formulaDetails!.length);
                            const start = idx * angle;
                            const end = (idx + 1) * angle;
                            return `${detail.color} ${start}deg ${end}deg`;
                          }).join(', ')
                        })`
                      }}
                      title="Pizza dilimi görünümü"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {highlightedCells.length > 12 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">
                ve {highlightedCells.length - 12} daha...
              </span>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded border-l-4 border-blue-400">
            <strong>💡 İpucu:</strong> Tabloda birden fazla formül koşulunu karşılayan hücreler 
            pizza dilimi şeklinde renklendirilir. Her dilim farklı bir formülü temsil eder.
          </div>
        </div>
      )}

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
                  context={formulaScope === 'table' ? 'table' : 'general'}
                  scope={formulaScope}
                  tableId={formulaScopeTableId}
                />
              </div>

              {/* ENHANCED: Add Scope Selection Controls */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Formül Kapsamı</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapsam Türü
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          name="formulaScope"
                          value="table"
                          checked={formulaScope === 'table'}
                          onChange={(e) => setFormulaScope(e.target.value as 'table' | 'workspace')}
                          className="mr-3 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Belirli Tablo</div>
                          <div className="text-sm text-gray-600">
                            Bu formülü sadece seçili tabloya uygula
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          name="formulaScope"
                          value="workspace"
                          checked={formulaScope === 'workspace'}
                          onChange={(e) => setFormulaScope(e.target.value as 'table' | 'workspace')}
                          className="mr-3 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Tüm Workspace</div>
                          <div className="text-sm text-gray-600">
                            Bu formülü çalışma alanındaki tüm tablolara uygula
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Table Selection (only if table scope is selected) */}
                  {formulaScope === 'table' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hedef Tablo Seçimi
                      </label>
                      <select
                        value={formulaScopeTableId}
                        onChange={(e) => setFormulaScopeTableId(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        required={formulaScope === 'table'}
                      >
                        <option value="">Tablo seçin...</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                      {formulaScope === 'table' && !formulaScopeTableId && (
                        <p className="text-sm text-red-600 mt-1">
                          Tablo kapsamı için bir tablo seçmelisiniz.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Scope Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      📋 Seçilen Kapsam: {formulaScope === 'table' ? 'Belirli Tablo' : 'Tüm Workspace'}
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {formulaScope === 'table' ? (
                        <>
                          <li>• Bu formül sadece seçili tabloya uygulanacak</li>
                          <li>• Tek yönlü formüller (sol tarafta bir değişken) önerilir</li>
                          <li>• Tablo verileri değiştiğinde otomatik olarak güncellenir</li>
                          {formulaScopeTableId && (
                            <li className="font-medium">
                              • Hedef Tablo: {tables.find(t => t.id === formulaScopeTableId)?.name || 'Seçili tablo'}
                            </li>
                          )}
                        </>
                      ) : (
                        <>
                          <li>• Bu formül workspace&apos;teki tüm tablolara uygulanacak</li>
                          <li>• Karmaşık koşullar (AND/OR) kullanabilirsiniz</li>
                          <li>• Yeni tablolar eklendiğinde otomatik olarak uygulanır</li>
                          <li>• Genel kurallar için idealdir</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleCreateFormula}
                disabled={!formulaName || !formulaExpression || !isFormulaValid || (formulaScope === 'table' && !formulaScopeTableId)}
                className={`px-4 py-2 rounded-md font-medium ${
                  !formulaName || !formulaExpression || !isFormulaValid || (formulaScope === 'table' && !formulaScopeTableId)
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <FiSave className="inline mr-2" />
                Formül Oluştur
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
                  context={formulaScope === 'table' ? 'table' : 'general'}
                  scope={formulaScope}
                  tableId={formulaScopeTableId}
                />
              </div>

              {/* ENHANCED: Add Scope Selection Controls for Edit Modal */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Formül Kapsamı</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapsam Türü
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="relative flex items-center p-3 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <input
                          type="radio"
                          name="edit-scope"
                          value="table"
                          checked={formulaScope === 'table'}
                          onChange={(e) => setFormulaScope(e.target.value as 'table' | 'workspace')}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            formulaScope === 'table' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {formulaScope === 'table' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-[1px]"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Tablo Kapsamı</div>
                            <div className="text-xs text-gray-600">Sadece belirli bir tabloya uygula</div>
                          </div>
                        </div>
                      </label>
                      
                      <label className="relative flex items-center p-3 bg-green-50 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                          type="radio"
                          name="edit-scope"
                          value="workspace"
                          checked={formulaScope === 'workspace'}
                          onChange={(e) => setFormulaScope(e.target.value as 'table' | 'workspace')}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            formulaScope === 'workspace' ? 'bg-green-600 border-green-600' : 'border-gray-300'
                          }`}>
                            {formulaScope === 'workspace' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-[1px]"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Workspace Kapsamı</div>
                            <div className="text-xs text-gray-600">Tüm workspace genelinde uygula</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ENHANCED: Table Selection for Table Scope */}
                  {formulaScope === 'table' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hedef Tablo *
                      </label>
                      <select
                        value={formulaScopeTableId}
                        onChange={(e) => setFormulaScopeTableId(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        required
                      >
                        <option value="">Lütfen bir tablo seçin</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                      {formulaScope === 'table' && !formulaScopeTableId && (
                        <p className="text-red-600 text-xs mt-1">Tablo kapsamı için hedef tablo seçimi zorunludur</p>
                      )}
                    </div>
                  )}

                  {/* Scope Information */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Seçili Kapsam Açıklaması:</h4>
                    {formulaScope === 'table' ? (
                      <div className="text-sm text-gray-600">
                        <p>✅ Bu formül sadece seçili tabloda çalışacak</p>
                        <p>✅ Tek yönlü kısıtlamalar uygulanacak (sol tarafta tek değişken)</p>
                        <p>✅ Hücre seviyesinde doğrulama yapılacak</p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>✅ Bu formül workspace&apos;teki tüm tablolara uygulanacak</p>
                        <p>✅ Karmaşık koşullar (AND/OR) kullanabilirsiniz</p>
                        <p>✅ Çapraz tablo analizleri mümkün</p>
                      </div>
                    )}
                  </div>
                </div>
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