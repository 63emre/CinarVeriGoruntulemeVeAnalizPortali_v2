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
  const [retryCount, setRetryCount] = useState(0);
  
  // Define fetchTables function outside useEffect so it can be reused
  const fetchTables = async () => {
    try {
      console.log('🔍 Fetching tables from /api/tables...');
      setLoading(true);
      setError(null);
      
      // First check auth status
      const authResponse = await fetch('/api/auth/me', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('🔐 Auth status:', authResponse.status);
      
      if (!authResponse.ok) {
        console.log('❌ Not authenticated, redirecting to login...');
        window.location.href = '/auth/login';
        return;
      }
      
      const authData = await authResponse.json();
      console.log('✅ User authenticated:', authData.user?.email || 'Unknown user');
      
      // Fetch tables from API with retry mechanism
      const response = await fetch('/api/tables', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📊 API Response status:', response.status);
      console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        // Try to parse as JSON for better error message
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `API Error (${response.status}): ${errorText}`);
        } catch (parseError) {
          throw new Error(`Tablo verileri yüklenemedi (${response.status}): ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('✅ Tables data received:', {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'Not an array',
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : 'No data',
        dataType: typeof data
      });
      
      // Validate data structure
      if (!Array.isArray(data)) {
        console.error('❌ API returned non-array data:', data);
        throw new Error('Geçersiz veri formatı: API array döndürmedi');
      }
      
      // Validate each table object
      const validTables = data.filter((table: any) => {
        const isValid = table && 
                       typeof table.id === 'string' && 
                       typeof table.name === 'string' && 
                       table.workspace && 
                       typeof table.workspace.name === 'string';
        
        if (!isValid) {
          console.warn('⚠️ Invalid table object filtered out:', table);
        }
        
        return isValid;
      });
      
      console.log(`📈 Valid tables found: ${validTables.length} out of ${data.length}`);
      
      setTables(validTables);
      setError(null);
      setRetryCount(0);
      
    } catch (error) {
      console.error('❌ Error fetching tables:', error);
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      
      // Automatic retry logic for network errors
      if (retryCount < 3 && (errorMessage.includes('fetch') || errorMessage.includes('Network'))) {
        console.log(`🔄 Retrying... (attempt ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchTables();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTables();
  }, []); // Remove retryCount from dependencies to avoid infinite loops
  
  // Retry function for manual retry
  const handleRetry = () => {
    setRetryCount(0);
    fetchTables();
  };
  
  // Enhanced filtering with better search
  const filteredTables = tables.filter((table: TableData) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      table.name.toLowerCase().includes(searchLower) || 
      table.workspace.name.toLowerCase().includes(searchLower) ||
      table.id.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <FcDatabase className="mr-2 h-6 w-6" />
            Tablolar
            {tables.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({tables.length})</span>
            )}
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
            <div className="ml-4 text-gray-600">
              Tablolar yükleniyor{retryCount > 0 && ` (deneme ${retryCount + 1})`}...
            </div>
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
              <div className="space-x-2">
                <button
                  onClick={handleRetry}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  🔄 Tekrar Dene
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  🔄 Sayfayı Yenile
                </button>
              </div>
              {retryCount > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Otomatik deneme sayısı: {retryCount}/3
                </p>
              )}
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
                      <Link 
                        href={`/dashboard/workspaces/${table.workspace.id}/tables/${table.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Görüntüle
                      </Link>
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
                  ? `"${searchQuery}" araması için sonuç bulunamadı.` 
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
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                >
                  <span className="mr-2">🔄</span> Aramayı Temizle
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 