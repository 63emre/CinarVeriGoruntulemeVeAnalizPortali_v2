'use client';

import { useState, useEffect } from 'react';
import { FcRules, FcSearch, FcViewDetails, FcPlus, FcEditImage, FcCancel } from 'react-icons/fc';
import { MdDelete, MdSave } from 'react-icons/md';
import Link from 'next/link';

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  color: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active: boolean;
  table: {
    id: string;
    name: string;
  } | null;
  workspace: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
  workspaceId: string;
}

export default function AdminFormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formula: '',
    color: '#ff0000',
    type: 'CELL_VALIDATION' as 'CELL_VALIDATION' | 'RELATIONAL',
    active: true,
    workspaceId: '',
    tableId: ''
  });

  useEffect(() => {
    fetchFormulas();
    fetchWorkspaces();
    fetchTables();
  }, []);

  const fetchFormulas = async () => {
    try {
      const response = await fetch('/api/admin/formulas');
      if (response.ok) {
        const data = await response.json();
        setFormulas(data);
      } else {
        console.error('Failed to fetch formulas');
      }
    } catch (error) {
      console.error('Error fetching formulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/admin/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleCreate = () => {
    setEditingFormula(null);
    setFormData({
      name: '',
      description: '',
      formula: '',
      color: '#ff0000',
      type: 'CELL_VALIDATION',
      active: true,
      workspaceId: '',
      tableId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (formula: Formula) => {
    setEditingFormula(formula);
    setFormData({
      name: formula.name,
      description: formula.description || '',
      formula: formula.formula,
      color: formula.color,
      type: formula.type,
      active: formula.active,
      workspaceId: formula.workspace.id,
      tableId: formula.table?.id || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const url = editingFormula 
        ? `/api/admin/formulas/${editingFormula.id}`
        : '/api/admin/formulas';
      
      const method = editingFormula ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tableId: formData.tableId || null
        }),
      });

      if (response.ok) {
        await fetchFormulas();
        setShowModal(false);
        setEditingFormula(null);
      } else {
        console.error('Failed to save formula');
      }
    } catch (error) {
      console.error('Error saving formula:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/formulas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFormulas();
      } else {
        console.error('Failed to delete formula');
      }
    } catch (error) {
      console.error('Error deleting formula:', error);
    }
  };

  const filteredFormulas = formulas.filter(formula =>
    formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formula.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formula.workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTables = tables.filter(table => table.workspaceId === formData.workspaceId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="font-inter">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcRules className="mr-3 w-8 h-8" />
          Formül Yönetimi
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-roboto"
        >
          <FcPlus className="mr-2 w-5 h-5" />
          Yeni Formül
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
          <input
            type="text"
            placeholder="Formül adı veya içeriği ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter"
          />
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormulas.map((formula) => (
          <div key={formula.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3 border border-gray-300"
                  style={{ backgroundColor: formula.color }}
                />
                <div>
                  <h3 className="font-semibold text-lg font-inter">{formula.name}</h3>
                  <p className="text-sm text-gray-500 font-roboto">{formula.workspace.name}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(formula)}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  title="Düzenle"
                >
                  <FcEditImage className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(formula.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Sil"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <span className={`px-2 py-1 text-xs rounded-full font-roboto ${
                formula.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {formula.active ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            
            {formula.description && (
              <p className="text-gray-600 text-sm mb-4 font-roboto">{formula.description}</p>
            )}
            
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <code className="text-sm text-gray-700 break-all font-mono">{formula.formula}</code>
            </div>
            
            <div className="mb-4 space-y-1">
              <p className="text-sm text-gray-500 font-roboto">
                Tip: <span className="font-medium text-gray-700">
                  {formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişkisel'}
                </span>
              </p>
              {formula.table && (
                <p className="text-sm text-gray-500 font-roboto">
                  Tablo: <span className="font-medium text-gray-700">{formula.table.name}</span>
                </p>
              )}
              <p className="text-sm text-gray-500 font-roboto">
                Oluşturulma: <span className="font-medium text-gray-700">
                  {new Date(formula.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </p>
            </div>

            {formula.table && (
              <Link
                href={`/dashboard/workspaces/${formula.workspace.id}/tables/${formula.table.id}`}
                className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-roboto"
              >
                <FcViewDetails className="mr-2 w-5 h-5" />
                Tabloyu Görüntüle
              </Link>
            )}
          </div>
        ))}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="text-center py-12">
          <FcRules className="mx-auto w-16 h-16 mb-4 opacity-50" />
          <p className="text-gray-500 font-roboto">
            {searchTerm ? 'Arama kriteriyle eşleşen formül bulunamadı.' : 'Henüz hiç formül bulunmamaktadır.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 font-inter">
              {editingFormula ? 'Formül Düzenle' : 'Yeni Formül Oluştur'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                  Formül Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-inter"
                  placeholder="Formül adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-roboto"
                  rows={3}
                  placeholder="Formül açıklaması"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                  Formül İfadesi *
                </label>
                <textarea
                  value={formData.formula}
                  onChange={(e) => setFormData({...formData, formula: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  rows={4}
                  placeholder="Örnek: (İletkenlik + Toplam Fosfor) > (Orto Fosfat - Alkalinite Tayini)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                    Renk
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                    Tip
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'CELL_VALIDATION' | 'RELATIONAL'})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-roboto"
                  >
                    <option value="CELL_VALIDATION">Hücre Doğrulama</option>
                    <option value="RELATIONAL">İlişkisel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                  Çalışma Alanı *
                </label>
                <select
                  value={formData.workspaceId}
                  onChange={(e) => setFormData({...formData, workspaceId: e.target.value, tableId: ''})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-roboto"
                >
                  <option value="">Çalışma alanı seçin</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
                  Tablo (İsteğe bağlı)
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => setFormData({...formData, tableId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-roboto"
                  disabled={!formData.workspaceId}
                >
                  <option value="">Tablo seçin (isteğe bağlı)</option>
                  {availableTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700 font-roboto">
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-roboto"
              >
                <FcCancel className="mr-2 w-5 h-5" />
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.formula || !formData.workspaceId}
                className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-roboto"
              >
                <MdSave className="mr-2 w-5 h-5" />
                {editingFormula ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 