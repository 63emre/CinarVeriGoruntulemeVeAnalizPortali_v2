'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiTable, FiCode } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  users: {
    user: User;
  }[];
  _count: {
    tables: number;
    formulas: number;
  };
}

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    createdBy: ''
  });

  useEffect(() => {
    fetchWorkspaces();
    fetchUsers();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingWorkspace 
        ? `/api/workspaces/${editingWorkspace.id}`
        : '/api/workspaces';
      
      const method = editingWorkspace ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchWorkspaces();
        setShowCreateModal(false);
        setEditingWorkspace(null);
        setFormData({ name: '', description: '', createdBy: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving workspace:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setFormData({
      name: workspace.name,
      description: workspace.description || '',
      createdBy: workspace.createdBy
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (workspaceId: string) => {
    if (!confirm('Bu çalışma alanını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchWorkspaces();
      } else {
        const error = await response.json();
        alert(error.message || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert('Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', createdBy: '' });
    setEditingWorkspace(null);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Çalışma Alanları</h1>
          <p className="text-gray-600">Tüm çalışma alanlarını yönetin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus /> Yeni Çalışma Alanı
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workspace.name}</h3>
                {workspace.description && (
                  <p className="text-gray-600 text-sm mt-1">{workspace.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(workspace)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(workspace.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>Oluşturulma: {new Date(workspace.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1 text-blue-500">
                  <FiTable size={16} />
                  <span>{workspace._count.tables} Tablo</span>
                </div>
                                <div className="flex items-center gap-1 text-green-500">                  <FiCode size={16} />                  <span>{workspace._count.formulas} Formül</span>                </div>
                <div className="flex items-center gap-1 text-purple-500">
                  <FiUsers size={16} />
                  <span>{workspace.users.length} Kullanıcı</span>
                </div>
              </div>
            </div>

            {/* Users list */}
            {workspace.users.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Kullanıcılar:</p>
                <div className="flex flex-wrap gap-1">
                  {workspace.users.map((wu) => (
                    <span
                      key={wu.user.id}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {wu.user.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingWorkspace ? 'Çalışma Alanını Düzenle' : 'Yeni Çalışma Alanı'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışma Alanı Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {!editingWorkspace && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sahip
                  </label>
                  <select
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Kullanıcı seçin</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingWorkspace ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 