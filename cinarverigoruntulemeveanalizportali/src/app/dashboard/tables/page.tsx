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
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        // Fetch tables from API
        const response = await fetch('/api/tables');
        
        if (!response.ok) {
          throw new Error('Tablo verileri yüklenemedi');
        }
        
        const data = await response.json();
        setTables(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tables:', error);
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
    <div className="container mx-auto">
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
              <span className="mr-1">+</span> Yeni Tablo Yükle
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
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
            <p className="text-gray-500">Arama kriterlerine uygun tablo bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
} 