'use client';

import { useState, useEffect } from 'react';
import { FcDatabase, FcSearch, FcViewDetails } from 'react-icons/fc';
import Link from 'next/link';

interface Table {
  id: string;
  name: string;
  description: string | null;
  columns: string[];
  data: (string | number | null)[][];
  workspace: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      } else {
        console.error('Failed to fetch tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcDatabase className="mr-3 w-8 h-8" />
          Tüm Tablolar
        </h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
          <input
            type="text"
            placeholder="Tablo veya çalışma alanı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FcDatabase className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="font-semibold text-lg">{table.name}</h3>
                  <p className="text-sm text-gray-500">{table.workspace.name}</p>
                </div>
              </div>
            </div>
            
            {table.description && (
              <p className="text-gray-600 text-sm mb-4">{table.description}</p>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Sütun Sayısı: <span className="font-medium text-gray-700">{table.columns.length}</span>
              </p>
              <p className="text-sm text-gray-500">
                Kayıt Sayısı: <span className="font-medium text-gray-700">{table.data.length}</span>
              </p>
              <p className="text-sm text-gray-500">
                Oluşturulma: <span className="font-medium text-gray-700">
                  {new Date(table.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </p>
            </div>

            <Link
              href={`/dashboard/workspaces/${table.workspace.id}/tables/${table.id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FcViewDetails className="mr-2 w-5 h-5" />
              Görüntüle
            </Link>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <FcDatabase className="mx-auto w-16 h-16 mb-4 opacity-50" />
          <p className="text-gray-500">Henüz hiç tablo bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
} 