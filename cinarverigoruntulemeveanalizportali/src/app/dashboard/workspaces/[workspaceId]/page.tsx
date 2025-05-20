'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FcFolder, FcDataSheet, FcLineChart, FcRules } from 'react-icons/fc';
import ExcelUploader from '@/components/tables/ExcelUploader';
import EditableDataTable from '@/components/tables/EditableDataTable';
import FormulaEditor from '@/components/formulas/FormulaEditor';
import TrendAnalysis from '@/components/analysis/TrendAnalysis';

interface WorkspaceDetailsProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface DataTableData {
  id: string;
  name: string;
  sheetName: string;
  uploadedAt: string;
}

// Helper function to unwrap the params promise
async function unwrapParams(params: Promise<{ workspaceId: string }>) {
  return await params;
}

export default function WorkspaceDetailsPage({ params }: WorkspaceDetailsProps) {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tables' | 'formulas' | 'analysis'>('tables');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tables, setTables] = useState<DataTableData[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract the id when the component mounts
  useEffect(() => {
    async function getWorkspaceId() {
      try {
        const { workspaceId } = await unwrapParams(params);
        setWorkspaceId(workspaceId);
      } catch (err) {
        console.error('Error extracting workspace ID:', err);
        setError('Failed to load workspace ID');
        setIsLoading(false);
      }
    }
    
    getWorkspaceId();
  }, [params]);

  // Fetch workspace data when workspaceId is available
  useEffect(() => {
    if (!workspaceId) return;
    
    async function fetchWorkspaceData() {
      try {
        // Fetch workspace details
        const workspaceResponse = await fetch(`/api/workspaces/${workspaceId}`);
        if (!workspaceResponse.ok) {
          if (workspaceResponse.status === 403) {
            router.push('/dashboard');
            return;
          }
          throw new Error('Çalışma alanı bilgileri yüklenemedi');
        }
        const workspaceData = await workspaceResponse.json();
        setWorkspace(workspaceData);

        // Fetch tables in this workspace
        const tablesResponse = await fetch(`/api/workspaces/${workspaceId}/tables`);
        if (!tablesResponse.ok) {
          throw new Error('Tablolar yüklenemedi');
        }
        const tablesData = await tablesResponse.json();
        setTables(tablesData);
        
        // Set the first table as selected if available
        if (tablesData.length > 0) {
          setSelectedTableId(tablesData[0].id);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching workspace data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaceData();
  }, [workspaceId, router]);

  const handleTableUploadSuccess = async (tableIds: string[]) => {
    try {
      // Refresh table list
      const tablesResponse = await fetch(`/api/workspaces/${workspaceId}/tables`);
      if (!tablesResponse.ok) {
        throw new Error('Tablolar yüklenemedi');
      }
      const tablesData = await tablesResponse.json();
      setTables(tablesData);
      
      // Set the newly uploaded table as selected
      if (tableIds.length > 0 && tablesData.length > 0) {
        const newTable = tablesData.find((table: DataTableData) => tableIds.includes(table.id));
        if (newTable) {
          setSelectedTableId(newTable.id);
        }
      }
    } catch (err) {
      console.error('Error refreshing tables:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Çalışma alanı bulunamadı</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start">
          <FcFolder className="h-10 w-10 mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-black">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-gray-800 mt-1">{workspace.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'tables'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-800 hover:text-black hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('tables')}
          >
            <FcDataSheet className="mr-2 h-5 w-5" />
            Tablolar
          </button>
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'formulas'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-800 hover:text-black hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('formulas')}
          >
            <FcRules className="mr-2 h-5 w-5" />
            Formüller
          </button>
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'analysis'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-800 hover:text-black hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('analysis')}
          >
            <FcLineChart className="mr-2 h-5 w-5" />
            Trend Analizi
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'tables' && (
            <div>
              <ExcelUploader 
                workspaceId={workspaceId} 
                onUploadSuccess={handleTableUploadSuccess} 
              />
              
              {tables.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <label htmlFor="tableSelect" className="block text-sm font-medium text-gray-800 mb-1">
                      Tablo Seçin
                    </label>
                    <select
                      id="tableSelect"
                      value={selectedTableId || ''}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name} - {table.sheetName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedTableId && (
                    <EditableDataTable tableId={selectedTableId} workspaceId={workspaceId} />
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FcDataSheet className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz tablo yok</h3>
                  <p className="mt-1 text-sm text-gray-800">
                    Yukarıdaki form aracılığıyla Excel dosyası yükleyerek başlayın.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'formulas' && (
            <FormulaEditor workspaceId={workspaceId} />
          )}

          {activeTab === 'analysis' && (
            <div>
              {tables.length > 0 ? (
                <TrendAnalysis
                  workspaceId={workspaceId}
                  tables={tables}
                  selectedTableId={selectedTableId || tables[0].id}
                  onTableSelect={setSelectedTableId}
                />
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FcLineChart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Analiz için veri yok</h3>
                  <p className="mt-1 text-sm text-gray-800">
                    Önce "Tablolar" sekmesinden veri yüklemeniz gerekiyor.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 