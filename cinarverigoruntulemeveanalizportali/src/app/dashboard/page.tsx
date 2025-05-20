'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { FcDatabase, FcRules, FcAddDatabase, FcFolder } from 'react-icons/fc';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Kullanıcı bilgilerini getir
        const userRes = await fetch('/api/user');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Çalışma alanlarını getir
        const workspacesRes = await fetch('/api/workspaces');
        if (workspacesRes.ok) {
          const workspacesData = await workspacesRes.json();
          setWorkspaces(workspacesData);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Kontrol Paneli</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
          <FcFolder className="mr-2 text-2xl" /> Çalışma Alanlarım
        </h2>
        
        {workspaces.length === 0 ? (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-yellow-700">Henüz hiç çalışma alanı oluşturmadınız.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((workspace: any) => (
              <Card key={workspace.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">{workspace.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {workspace.tables?.length || 0} Tablo
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {workspace.description || 'Açıklama yok'}
                  </p>
                  
                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/dashboard/workspaces/${workspace.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition text-center"
                    >
                      Tablolar
                    </Link>
                    <Link
                      href={`/dashboard/formulas?workspaceId=${workspace.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition text-center"
                    >
                      Formüller
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-5">
          <Link
            href="/dashboard/workspaces/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <FcAddDatabase className="mr-2 bg-white rounded-full p-1" /> 
            <span>Yeni Çalışma Alanı Oluştur</span>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FcDatabase className="mr-2 text-2xl" /> Veri Yönetimi
          </h2>
          <p className="text-gray-600 mb-4">
            Excel dosyalarını yükleyin, düzenleyin ve analiz edin. Verilerinizi tablolar halinde organize edin.
          </p>
          <Link
            href="/dashboard/workspaces"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition inline-block"
          >
            Tablo Yönetimine Git
          </Link>
        </Card>
        
        <Card className="p-5">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FcRules className="mr-2 text-2xl" /> Formül Yönetimi
          </h2>
          <p className="text-gray-600 mb-4">
            Verilerinizi doğrulamak, ilişkileri kontrol etmek ve analiz etmek için özel formüller oluşturun.
          </p>
          <Link
            href="/dashboard/formulas"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition inline-block"
          >
            Formül Yönetimine Git
          </Link>
        </Card>
      </div>
    </div>
  );
} 