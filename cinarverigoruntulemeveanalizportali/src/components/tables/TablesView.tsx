'use client';

import { useState, useEffect } from 'react';
import { FcDocument, FcOpenedFolder } from 'react-icons/fc';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Table {
  id: string;
  name: string;
  sheetName: string;
  uploadedAt: string;
}

interface TablesViewProps {
  tables: Table[];
  workspaceId: string;
  onTableSelect?: (tableId: string) => void;
  selectedTableId?: string | null;
}

export default function TablesView({ 
  tables, 
  workspaceId, 
  onTableSelect,
  selectedTableId
}: TablesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTables = tables?.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.sheetName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Debug logging
  useEffect(() => {
    console.log('🔍 TablesView:', { tablesCount: tables?.length || 0, workspaceId });
  }, [tables, workspaceId]);

  // Debug render info
  useEffect(() => {
    console.log('📊 TablesView Render:', {
      originalTablesCount: tables?.length || 0,
      filteredTablesCount: filteredTables.length,
      searchTerm
    });
  }, [tables, filteredTables, searchTerm]);

  return (
    <div>
      {!tables || tables.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <FcOpenedFolder className="mx-auto h-12 w-12 mb-3" />
          <h3 className="text-gray-600 font-medium">Henüz Tablo Yok</h3>
          <p className="text-gray-500 text-sm mt-1">
            Excel dosyaları yükleyerek veri tablolarınızı oluşturun.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Debug: tables={tables ? 'array' : 'null/undefined'}, length={tables?.length || 0}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tablolarda ara..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto max-h-96">
            <div className="space-y-3">
              {filteredTables.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Arama kriterine uygun tablo bulunamadı.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Filtrelenmiş: {filteredTables.length} / Toplam: {tables.length}
                  </p>
                </div>
              ) : (
                filteredTables.map(table => (
                  <div 
                    key={table.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTableId === table.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      console.log('🖱️ Table clicked:', table.id, table.name);
                      onTableSelect && onTableSelect(table.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <FcDocument className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-900">{table.name}</h3>
                          <p className="text-sm text-gray-600">Sayfa: {table.sheetName}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(table.uploadedAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>

                    <div className="flex mt-2 justify-end">
                      <a
                        href={`/dashboard/workspaces/${workspaceId}/tables/${table.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          console.log('🔗 Table link clicked:', table.id);
                          e.stopPropagation(); // Prevent parent div click
                        }}
                      >
                        Görüntüle →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 