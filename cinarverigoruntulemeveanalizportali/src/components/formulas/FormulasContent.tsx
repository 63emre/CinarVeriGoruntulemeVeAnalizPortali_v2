'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FcRules, FcApproval, FcHighPriority, FcFullTrash, FcSettings } from 'react-icons/fc';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
}

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

export default function FormulasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWorkspaceId = searchParams.get('workspaceId');
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(initialWorkspaceId || '');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // For editing formulas
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Fetch workspaces on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/workspaces');
        
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setWorkspaces(data);
        } else {
          throw new Error('Beklenmeyen API yanıt formatı');
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, []);
  
  // Fetch tables when workspace selection changes
  useEffect(() => {
    if (!selectedWorkspace) {
      setTables([]);
      return;
    }
    
    const fetchTables = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/workspaces/${selectedWorkspace}/tables`);
        
        if (!response.ok) {
          throw new Error('Tablolar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTables(data);
        } else {
          throw new Error('Beklenmeyen API yanıt formatı');
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
    fetchFormulas();
  }, [selectedWorkspace]);
  
  // Fetch formulas when workspace selection changes
  const fetchFormulas = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas`);
      
      if (!response.ok) {
        throw new Error('Formüller yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setFormulas(data);
      } else {
        throw new Error('Beklenmeyen API yanıt formatı');
      }
    } catch (err) {
      console.error('Error fetching formulas:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle workspace change
  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workspaceId = e.target.value;
    setSelectedWorkspace(workspaceId);
    setSelectedTableId(''); // Reset table selection when workspace changes
    
    // Update URL
    if (workspaceId) {
      router.push(`/dashboard/formulas?workspaceId=${workspaceId}`);
    } else {
      router.push('/dashboard/formulas');
    }
  };
  
  // Handle table filter change
  const handleTableFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTableId(e.target.value);
  };
    // Handle formula edit
  const handleEdit = (formula: Formula) => {
    setEditingFormula({...formula});
    setIsEditing(true);
  };
  
  // Handle formula delete
  const handleDelete = async (formulaId: string) => {
    if (isDeleting) return;
    
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setIsDeleting(formulaId);
      setError(null);
      
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas/${formulaId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Formül silinirken bir hata oluştu');
      }
      
      // Remove formula from state
      setFormulas(formulas.filter(f => f.id !== formulaId));
      
      setSuccess('Formül başarıyla silindi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting formula:', err);
      setError((err as Error).message);
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Handle formula update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFormula || !editingFormula.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/formulas/${editingFormula.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingFormula.name,
          description: editingFormula.description,
          color: editingFormula.color,
          active: editingFormula.active
        }),
      });
      
      if (!response.ok) {
        throw new Error('Formül güncellenirken bir hata oluştu');
      }
      
      // Update the formula in the state
      const updatedFormula = await response.json();
      setFormulas(formulas.map(f => (f.id === updatedFormula.id ? updatedFormula : f)));
      
      setIsEditing(false);
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
  
  // Filter formulas by selected table
  const filteredFormulas = selectedTableId
    ? formulas.filter(formula => formula.tableId === selectedTableId)
    : formulas;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FcRules className="mr-2 h-6 w-6" />
          Formül Yönetimi
        </h1>
        
        <Link href="/dashboard/formulas/create" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center">
          <span className="mr-2">+</span>
          Yeni Formül Oluştur
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Alanı Seçin
            </label>
            <select
              value={selectedWorkspace}
              onChange={handleWorkspaceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tabloya Göre Filtrele
            </label>
            <select
              value={selectedTableId}
              onChange={handleTableFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedWorkspace || loading || tables.length === 0}
            >
              <option value="">Tümünü göster</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : !selectedWorkspace ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800">
              Lütfen formülleri görüntülemek için bir çalışma alanı seçin.
            </p>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              Bu çalışma alanı için formül bulunamadı.
              {selectedTableId && ' Farklı bir tablo seçmeyi veya filtrelerini temizlemeyi deneyin.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formül Adı
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
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFormulas.map((formula) => {
                  // Find table name
                  const table = tables.find(t => t.id === formula.tableId);
                  
                  return (
                    <tr key={formula.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{formula.name}</div>
                        {formula.description && (
                          <div className="text-sm text-gray-500">{formula.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formula.type === 'CELL_VALIDATION' ? 'Hücre Doğrulama' : 'İlişki'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formula.active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <FcApproval className="mr-1" /> Aktif
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <FcHighPriority className="mr-1" /> Pasif
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
                          <span className="text-xs text-gray-800">{formula.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(formula)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FcSettings className="inline mr-1" /> Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(formula.id)}
                          disabled={isDeleting === formula.id}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FcFullTrash className="inline mr-1" />
                          {isDeleting === formula.id ? 'Siliniyor...' : 'Sil'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {isEditing && editingFormula && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FcSettings className="mr-2" />
              Formül Düzenle
            </h2>
            
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formül Adı
                </label>
                <input
                  type="text"
                  value={editingFormula.name}
                  onChange={(e) => setEditingFormula({...editingFormula, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={editingFormula.description || ''}
                  onChange={(e) => setEditingFormula({...editingFormula, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formül İfadesi
                </label>
                <div className="bg-gray-100 p-3 rounded-md text-gray-800 text-sm font-mono">
                  {editingFormula.formula}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formül ifadesi düzenlenemez. Yeni bir formül oluşturun.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vurgulama Rengi
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={editingFormula.color}
                    onChange={(e) => setEditingFormula({...editingFormula, color: e.target.value})}
                    className="h-10 w-10 border-0"
                  />
                  <span className="ml-2 text-gray-700">{editingFormula.color}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={editingFormula.active}
                    onChange={(e) => setEditingFormula({...editingFormula, active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  />
                  <span className="text-gray-700">Formül aktif</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingFormula(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 