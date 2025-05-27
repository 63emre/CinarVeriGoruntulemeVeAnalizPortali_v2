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

  // Toggle formula active status
  const handleToggleFormula = async (formulaId: string, active: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${formulaId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error('Formül durumu güncellenirken bir hata oluştu');
      }

      const updatedFormula = await response.json();
      setFormulas(formulas.map(formula =>
        formula.id === formulaId ? updatedFormula : formula
      ));
      setSuccess(`Formül ${active ? 'aktifleştirildi' : 'pasifleştirildi'}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Delete formula
  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas/${formulaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Formül silinirken bir hata oluştu');
      }

      setFormulas(formulas.filter(formula => formula.id !== formulaId));
      setSuccess('Formül başarıyla silindi');
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FcRules className="mr-3 text-4xl" />
            🔧 Gelişmiş Formül Yönetimi
          </h1>
          <p className="text-gray-700 mt-2 text-lg">Workspace formüllerini yönetin ve uygulayın</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center transition-all duration-200 border-2 border-gray-700 font-semibold text-lg shadow-md hover:shadow-lg"
          >
            <FcCancel className="mr-2 text-xl" />
            ⬅️ Geri Dön
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center transition-all duration-200 border-2 border-green-700 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FcPlus className="mr-2 text-xl" />
            ➕ Yeni Formül
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl relative mb-6 shadow-lg">
          <strong className="font-bold text-lg">❌ Hata! </strong>
          <span className="text-base">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl relative mb-6 shadow-lg">
          <strong className="font-bold text-lg">✅ Başarılı! </strong>
          <span className="text-base">{success}</span>
        </div>
      )}

      {/* Formulas List */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
        {formulas.length === 0 ? (
          <div className="p-12 text-center">
            <FcRules className="mx-auto text-8xl mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Henüz formül eklenmemiş</h3>
            <p className="text-gray-600 mb-6 text-lg">Bu workspace için ilk formülünüzü oluşturun</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center mx-auto font-bold text-lg transition-all duration-200 border-2 border-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FcPlus className="mr-2 text-xl" />
              🚀 İlk Formülü Oluştur
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-8">
            {formulas.map((formula) => (
              <div key={formula.id} className="border-2 border-blue-200 rounded-xl p-6 hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-6 h-6 rounded-full mr-3 border-2 border-gray-400"
                        style={{ backgroundColor: formula.color }}
                      ></div>
                      <h3 className="text-xl font-bold text-gray-800">{formula.name}</h3>
                      <span className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${
                        formula.active 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {formula.active ? '✅ Aktif' : '❌ Pasif'}
                      </span>
                    </div>
                    
                    {formula.description && (
                      <p className="text-gray-700 mb-3 text-base leading-relaxed">{formula.description}</p>
                    )}
                    
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-bold text-blue-800 mb-1">🔧 Formül İfadesi:</h4>
                      <code className="text-sm text-blue-900 font-mono break-all">{formula.formula}</code>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="font-semibold mr-1">📋 Tip:</span>
                        {formula.type === 'CELL_VALIDATION' ? '🔍 Hücre Doğrulama' : '🔗 İlişkisel'}
                      </span>
                      <span className="flex items-center">
                        <span className="font-semibold mr-1">📅 Oluşturulma:</span>
                        {new Date(formula.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleToggleFormula(formula.id, !formula.active)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        formula.active 
                          ? 'text-orange-600 hover:bg-orange-100 bg-orange-50' 
                          : 'text-green-600 hover:bg-green-100 bg-green-50'
                      }`}
                      title={formula.active ? 'Pasifleştir' : 'Aktifleştir'}
                    >
                      {formula.active ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteFormula(formula.id)}
                      className="p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-lg transition-all duration-200"
                      title="Formülü Sil"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FcPlus className="mr-3 text-3xl" />
                  🚀 Yeni Formül Oluştur
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-700 mt-2 text-base">
                Workspace için yeni bir doğrulama formülü oluşturun
              </p>
            </div>
            
            <form onSubmit={handleCreateFormula} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    📝 Formül Adı *
                  </label>
                  <input
                    type="text"
                    value={formulaForm.name}
                    onChange={(e) => setFormulaForm({ ...formulaForm, name: e.target.value })}
                    className="w-full px-4 py-3 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                    placeholder="Örn: Yüksek Değer Kontrolü"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Formülünüz için açıklayıcı bir isim girin
                  </p>
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    📄 Açıklama
                  </label>
                  <textarea
                    value={formulaForm.description}
                    onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                    className="w-full px-4 py-3 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    rows={3}
                    placeholder="Formülün amacını açıklayın... (opsiyonel)"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Formülün ne için kullanıldığını kısaca açıklayın
                  </p>
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    🔧 Formül İfadesi *
                  </label>
                  <textarea
                    value={formulaForm.formula}
                    onChange={(e) => setFormulaForm({ ...formulaForm, formula: e.target.value })}
                    className="w-full px-4 py-3 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-base transition-all duration-200"
                    rows={4}
                    placeholder="Örn: [İletkenlik] + [Toplam Fosfor] > [Orto Fosfat] - [Alkalinite Tayini]"
                    required
                  />
                  <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <h4 className="text-sm font-bold text-blue-800 mb-2">💡 Formül Yazma Kuralları:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Değişkenler köşeli parantez içinde yazılır: <code className="bg-blue-100 px-1 rounded">[DeğişkenAdı]</code></li>
                      <li>• Matematik işlemleri: <code className="bg-blue-100 px-1 rounded">+</code> <code className="bg-blue-100 px-1 rounded">-</code> <code className="bg-blue-100 px-1 rounded">*</code> <code className="bg-blue-100 px-1 rounded">/</code></li>
                      <li>• Karşılaştırma: <code className="bg-blue-100 px-1 rounded">&gt;</code> <code className="bg-blue-100 px-1 rounded">&lt;</code> <code className="bg-blue-100 px-1 rounded">&gt;=</code> <code className="bg-blue-100 px-1 rounded">&lt;=</code> <code className="bg-blue-100 px-1 rounded">==</code></li>
                      <li>• Mantık operatörleri: <code className="bg-blue-100 px-1 rounded">AND</code> <code className="bg-blue-100 px-1 rounded">OR</code></li>
                    </ul>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      🎨 Vurgulama Rengi
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={formulaForm.color}
                        onChange={(e) => setFormulaForm({ ...formulaForm, color: e.target.value })}
                        className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <div 
                          className="w-full h-8 rounded-lg border-2 border-gray-300"
                          style={{ backgroundColor: formulaForm.color }}
                        ></div>
                        <span className="text-sm text-gray-600 mt-1 block font-mono">{formulaForm.color}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Hücreleri vurgulamak için kullanılacak renk
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-800 mb-3">
                      ⚙️ Formül Tipi
                    </label>
                    <select
                      value={formulaForm.type}
                      onChange={(e) => setFormulaForm({ ...formulaForm, type: e.target.value as 'CELL_VALIDATION' | 'RELATIONAL' })}
                      className="w-full px-4 py-3 text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base font-medium"
                    >
                      <option value="CELL_VALIDATION">🔍 Hücre Doğrulama</option>
                      <option value="RELATIONAL">🔗 İlişkisel</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-2">
                      Formülün uygulama türünü belirleyin
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg transition-all duration-200 border-2 border-gray-300 text-lg"
                >
                  ❌ İptal (ESC)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center transition-all duration-200 border-2 border-green-700 disabled:border-gray-400 text-lg"
                >
                  <FcOk className="mr-2 text-xl" />
                  {loading ? '⏳ Oluşturuluyor...' : '✅ Formülü Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Help text */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-lg">
        <div className="flex items-start">
          <div className="mr-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Kullanım İpuçları</h3>
            <div className="space-y-2 text-blue-700">
              <p className="flex items-start">
                <span className="mr-2 text-blue-600">🔘</span>
                <span><strong>Modal pencereler</strong> ESC tuşu ile veya dış alana tıklayarak kapatılabilir</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2 text-blue-600">🔘</span>
                <span><strong>Formüller</strong> aktif olduğunda tablolarda hücre validasyonu yapar</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2 text-blue-600">🔘</span>
                <span><strong>Renk kodları</strong> formül ihlali olan hücreleri vurgulamak için kullanılır</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2 text-blue-600">🔘</span>
                <span><strong>Silme işlemi</strong> geri alınamaz, dikkatli olun</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 