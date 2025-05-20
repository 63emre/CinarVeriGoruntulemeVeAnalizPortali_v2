'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  tableCount?: number;
  updatedAt: string;
}

export default function DataManagementPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenemedi');
        }
        const data = await response.json();
        if (data && Array.isArray(data.workspaces)) {
          setWorkspaces(data.workspaces);
        } else {
          console.error('API response does not contain workspaces array:', data);
          setWorkspaces([]);
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError((err as Error).message);
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Veri Yönetimi</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Veri Yükleme ve Yönetimi</h2>
        <p className="mb-4">Bu bölümden çalışma alanlarınıza ait Excel verilerini yükleyebilir, düzenleyebilir ve analiz edebilirsiniz.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Link 
            href="/dashboard/workspaces" 
            className="flex flex-col items-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-lg font-medium">Çalışma Alanları</h3>
            <p className="text-sm text-center mt-2">Mevcut çalışma alanlarınızı görüntüleyin ve yönetin</p>
          </Link>
          
          <Link 
            href="/dashboard/tables" 
            className="flex flex-col items-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/30 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 dark:text-green-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium">Tablolar</h3>
            <p className="text-sm text-center mt-2">Yüklenen Excel tablolarını görüntüleyin ve düzenleyin</p>
          </Link>
          
          <Link 
            href="/dashboard/formulas" 
            className="flex flex-col items-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500 dark:text-purple-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium">Formüller</h3>
            <p className="text-sm text-center mt-2">Veri doğrulama ve analiz formülleri oluşturun</p>
          </Link>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Son Çalışma Alanları</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400">
            Henüz hiç çalışma alanı oluşturulmamış. Çalışma alanları bölümünden yeni bir çalışma alanı oluşturabilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((workspace: Workspace) => (
              <Link 
                key={workspace.id}
                href={`/dashboard/workspaces/${workspace.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition"
              >
                <h3 className="font-medium">{workspace.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workspace.description || 'Açıklama yok'}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>Tablo sayısı: {workspace.tableCount || 0}</span>
                  <span>Son güncelleme: {new Date(workspace.updatedAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 