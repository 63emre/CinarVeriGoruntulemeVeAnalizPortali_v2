'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FcFolder, FcLineChart, FcDatabase } from 'react-icons/fc';

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

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenirken hata oluştu');
        }
        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        setError('Çalışma alanları yüklenirken bir hata oluştu');
        console.error('Error fetching workspaces:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaces();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
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

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <FcFolder className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Çalışma Alanı Bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">
          Henüz hiçbir çalışma alanına erişim yetkiniz bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Çalışma Alanları</h1>
        <p className="text-gray-600">Erişiminiz olan çalışma alanlarını görüntüleyin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Link 
            key={workspace.id} 
            href={`/dashboard/workspaces/${workspace.id}`}
            className="border rounded-lg p-6 transition hover:shadow-md"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FcFolder className="h-10 w-10" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">{workspace.name}</h2>
                {workspace.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{workspace.description}</p>
                )}
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-4">
                    <FcDatabase className="mr-1" />
                    {workspace._count.tables} Tablo
                  </span>
                  <span className="flex items-center">
                    <FcLineChart className="mr-1" />
                    {workspace._count.formulas} Formül
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 