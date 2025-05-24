'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { FcRules, FcPlus, FcCancel, FcOk } from 'react-icons/fc';

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  color: string;
  active: boolean;
  createdAt: string;
}

export default function FormulasPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const router = useRouter();
  const { workspaceId } = use(params);
  
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formulaForm, setFormulaForm] = useState({
    name: '',
    description: '',
    formula: '',
    type: 'CELL_VALIDATION' as 'CELL_VALIDATION' | 'RELATIONAL',
    color: '#ef4444'
  });

  // ESC key handling
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && showCreateModal) {
      setShowCreateModal(false);
      setFormulaForm({
        name: '',
        description: '',
        formula: '',
        type: 'CELL_VALIDATION',
        color: '#ef4444'
      });
    }
  }, [showCreateModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [handleEscKey]);

  // Fetch formulas
  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (!response.ok) throw new Error('Formüller yüklenirken bir hata oluştu');
        const data = await response.json();
        setFormulas(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, [workspaceId]);

  // Create formula
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulaForm.name.trim() || !formulaForm.formula.trim()) {
      setError('Formül adı ve formül ifadesi gereklidir');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Formül oluşturulurken bir hata oluştu');
      }

      const newFormula = await response.json();
      setFormulas([...formulas, newFormula]);
      setShowCreateModal(false);
      setFormulaForm({
        name: '',
        description: '',
        formula: '',
        type: 'CELL_VALIDATION',
        color: '#ef4444'
      });
      setSuccess('Formül başarıyla oluşturuldu');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading && formulas.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-black flex items-center">
            <FcRules className="mr-2" />
            Gelişmiş Formül Yönetimi
          </h1>
          <p className="text-gray-600 mt-1">Workspace formüllerini yönetin ve uygulayın</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center"
          >
            <FcCancel className="mr-2" />
            Geri Dön
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          >
            <FcPlus className="mr-2" />
            Yeni Formül
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Hata! </strong>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Başarılı! </strong>
          <span>{success}</span>
        </div>
      )}

      {/* Formulas List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {formulas.length === 0 ? (
          <div className="p-8 text-center">
            <FcRules className="mx-auto text-6xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz formül eklenmemiş</h3>
            <p className="text-gray-500 mb-4">Bu workspace için ilk formülünüzü oluşturun</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center mx-auto"
            >
              <FcPlus className="mr-2" />
              İlk Formülü Oluştur
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {formulas.map((formula) => (
              <div key={formula.id} className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors shadow-sm">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full mt-1 border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: formula.color }}
                  ></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{formula.name}</h3>
                    {formula.description && (
                      <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                    )}
                                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">                      <code className="text-xs text-blue-900 font-mono">{formula.formula}</code>                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>
                        Tip: {formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişkisel'}
                      </span>
                      <span>
                        Durum: {formula.active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span>
                        Oluşturulma: {new Date(formula.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FcPlus className="mr-2" />
                  Yeni Formül Oluştur
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateFormula} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Adı *
                  </label>
                  <input
                    type="text"
                    value={formulaForm.name}
                    onChange={(e) => setFormulaForm({ ...formulaForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Yüksek Değer Kontrolü"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={formulaForm.description}
                    onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Formülün amacını açıklayın..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül İfadesi *
                  </label>
                  <textarea
                    value={formulaForm.formula}
                    onChange={(e) => setFormulaForm({ ...formulaForm, formula: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    rows={3}
                    placeholder="Örn: [Değer] > 100"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Formül Tipi
                    </label>
                    <select
                      value={formulaForm.type}
                      onChange={(e) => setFormulaForm({ ...formulaForm, type: e.target.value as 'CELL_VALIDATION' | 'RELATIONAL' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CELL_VALIDATION">Hücre Doğrulama</option>
                      <option value="RELATIONAL">İlişkisel</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vurgulama Rengi
                    </label>
                    <input
                      type="color"
                      value={formulaForm.color}
                      onChange={(e) => setFormulaForm({ ...formulaForm, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                <button                  type="button"                  onClick={() => setShowCreateModal(false)}                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"                >                  İptal (ESC)                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                >
                  <FcOk className="mr-2" />
                  {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Help text */}
      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>İpucu:</strong> Modal pencereler ESC tuşu ile veya dış alana tıklayarak kapatılabilir.
        </p>
      </div>
    </div>
  );
} 