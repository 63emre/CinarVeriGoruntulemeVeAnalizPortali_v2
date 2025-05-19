'use client';

import { useState, useEffect } from 'react';
import { FcAddRow, FcCancel, FcCheckmark, FcFolder } from 'react-icons/fc';

interface WorkspaceManagerProps {
  onWorkspaceAdded?: (workspace: any) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function WorkspaceManager({ onWorkspaceAdded }: WorkspaceManagerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<Record<string, User[]>>({});
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch workspaces
        const workspacesResponse = await fetch('/api/workspaces');
        if (!workspacesResponse.ok) {
          throw new Error('Çalışma alanları yüklenemedi');
        }
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(workspacesData);

        // Fetch users (admin only)
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Kullanıcılar yüklenemedi');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch workspace users for each workspace
        for (const workspace of workspacesData) {
          const workspaceUsersResponse = await fetch(`/api/workspaces/${workspace.id}/users`);
          if (workspaceUsersResponse.ok) {
            const workspaceUsersData = await workspaceUsersResponse.json();
            setWorkspaceUsers(prev => ({
              ...prev,
              [workspace.id]: workspaceUsersData
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError((err as Error).message);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    }

    fetchData();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('Çalışma alanı adı gereklidir');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Çalışma alanı oluşturma başarısız');
      }
      
      // Add the new workspace to our list
      setWorkspaces([...workspaces, data.workspace]);
      
      // Clear form
      setName('');
      setDescription('');
      
      setSuccess('Çalışma alanı başarıyla oluşturuldu');
      
      // Call callback if provided
      if (onWorkspaceAdded) {
        onWorkspaceAdded(data.workspace);
      }
    } catch (err) {
      setError((err as Error).message || 'Bir hata oluştu');
      console.error('Workspace creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (workspaceId: string) => {
    if (!confirm('Bu çalışma alanını silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Çalışma alanı silme başarısız');
      }
      
      // Remove the workspace from our list
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
      setSuccess('Çalışma alanı başarıyla silindi');
    } catch (err) {
      setError((err as Error).message || 'Çalışma alanı silinirken bir hata oluştu');
      console.error('Workspace deletion error:', err);
    }
  };

  const handleUserAssignment = async () => {
    if (!selectedWorkspace || selectedUsers.length === 0) {
      setError('Lütfen bir çalışma alanı ve en az bir kullanıcı seçin');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Kullanıcı atama başarısız');
      }
      
      // Update workspace users
      setWorkspaceUsers(prev => ({
        ...prev,
        [selectedWorkspace]: data.users
      }));
      
      setSuccess('Kullanıcılar başarıyla atandı');
      setSelectedUsers([]);
    } catch (err) {
      setError((err as Error).message || 'Kullanıcı atanırken bir hata oluştu');
      console.error('User assignment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (workspaceId: string, userId: string) => {
    if (!confirm('Bu kullanıcıyı çalışma alanından çıkarmak istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı çıkarma başarısız');
      }
      
      // Update workspace users
      const updatedUsers = workspaceUsers[workspaceId].filter(u => u.id !== userId);
      setWorkspaceUsers(prev => ({
        ...prev,
        [workspaceId]: updatedUsers
      }));
      
      setSuccess('Kullanıcı başarıyla çıkarıldı');
    } catch (err) {
      setError((err as Error).message || 'Kullanıcı çıkarılırken bir hata oluştu');
      console.error('User removal error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Workspace Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Yeni Çalışma Alanı Oluştur</h2>
        
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Alanı Adı
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örnek: Arıtma Tesisi Projesi"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bu çalışma alanının amacını açıklayın"
              rows={2}
            />
          </div>
          
          {error && (
            <div className="text-red-600 flex items-center">
              <FcCancel className="h-5 w-5 mr-1" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 flex items-center">
              <FcCheckmark className="h-5 w-5 mr-1" />
              {success}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FcAddRow className="mr-2 bg-white rounded" />
              {isLoading ? 'Oluşturuluyor...' : 'Çalışma Alanı Oluştur'}
            </button>
          </div>
        </form>
      </div>
      
      {/* User Assignment */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Kullanıcı Atama</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Alanı
            </label>
            <select
              id="workspace"
              value={selectedWorkspace || ''}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Çalışma Alanı Seçin --</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="users" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcılar
            </label>
            <select
              id="users"
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              size={5}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Birden fazla kullanıcı seçmek için Ctrl (veya Cmd) tuşunu basılı tutun
            </p>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleUserAssignment}
              disabled={isLoading || !selectedWorkspace || selectedUsers.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kullanıcıları Ata
            </button>
          </div>
        </div>
      </div>
      
      {/* Workspace List with Users */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Çalışma Alanları ve Kullanıcıları</h2>
        
        {isLoadingWorkspaces ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : workspaces.length > 0 ? (
          <div className="space-y-6">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start">
                    <FcFolder className="h-6 w-6 mr-2 mt-1" />
                    <div>
                      <h3 className="font-medium">{workspace.name}</h3>
                      {workspace.description && <p className="text-sm text-gray-600">{workspace.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(workspace.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Sil
                  </button>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Atanmış Kullanıcılar:</h4>
                  {workspaceUsers[workspace.id]?.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {workspaceUsers[workspace.id]?.map((user) => (
                        <li key={user.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>{user.name} ({user.email})</span>
                          <button
                            onClick={() => handleRemoveUser(workspace.id, user.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Çıkar
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Henüz kullanıcı atanmamış</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 py-2">Henüz çalışma alanı oluşturulmamış</p>
        )}
      </div>
    </div>
  );
} 