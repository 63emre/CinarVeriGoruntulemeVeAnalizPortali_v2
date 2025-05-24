'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DebugInfo {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    hasToken: boolean;
  };
  apis: {
    tables: { status: number; data?: unknown; error?: string };
    workspaces: { status: number; data?: unknown; error?: string };
    debug: { status: number; data?: unknown; error?: string };
  };
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runDiagnostics() {
      const info: DebugInfo = {
        auth: { isAuthenticated: false, user: null, hasToken: false },
        apis: {
          tables: { status: 0 },
          workspaces: { status: 0 },
          debug: { status: 0 }
        }
      };

      try {
        // Test 1: Authentication
        console.log('🔍 Testing authentication...');
        const authResponse = await fetch('/api/auth/me');
        info.auth.isAuthenticated = authResponse.ok;
        if (authResponse.ok) {
          const authData = await authResponse.json();
          info.auth.user = authData.user;
        }

        // Test 2: Debug endpoint
        console.log('🔍 Testing debug endpoint...');
        const debugResponse = await fetch('/api/debug');
        info.apis.debug.status = debugResponse.status;
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          info.apis.debug.data = debugData;
          info.auth.hasToken = debugData.hasToken;
        } else {
          info.apis.debug.error = await debugResponse.text();
        }

        // Test 3: Tables API
        console.log('🔍 Testing tables API...');
        const tablesResponse = await fetch('/api/tables');
        info.apis.tables.status = tablesResponse.status;
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          info.apis.tables.data = tablesData;
        } else {
          info.apis.tables.error = await tablesResponse.text();
        }

        // Test 4: Workspaces API
        console.log('🔍 Testing workspaces API...');
        const workspacesResponse = await fetch('/api/workspaces');
        info.apis.workspaces.status = workspacesResponse.status;
        if (workspacesResponse.ok) {
          const workspacesData = await workspacesResponse.json();
          info.apis.workspaces.data = workspacesData;
        } else {
          info.apis.workspaces.error = await workspacesResponse.text();
        }

      } catch (error) {
        console.error('❌ Diagnostic error:', error);
      } finally {
        setDebugInfo(info);
        setLoading(false);
      }
    }

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Sistem Tanılaması</h1>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span>Sistem kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  if (!debugInfo) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Sistem Tanılaması</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ❌ Tanılama sırasında hata oluştu
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Sistem Tanılama Raporu</h1>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          {debugInfo.auth.isAuthenticated ? '✅' : '❌'} Yetkilendirme Durumu
        </h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Oturum Açılmış:</strong> {debugInfo.auth.isAuthenticated ? 'Evet' : 'Hayır'}
          </div>
          <div>
            <strong>Token Mevcut:</strong> {debugInfo.auth.hasToken ? 'Evet' : 'Hayır'}
          </div>
          {debugInfo.auth.user && (
            <div>
              <strong>Kullanıcı:</strong> {debugInfo.auth.user.name} ({debugInfo.auth.user.email})
              <br />
              <strong>Rol:</strong> {debugInfo.auth.user.role}
            </div>
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">🔌 API Durum Kontrolü</h2>
        
        {/* Tables API */}
        <div className="mb-4">
          <h3 className="font-medium flex items-center">
            {debugInfo.apis.tables.status === 200 ? '✅' : '❌'} Tablolar API
            <span className="ml-2 text-sm text-gray-600">({debugInfo.apis.tables.status})</span>
          </h3>
          {debugInfo.apis.tables.data ? (
            <div className="text-sm text-green-600 mt-1">
              📊 {Array.isArray(debugInfo.apis.tables.data) ? debugInfo.apis.tables.data.length : 0} tablo bulundu
            </div>
          ) : (
            <div className="text-sm text-red-600 mt-1">
              ❌ {debugInfo.apis.tables.error || 'Tablo yüklenemedi'}
            </div>
          )}
        </div>

        {/* Workspaces API */}
        <div className="mb-4">
          <h3 className="font-medium flex items-center">
            {debugInfo.apis.workspaces.status === 200 ? '✅' : '❌'} Çalışma Alanları API
            <span className="ml-2 text-sm text-gray-600">({debugInfo.apis.workspaces.status})</span>
          </h3>
          {debugInfo.apis.workspaces.data ? (
            <div className="text-sm text-green-600 mt-1">
              📁 {Array.isArray(debugInfo.apis.workspaces.data) ? debugInfo.apis.workspaces.data.length : 0} çalışma alanı bulundu
            </div>
          ) : (
            <div className="text-sm text-red-600 mt-1">
              ❌ {debugInfo.apis.workspaces.error || 'Çalışma alanları yüklenemedi'}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">💡 Öneriler</h2>
        
        {!debugInfo.auth.isAuthenticated && (
          <div className="mb-2 text-sm">
            🔐 <strong>Oturum açmanız gerekiyor:</strong>{' '}
            <a href="/auth/login" className="text-blue-600 underline">
              Giriş yapın
            </a>
          </div>
        )}
        
        {debugInfo.apis.tables.status !== 200 && (
          <div className="mb-2 text-sm">
            📊 <strong>Tablo sorunu:</strong> API yanıt vermiyor veya yetki sorunu var
          </div>
        )}
        
        {Array.isArray(debugInfo.apis.tables.data) && debugInfo.apis.tables.data.length === 0 && (
          <div className="mb-2 text-sm">
            📝 <strong>Tablo bulunamadı:</strong> Henüz tablo eklenmemiş olabilir
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex space-x-4">
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          📊 Dashboard&apos;a Git
        </a>
        <a 
          href="/dashboard/tables" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          📋 Tabloları Görüntüle
        </a>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Sayfayı Yenile
        </button>
      </div>
    </div>
  );
} 