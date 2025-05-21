'use client';

import { useState, useEffect } from 'react';
import { FcAddRow, FcCancel, FcCheckmark, FcFolder } from 'react-icons/fc';

interface WorkspaceManagerProps {
  onWorkspaceAdded?: (workspace: Workspace) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  users: {
    id: string;
    userId: string;
    workspaceId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export default function WorkspaceManager({ onWorkspaceAdded }: WorkspaceManagerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  useEffect(() => {
    // Fetch workspaces
    async function fetchWorkspaces() {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenemedi');
        }
        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    }
    
    // Fetch users
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Kullanıcılar yüklenemedi');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoadingUsers(false);
      }
    }
    
    fetchWorkspaces();
    fetchUsers();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Çalışma alanı adı gereklidir');
      return;
    }
    
    setLoading(true);
    setError('');
    
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
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Çalışma alanı oluşturulamadı');
      }
      
      const workspace = await response.json();
      
      // Reset form
      setName('');
      setDescription('');
      setSuccess('Çalışma alanı başarıyla oluşturuldu');
      
      // Add to workspaces list
      setWorkspaces([...workspaces, workspace]);
      
      // Call callback if provided
      if (onWorkspaceAdded) {
        onWorkspaceAdded(workspace);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorkspace) {
      setError('Lütfen bir çalışma alanı seçin');
      return;
    }
    
    if (!selectedUser) {
      setError('Lütfen bir kullanıcı seçin');
      return;
    }
    
    setIsAddingUser(true);
    setError('');
    
    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: users.find(u => u.id === selectedUser)?.email
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı çalışma alanına eklenemedi');
      }
      
      // Update the workspaces list to reflect the change
      const updatedWorkspaces = workspaces.map(ws => {
        if (ws.id === selectedWorkspace) {
          // Find the user that was added
          const user = users.find(u => u.id === selectedUser);
          if (user) {
            // Add the user to the workspace's users list
            return {
              ...ws,
              users: [
                ...ws.users,
                {
                  id: `temp-${Date.now()}`, // This will be replaced when we refresh
                  userId: user.id,
                  workspaceId: ws.id,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                  },
                },
              ],
            };
          }
        }
        return ws;
      });
      
      setWorkspaces(updatedWorkspaces);
      setSelectedUser('');
      setSuccess('Kullanıcı çalışma alanına başarıyla eklendi');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAddingUser(false);
    }
  };
  
  const handleRemoveUser = async (workspaceId: string, userId: string) => {
    if (!confirm('Bu kullanıcıyı çalışma alanından kaldırmak istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı çalışma alanından kaldırılamadı');
      }
      
      // Update the workspaces list to reflect the change
      const updatedWorkspaces = workspaces.map(ws => {
        if (ws.id === workspaceId) {
          return {
            ...ws,
            users: ws.users.filter(u => u.userId !== userId),
          };
        }
        return ws;
      });
      
      setWorkspaces(updatedWorkspaces);
      setSuccess('Kullanıcı çalışma alanından başarıyla kaldırıldı');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FcAddRow className="mr-2 h-6 w-6" />
          Yeni Çalışma Alanı Oluştur
        </h2>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Çalışma Alanı Adı
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Çalışma alanı adını girin"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama (isteğe bağlı)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Açıklama girin"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setName('');
                setDescription('');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
              disabled={loading}
            >
              <FcCancel className="mr-2 h-5 w-5" />
              İptal
            </button>
            
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oluşturuluyor...
                </span>
              ) : (
                <>
                  <FcCheckmark className="mr-2 h-5 w-5" />
                  Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Workspace List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FcFolder className="mr-2 h-6 w-6" />
          Çalışma Alanlarını Yönet
        </h2>
        
        {isLoadingWorkspaces ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Çalışma alanı bulunamadı. Yukarıdan ilk çalışma alanınızı oluşturun.
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Assignment Form */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Çalışma Alanına Kullanıcı Ekle</h3>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-1">
                      Çalışma Alanı Seç
                    </label>
                    <select
                      id="workspace"
                      value={selectedWorkspace || ''}
                      onChange={(e) => setSelectedWorkspace(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option key="default-workspace" value="">Bir çalışma alanı seçin</option>
                      {workspaces.map((workspace) => (
                        <option key={`workspace-${workspace.id}`} value={workspace.id}>
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanıcı Seç
                    </label>
                    <select
                      id="user"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoadingUsers}
                    >
                      <option key="default-user" value="">Bir kullanıcı seçin</option>
                      {users.map((user) => (
                        <option key={`user-${user.id}`} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={isAddingUser || !selectedWorkspace || !selectedUser}
                  >
                    {isAddingUser ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ekleniyor...
                      </span>
                    ) : (
                      <span>Kullanıcı Ekle</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Workspace Accordion */}
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <div key={`workspace-container-${workspace.id}`} className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-medium">{workspace.name}</h3>
                    <span className="text-sm text-gray-500">
                      {workspace.users?.length || 0} kullanıcı
                    </span>
                  </div>
                  
                  <div className="p-4">
                    {workspace.description && (
                      <p className="text-gray-600 mb-4">{workspace.description}</p>
                    )}
                    
                    <h4 className="font-medium mb-2">Kullanıcılar:</h4>
                    
                    {!workspace.users || workspace.users.length === 0 ? (
                      <p className="text-gray-500">Bu çalışma alanına henüz kullanıcı atanmamış.</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {workspace.users.map((userWorkspace) => (
                          <li key={`user-workspace-${userWorkspace.id || userWorkspace.userId}-${workspace.id}`} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{userWorkspace.user?.name || 'Bilinmeyen Kullanıcı'}</p>
                              <p className="text-sm text-gray-500">{userWorkspace.user?.email || 'E-posta yok'}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveUser(workspace.id, userWorkspace.userId)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Kaldır
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 