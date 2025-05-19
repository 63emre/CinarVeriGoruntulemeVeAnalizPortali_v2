'use client';

import { useState } from 'react';
import { FcManager, FcFolder, FcDataSheet } from 'react-icons/fc';
import UserManager from '@/components/admin/UserManager';
import WorkspaceManager from '@/components/workspaces/WorkspaceManager';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'workspaces'>('users');

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sistem Yönetimi</h1>
        <p className="text-gray-600 mt-1">
          Kullanıcı ve çalışma alanı yönetimi
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'users'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <FcManager className="mr-2 h-5 w-5" />
            Kullanıcı Yönetimi
          </button>
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'workspaces'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('workspaces')}
          >
            <FcFolder className="mr-2 h-5 w-5" />
            Çalışma Alanı Yönetimi
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <UserManager />
          )}

          {activeTab === 'workspaces' && (
            <WorkspaceManager />
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Sistem Bilgileri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FcManager className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FcFolder className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Çalışma Alanları</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FcDataSheet className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Kayıtlı Tablolar</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Son sistem güncellemesi: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </div>
    </>
  );
} 