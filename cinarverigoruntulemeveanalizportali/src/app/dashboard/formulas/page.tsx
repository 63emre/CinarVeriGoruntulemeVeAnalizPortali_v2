'use client';

import { useState, useEffect } from 'react';
import { FcRules, FcPlus, FcEditImage, FcFullTrash, FcOk, FcCancel, FcSettings } from 'react-icons/fc';
import { AiOutlineSearch, AiOutlineEye } from 'react-icons/ai';
import { showSuccess, showError, showInfo } from '@/components/ui/Notification';

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  workspace: {
    name: string;
  };
  workspaceId: string;
}

interface FormulaFormData {
  name: string;
  description: string;
  formula: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  color: string;
  active: boolean;
  workspaceId: string;
}

const FORMULA_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#FF3838', '#2ECC71', '#3742FA', '#F79F1F', '#A55EEA'
];

const FORMULA_TYPES = [
  { value: 'CELL_VALIDATION', label: 'Hücre Doğrulama', description: 'Tek hücre değerlerini kontrol eder' },
  { value: 'RELATIONAL', label: 'İlişkisel Analiz', description: 'Satır/sütun karşılaştırmaları yapar' }
];

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
  
  const [formData, setFormData] = useState<FormulaFormData>({
    name: '',
    description: '',
    formula: '',
    type: 'CELL_VALIDATION',
    color: FORMULA_COLORS[0],
    active: true,
    workspaceId: ''
  });

  // Formülleri yükle
  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/formulas');
      if (!response.ok) {
        throw new Error('Formüller yüklenirken hata oluştu');
      }
      const data = await response.json();
      setFormulas(data);
    } catch (error) {
      console.error('Error fetching formulas:', error);
      showError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Workspace'leri yükle
  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0 && !formData.workspaceId) {
          setFormData(prev => ({ ...prev, workspaceId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  useEffect(() => {
    fetchFormulas();
    fetchWorkspaces();
  }, []);

  // Filtreleme ve arama
  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (formula.description && formula.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || formula.type === filterType;
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && formula.active) ||
                         (filterActive === 'inactive' && !formula.active);

    return matchesSearch && matchesType && matchesActive;
  });

  // Modal'ları temizle
  const clearModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedFormula(null);
    setFormData({
      name: '',
      description: '',
      formula: '',
      type: 'CELL_VALIDATION',
      color: FORMULA_COLORS[0],
      active: true,
      workspaceId: workspaces.length > 0 ? workspaces[0].id : ''
    });
  };

  // Formül oluşturma
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.formula.trim() || !formData.workspaceId) {
      showError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${formData.workspaceId}/formulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Formül oluşturulamadı');
      }

      showSuccess('✅ Formül başarıyla oluşturuldu!');
      clearModals();
      fetchFormulas();
    } catch (error) {
      console.error('Error creating formula:', error);
      showError((error as Error).message);
    }
  };

  // Formül güncelleme
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFormula || !formData.name.trim() || !formData.formula.trim()) {
      showError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${selectedFormula.workspaceId}/formulas/${selectedFormula.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Formül güncellenemedi');
      }

      showSuccess('✅ Formül başarıyla güncellendi!');
      clearModals();
      fetchFormulas();
    } catch (error) {
      console.error('Error updating formula:', error);
      showError((error as Error).message);
    }
  };

  // Formül silme
  const handleDelete = async () => {
    if (!selectedFormula) return;

    try {
      const response = await fetch(`/api/workspaces/${selectedFormula.workspaceId}/formulas/${selectedFormula.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Formül silinemedi');
      }

      showSuccess('✅ Formül başarıyla silindi!');
      clearModals();
      fetchFormulas();
    } catch (error) {
      console.error('Error deleting formula:', error);
      showError((error as Error).message);
    }
  };

  // Formül aktif/pasif değiştirme
  const toggleFormulaActive = async (formula: Formula) => {
    try {
      const response = await fetch(`/api/workspaces/${formula.workspaceId}/formulas/${formula.id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !formula.active })
      });

      if (!response.ok) {
        throw new Error('Formül durumu değiştirilemedi');
      }

      showSuccess(`✅ Formül ${!formula.active ? 'aktif' : 'pasif'} hale getirildi!`);
      fetchFormulas();
    } catch (error) {
      console.error('Error toggling formula:', error);
      showError((error as Error).message);
    }
  };

  // Edit modalı aç
  const openEditModal = (formula: Formula) => {
    setSelectedFormula(formula);
    setFormData({
      name: formula.name,
      description: formula.description || '',
      formula: formula.formula,
      type: formula.type,
      color: formula.color,
      active: formula.active,
      workspaceId: formula.workspaceId
    });
    setShowEditModal(true);
  };

  // Delete modalı aç
  const openDeleteModal = (formula: Formula) => {
    setSelectedFormula(formula);
    setShowDeleteModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FcRules className="h-10 w-10 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Formül Yönetimi</h1>
              <p className="text-purple-100">Veri analiz formüllerini oluşturun ve yönetin</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center"
          >
            <FcPlus className="mr-2" />
            Yeni Formül
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Formül ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tüm Tipler</option>
            {FORMULA_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Active Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredFormulas.length}</span> formül bulundu
          </div>
        </div>
      </div>

      {/* Formulas List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <FcRules className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Henüz formül bulunmuyor</p>
            <p className="mt-2">İlk formülünüzü oluşturmak için &quot;Yeni Formül&quot; butonuna tıklayın</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formül
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workspace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFormulas.map((formula) => (
                  <tr key={formula.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: formula.color }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formula.name}</div>
                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                            {formula.formula}
                          </div>
                          {formula.description && (
                            <div className="text-xs text-gray-500 mt-1">{formula.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        formula.type === 'CELL_VALIDATION' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {FORMULA_TYPES.find(t => t.value === formula.type)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formula.workspace.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFormulaActive(formula)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          formula.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {formula.active ? '✅ Aktif' : '❌ Pasif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(formula)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Düzenle"
                      >
                        <FcEditImage className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(formula)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Sil"
                      >
                        <FcFullTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FcPlus className="mr-3" />
              Yeni Formül Oluştur
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Adı *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn: Yüksek Değer Kontrolü"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workspace *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.workspaceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, workspaceId: e.target.value }))}
                  >
                    <option value="">Workspace seçin</option>
                    {workspaces.map(workspace => (
                      <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Formülün ne yaptığını kısaca açıklayın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formül *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  value={formData.formula}
                  onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                  placeholder="Örn: value &gt; 1000 veya value &lt; 0.005"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Örnek formüller: value &gt; 100, value &lt; 0.005, value == &apos;N/A&apos;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'CELL_VALIDATION' | 'RELATIONAL' }))}
                  >
                    {FORMULA_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renk
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FORMULA_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  className="mr-2"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Formülü aktif olarak oluştur
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={clearModals}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <FcOk className="mr-2" />
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedFormula && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FcEditImage className="mr-3" />
              Formül Düzenle
            </h2>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formül Adı *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workspace
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    value={selectedFormula.workspace.name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formül *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  value={formData.formula}
                  onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'CELL_VALIDATION' | 'RELATIONAL' }))}
                  >
                    {FORMULA_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renk
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FORMULA_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editActive"
                  className="mr-2"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
                <label htmlFor="editActive" className="text-sm text-gray-700">
                  Formül aktif
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={clearModals}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <FcOk className="mr-2" />
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedFormula && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 flex items-center text-red-600">
              <FcFullTrash className="mr-3" />
              Formülü Sil
            </h2>
            
            <p className="text-gray-600 mb-6">
              <strong>{selectedFormula.name}</strong> formülünü silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ Bu formül silindiğinde, mevcut analizlerde kullanılan vurgular etkilenebilir.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={clearModals}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <FcFullTrash className="mr-2" />
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 