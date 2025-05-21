'use client';

import { useState, useEffect } from 'react';
import { FcAddRow, FcCancel, FcCheckmark, FcManager, FcEditImage } from 'react-icons/fc';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

// Add the interface for managing the edit modal
interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<void>;
}

// Create the modal component for editing users
function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when user changes
  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setError('');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim() || !email.trim()) {
      setError('Ad ve e-posta alanları gereklidir');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }
    
    // If password is provided, validate it
    if (password && password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Prepare update data - only include password if it was changed
      const updateData: Partial<User> = {
        id: user.id,
        name,
        email,
        role
      };
      
      if (password) {
        // TypeScript won't allow password in User type, so use type assertion
        (updateData as any).password = password;
      }
      
      await onSave(updateData);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Kullanıcı güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Kullanıcı Düzenle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ad Soyad"
            />
          </div>
          
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta Adresi
            </label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ornek@cinar.com"
            />
          </div>
          
          <div>
            <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre (Değiştirmek istemiyorsanız boş bırakın)
            </label>
            <input
              id="edit-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Yeni şifre (opsiyonel)"
            />
          </div>
          
          <div>
            <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Rolü
            </label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={user.email === 'admin@cinar.com'} // Prevent changing role for default admin
            >
              <option value="USER">Kullanıcı</option>
              <option value="ADMIN">Yönetici</option>
            </select>
          </div>
          
          {error && (
            <div className="text-red-600 flex items-center">
              <FcCancel className="h-5 w-5 mr-1" />
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FcCheckmark className="mr-2 bg-white rounded" />
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManager() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  // Add state for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Kullanıcılar yüklenemedi');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Kullanıcılar yüklenirken hata:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Tüm alanlar gereklidir');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Kullanıcı oluşturma başarısız');
      }
      
      // Add the new user to our list
      setUsers([...users, data.user]);
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('USER');
      
      setSuccess('Kullanıcı başarıyla oluşturuldu');
    } catch (err) {
      setError((err as Error).message || 'Bir hata oluştu');
      console.error('Kullanıcı oluşturma hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı silme başarısız');
      }
      
      // Remove the user from our list
      setUsers(users.filter(u => u.id !== userId));
      setSuccess('Kullanıcı başarıyla silindi');
    } catch (err) {
      setError((err as Error).message || 'Kullanıcı silinirken bir hata oluştu');
      console.error('Kullanıcı silme hatası:', err);
    }
  };
  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Rol güncelleme başarısız');
      }
      
      // Update the user in our list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      setSuccess('Kullanıcı rolü başarıyla güncellendi');
    } catch (err) {
      setError((err as Error).message || 'Rol güncellenirken bir hata oluştu');
      console.error('Rol güncelleme hatası:', err);
    }
  };
  
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };
  
  const handleUpdateUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı güncelleme başarısız');
      }
      
      const responseData = await response.json();
      
      // Update the user in our list
      setUsers(users.map(u => 
        u.id === userData.id ? { ...u, ...userData } : u
      ));
      
      setSuccess('Kullanıcı başarıyla güncellendi');
    } catch (err) {
      setError((err as Error).message || 'Kullanıcı güncellenirken bir hata oluştu');
      console.error('Kullanıcı güncelleme hatası:', err);
      throw err; // Rethrow to handle in the modal
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı güncelleme başarısız');
      }
      
      // Update the user in our list
      setUsers(users.map(u => 
        u.id === userData.id ? { ...u, ...userData } : u
      ));
      
      setSuccess('Kullanıcı başarıyla güncellendi');
    } catch (err) {
      setError((err as Error).message || 'Kullanıcı güncellenirken bir hata oluştu');
      console.error('Kullanıcı güncelleme hatası:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Yeni Kullanıcı Ekle</h2>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ad Soyad"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ornek@cinar.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="En az 6 karakter"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Rolü
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USER">Kullanıcı</option>
              <option value="ADMIN">Yönetici</option>
            </select>
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
              {isLoading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Kullanıcılar</h2>
        
        {isLoadingUsers ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FcManager className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{user.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as 'ADMIN' | 'USER')}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="USER">Kullanıcı</option>
                        <option value="ADMIN">Yönetici</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={user.email === 'admin@cinar.com'} // Prevent deleting default admin
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 py-2">Henüz kullanıcı bulunmamaktadır</p>
        )}
      </div>
      
      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}