'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FcDataSheet, FcAddRow, FcDocument, FcAreaChart } from 'react-icons/fc';
import ExcelUploader from '@/components/tables/ExcelUploader';
import WorkspaceInfo from '@/components/workspaces/WorkspaceInfo';
import TablesView from '@/components/tables/TablesView';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    tables: number;
    formulas: number;
  };
}

interface Table {
  id: string;
  name: string;
  sheetName: string;
  uploadedAt: string;
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch workspace data
    async function fetchWorkspaceData() {
      try {
        setLoading(true);
        console.log(`🔍 Fetching workspace data for ID: ${workspaceId}`);
        
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error(`❌ Workspace fetch failed: ${response.status} - ${errorData}`);
          throw new Error('Çalışma alanı verileri yüklenemedi');
        }
        
        const data = await response.json();
        console.log('✅ Workspace data loaded:', data);
        setWorkspace(data);
      } catch (err) {
        console.error('❌ Çalışma alanı verileri yükleme hatası:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch tables
    async function fetchTables() {
      try {
        console.log(`🔍 Fetching tables for workspace: ${workspaceId}`);
        
        const response = await fetch(`/api/workspaces/${workspaceId}/tables`);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error(`❌ Tables fetch failed: ${response.status} - ${errorData}`);
          throw new Error('Tablolar yüklenemedi');
        }
        
        const data = await response.json();
        console.log('✅ Tables data loaded:', data);
        console.log(`📊 Found ${Array.isArray(data) ? data.length : 0} tables`);
        
        setTables(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Tablolar yükleme hatası:', err);
        setError((err as Error).message);
      }
    }
    
    if (workspaceId) {
      fetchWorkspaceData();
      fetchTables();
    }
  }, [workspaceId]);
  
  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
  };
  
  const handleUploadSuccess = (tableIds: string[]) => {
    // Refresh table list
    fetch(`/api/workspaces/${workspaceId}/tables`)
      .then(response => response.json())
      .then(data => {
        setTables(Array.isArray(data) ? data : []);
        
        // Select the first new table if available
        if (tableIds.length > 0) {
          setSelectedTable(tableIds[0]);
        }
      })
      .catch(err => {
        console.error('Error refreshing tables:', err);
      });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-1">Lütfen daha sonra tekrar deneyin veya yöneticinizle iletişime geçin.</p>
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Çalışma Alanı Bulunamadı</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Bu çalışma alanına erişim izniniz olmayabilir veya silinmiş olabilir.</p>
        </div>
        <div className="mt-6">
          <Link 
            href="/dashboard/workspaces"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Çalışma Alanlarına Dön
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <WorkspaceInfo workspace={workspace} />
      
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              href={`/dashboard/workspaces/${workspaceId}`}
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
            >
              <FcDataSheet className="mr-2 h-5 w-5" />
              Tablolar
            </Link>
            
            <Link
              href={selectedTable ? `/dashboard/workspaces/${workspaceId}/tables/${selectedTable}` : `#`}
              className={`${
                selectedTable
                  ? 'text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  : 'text-gray-400 cursor-not-allowed'
              } whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm flex items-center`}
              onClick={(e) => {
                if (!selectedTable) {
                  e.preventDefault();
                  alert('Lütfen önce bir tablo seçin');
                }
              }}
            >
              <FcDocument className="mr-2 h-5 w-5" />
              Tablo Görünümü
            </Link>
            
            <Link
              href={selectedTable ? `/dashboard/workspaces/${workspaceId}/formulas?tableId=${selectedTable}` : `#`}
              className={`${
                selectedTable
                  ? 'text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  : 'text-gray-400 cursor-not-allowed'
              } whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm flex items-center`}
              onClick={(e) => {
                if (!selectedTable) {
                  e.preventDefault();
                  alert('Formül ekleyebilmek için önce bir tablo seçmelisiniz');
                }
              }}
            >
              <FcAddRow className="mr-2 h-5 w-5" />
              Formüller
            </Link>
            
            <Link
              href={selectedTable ? `/dashboard/workspaces/${workspaceId}/analysis?tableId=${selectedTable}` : `#`}
              className={`${
                selectedTable
                  ? 'text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  : 'text-gray-400 cursor-not-allowed'
              } whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm flex items-center`}
              onClick={(e) => {
                if (!selectedTable) {
                  e.preventDefault();
                  alert('Analiz yapabilmek için önce bir tablo seçmalısınız');
                }
              }}
            >
              <FcAreaChart className="mr-2 h-5 w-5" />
              Analiz
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="font-medium text-gray-900 mb-4 flex items-center">
            <FcAddRow className="mr-2 h-5 w-5" />
            Excel Yükle
          </h2>
          <ExcelUploader workspaceId={workspaceId} onFileUploaded={handleUploadSuccess} />
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="font-medium text-gray-900 mb-4 flex items-center">
              <FcDataSheet className="mr-2 h-5 w-5" />
              Tablolar
            </h2>
            
            <TablesView 
              tables={tables} 
              workspaceId={workspaceId} 
              onTableSelect={handleTableSelect}
              selectedTableId={selectedTable}
            />
          </div>
        </div>
      </div>
    </div>
  );
}