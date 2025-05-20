'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormulaEditor from '@/components/formulas/FormulaEditor';
import { FcDatabase, FcRules, FcHome } from 'react-icons/fc';
import Link from 'next/link';

// Suspense ile sarmalanmış bileşen
function FormulasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId');
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workspace detaylarını getir
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Workspace bilgilerini al
        const workspaceRes = await fetch(`/api/workspaces/${workspaceId}`);
        if (!workspaceRes.ok) {
          throw new Error('Çalışma alanı yüklenemedi');
        }
        const workspaceData = await workspaceRes.json();
        setWorkspace(workspaceData);

        // Bu workspace'deki tabloları al
        const tablesRes = await fetch(`/api/workspaces/${workspaceId}/tables`);
        if (!tablesRes.ok) {
          throw new Error('Tablolar yüklenemedi');
        }
        const tablesData = await tablesRes.json();
        setTables(tablesData);
        
        // Varsayılan olarak ilk tabloyu seç
        if (tablesData.length > 0 && !selectedTableId) {
          setSelectedTableId(tablesData[0].id);
        }
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError('Çalışma alanı verileri yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [workspaceId, selectedTableId]);

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
  };

  // workspaceId yoksa, seçim ekranı göster
  if (!workspaceId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Formül Yönetimi</h1>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              Lütfen önce bir çalışma alanı seçin. Formüller her zaman bir çalışma alanı kapsamında oluşturulur.
            </p>
          </div>
          <Link 
            href="/dashboard/workspaces" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Çalışma Alanlarına Git
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/workspaces')} 
            className="mt-2 text-red-700 underline"
          >
            Çalışma Alanlarına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Gezinti yolu */}
      <div className="mb-6 flex flex-wrap items-center text-sm text-gray-600">
        <Link href="/dashboard" className="flex items-center hover:text-blue-600">
          <FcHome className="mr-1" /> Kontrol Paneli
        </Link>
        <span className="mx-2">›</span>
        <Link href="/dashboard/workspaces" className="flex items-center hover:text-blue-600">
          <FcDatabase className="mr-1" /> Çalışma Alanları
        </Link>
        <span className="mx-2">›</span>
        <Link 
          href={`/dashboard/workspaces/${workspaceId}`} 
          className="flex items-center hover:text-blue-600"
        >
          {workspace?.name || 'Çalışma Alanı'}
        </Link>
        <span className="mx-2">›</span>
        <span className="flex items-center font-medium text-gray-800">
          <FcRules className="mr-1" /> Formüller
        </span>
      </div>
      
      {/* Başlık */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h1 className="text-xl font-bold text-black mb-2">
          {workspace?.name || 'Çalışma Alanı'} için Formül Yönetimi
        </h1>
        <p className="text-gray-700 text-sm">
          Verilerinizi doğrulamak ve analiz etmek için formüller oluşturun ve yönetin. Formüller, veri desenlerini ve tutarsızlıkları vurgulamak için kullanılabilir.
        </p>
      </div>
      
      {/* Tablo seçimi */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-black mb-3">Tablo Seçin</h2>
        
        {tables.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">
              Bu çalışma alanında tablo bulunamadı. Lütfen önce Excel dosyaları yükleyerek tablolar oluşturun.
            </p>
            <Link 
              href={`/dashboard/workspaces/${workspaceId}`} 
              className="mt-2 text-blue-600 underline inline-block"
            >
              Tabloları Yüklemek İçin Çalışma Alanına Git
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {tables.map((table: any) => (
                <div 
                  key={table.id}
                  onClick={() => handleSelectTable(table.id)}
                  className={`border p-3 rounded-md cursor-pointer transition ${
                    selectedTableId === table.id 
                      ? 'border-blue-500 bg-blue-100 text-black' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{table.name}</div>
                  <div className="text-xs mt-1 text-gray-500">
                    Sayfa: {table.sheetName} ({table.rowCount || '?'} satır)
                  </div>
                </div>
              ))}
            </div>
            
            {selectedTableId && (
              <Link 
                href={`/dashboard/workspaces/${workspaceId}/tables/${selectedTableId}`} 
                className="text-blue-600 text-sm hover:underline"
              >
                Tablo Verilerini Görüntüle →
              </Link>
            )}
          </div>
        )}
      </div>
      
      {/* Formül Editörü */}
      {workspaceId && (
        <FormulaEditor 
          workspaceId={workspaceId} 
          tableId={selectedTableId}
          onFormulaAdded={() => {
            // İsteğe bağlı işlemler eklenebilir
          }}
        />
      )}
    </div>
  );
}

// Ana sayfa bileşeni
export default function FormulasPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    }>
      <FormulasContent />
    </Suspense>
  );
} 