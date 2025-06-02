'use client';

import { useState, useEffect } from 'react';
import { FcDatabase, FcSearch } from 'react-icons/fc';
import Link from 'next/link';

interface TableData {
  id: string;
  name: string;
  workspace: {
    id: string;
    name: string;
  };
  rowCount: number;
  createdAt: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        console.log('🔍 Fetching tables from /api/tables...');
        
        // First check auth status
        const authResponse = await fetch('/api/auth/me');
        console.log('🔐 Auth status:', authResponse.status);
        
        if (!authResponse.ok) {
          console.log('❌ Not authenticated, redirecting to login...');
          window.location.href = '/auth/login';
          return;
        }
        
        const authData = await authResponse.json();
        console.log('✅ User authenticated:', authData.user);
        
        // Fetch tables from API
        const response = await fetch('/api/tables');
        
        console.log('📊 API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Tablo verileri yüklenemedi (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Tables data received:', data);
        console.log('📈 Number of tables:', data.length);
        
        setTables(data);
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching tables:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, []);
  
  // Filter tables based on search query
  const filteredTables = tables.filter((table: TableData) => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    table.workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <FcDatabase className="mr-2 h-6 w-6" />
            Tablolar
          </h1>
          
          <div className="flex">
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Tablo ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
            </div>
            
            <Link 
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <span className="mr-1">🏢</span> Çalışma Alanları
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mx-auto max-w-lg">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Hata Oluştu</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        ) : filteredTables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tablo Adı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çalışma Alanı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satır Sayısı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturulma Tarihi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTables.map((table: TableData) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/dashboard/workspaces/${table.workspace.id}/tables/${table.id}`}>
                        {table.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.workspace.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.rowCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(table.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/workspaces/${table.workspace.id}/tables/${table.id}`} className="text-blue-600 hover:text-blue-800">
                          Görüntüle
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={async () => {
                            if (confirm('Bu tabloyu silmek istediğinize emin misiniz?')) {
                              try {
                                const response = await fetch(`/api/tables/${table.id}`, {
                                  method: 'DELETE',
                                });
                                
                                if (response.ok) {
                                  setTables(tables.filter(t => t.id !== table.id));
                                } else {
                                  alert('Tablo silinirken bir hata oluştu');
                                }
                              } catch (error) {
                                console.error('Error deleting table:', error);
                                alert('Tablo silinirken bir hata oluştu');
                              }
                            }
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mx-auto max-w-lg">
              <FcDatabase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'Sonuç Bulunamadı' : 'Henüz Tablo Yok'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Arama kriterlerine uygun tablo bulunamadı.' 
                  : 'Henüz hiç tablo yüklenmemiş. Tablo yüklemek için önce bir çalışma alanı oluşturmanız gerekiyor.'
                }
              </p>
              {!searchQuery && (
                <div className="space-y-3">
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <span className="mr-2">🏢</span> Çalışma Alanına Git
                  </Link>
                  <br />
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    <span className="mr-2">+</span> Yeni Çalışma Alanı Oluştur
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 