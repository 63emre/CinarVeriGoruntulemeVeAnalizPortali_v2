'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcHome, FcDatabase, FcRules, FcFolder } from 'react-icons/fc';
import { Card } from '@/components/ui/card';
import ExcelUploader from '@/components/tables/ExcelUploader';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tables: Table[];
}

interface Table {
  id: string;
  name: string;
  sheetName: string;
  uploadedAt: string;
  rowCount?: number;
}

export default function WorkspaceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = typeof params.workspaceId === 'string' ? params.workspaceId : '';
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Çalışma alanı bulunamadı');
          }
          throw new Error('Çalışma alanını yüklerken bir hata oluştu');
        }
        
        const data = await response.json();
        setWorkspace(data);
      } catch (err) {
        setError((err as Error).message);
        console.error('Çalışma alanı yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspace();
  }, [workspaceId, refreshTrigger]);

  const handleFileUploaded = () => {
    // Tabloları yenilemek için refresh trigger'ı değiştir
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500">
          <h2 className="text-red-800 font-medium">Hata</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/workspaces')}
            className="mt-2 text-red-700 hover:text-red-900 underline"
          >
            Çalışma Alanları Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-500">
          <h2 className="text-yellow-800 font-medium">Çalışma Alanı Bulunamadı</h2>
          <p className="text-yellow-700">İstenen çalışma alanı bulunamadı veya erişim izniniz yok.</p>
          <button 
            onClick={() => router.push('/dashboard/workspaces')}
            className="mt-2 text-yellow-700 hover:text-yellow-900 underline"
          >
            Çalışma Alanları Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Gezinti Yolu */}
      <div className="mb-6 flex flex-wrap items-center text-sm text-gray-500">
        <Link href="/dashboard" className="flex items-center hover:text-blue-600 transition">
          <FcHome className="mr-1" /> Kontrol Paneli
        </Link>
        <span className="mx-2">›</span>
        <Link href="/dashboard/workspaces" className="flex items-center hover:text-blue-600 transition">
          <FcFolder className="mr-1" /> Çalışma Alanları
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-medium flex items-center">
          <FcDatabase className="mr-1" /> {workspace.name}
        </span>
      </div>
      
      {/* Çalışma Alanı Başlığı ve Özeti */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{workspace.name}</h1>
          
          <div className="flex gap-2 mt-2 md:mt-0">
            <Link 
              href={`/dashboard/formulas?workspaceId=${workspaceId}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center"
            >
              <FcRules className="mr-2 bg-white rounded-full p-1" /> 
              Formülleri Yönet
            </Link>
          </div>
        </div>
        
        {workspace.description && (
          <p className="text-gray-600 mb-4">{workspace.description}</p>
        )}
        
        <div className="text-sm text-gray-500">
          <span className="mr-4">Oluşturulma: {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true, locale: tr })}</span>
          <span>Son Güncelleme: {formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true, locale: tr })}</span>
        </div>
      </div>
      
      {/* Excel Yükleme Bölümü */}
      <Card className="mb-8 p-5">
        <h2 className="text-xl font-semibold mb-4">Excel Dosyası Yükle</h2>
        <ExcelUploader 
          workspaceId={workspaceId} 
          onFileUploaded={handleFileUploaded}
        />
      </Card>
      
      {/* Tablolar Listesi */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FcDatabase className="mr-2" /> Tablolar
        </h2>
        
        {workspace.tables.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-700">Bu çalışma alanında henüz hiç tablo yok. Excel dosyaları yükleyerek veri tablolarınızı oluşturun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspace.tables.map(table => (
              <Card key={table.id} className="hover:shadow-md transition-shadow">
                <Link 
                  href={`/dashboard/workspaces/${workspaceId}/tables/${table.id}`}
                  className="block p-5 h-full"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg text-gray-800">{table.name}</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {table.rowCount || '?'} satır
                    </span>
                  </div>
                  
                  <div className="text-gray-500 text-sm mb-3">
                    Sayfa: {table.sheetName}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-auto">
                    Yüklenme: {formatDistanceToNow(new Date(table.uploadedAt), { addSuffix: true, locale: tr })}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 