'use client';

import { useState, useEffect } from 'react';
import WorkspaceManager from '@/components/workspaces/WorkspaceManager';
import { FcFolder } from 'react-icons/fc';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaces();
  }, []);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FcFolder className="mr-2 h-8 w-8" />
          Çalışma Alanları
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Çalışma alanlarınızı yönetin ve düzenleyin
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <WorkspaceManager 
          onWorkspaceAdded={(workspace) => {
            setWorkspaces([...workspaces, workspace]);
          }}
        />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Çalışma Alanlarınız</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz bir çalışma alanınız yok. Yukarıdan yeni bir çalışma alanı oluşturun.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/dashboard/workspaces/${workspace.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-lg mb-1">{workspace.name}</h3>
                  {workspace.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{workspace.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Oluşturulma: {new Date(workspace.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 