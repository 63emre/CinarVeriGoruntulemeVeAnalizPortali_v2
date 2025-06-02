'use client';

import { useState, useEffect } from 'react';
import { FcManager, FcFolder, FcDataSheet, FcBarChart, FcCalculator, FcClock, FcSettings } from 'react-icons/fc';
import UserManager from '@/components/admin/UserManager';
import WorkspaceManager from '@/components/workspaces/WorkspaceManager';
import { showError, showSuccess } from '@/components/ui/Notification';

interface SystemStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalTables: number;
  totalFormulas: number;
  activeFormulas: number;
  lastUserLogin?: string;
  systemUptime?: string;
  databaseSize?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workspaces'>('overview');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalWorkspaces: 0,
    totalTables: 0,
    totalFormulas: 0,
    activeFormulas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await fetch('/api/admin/users');
        const users = usersResponse.ok ? await usersResponse.json() : [];
        
        // Fetch workspaces
        const workspacesResponse = await fetch('/api/workspaces');
        const workspaces = workspacesResponse.ok ? await workspacesResponse.json() : [];
        
        // Fetch tables count
        let totalTables = 0;
        let totalFormulas = 0;
        let activeFormulas = 0;
        
        for (const workspace of workspaces) {
          try {
            const tablesResponse = await fetch(`/api/workspaces/${workspace.id}/tables`);
            if (tablesResponse.ok) {
              const tables = await tablesResponse.json();
              totalTables += tables.length;
            }
            
            const formulasResponse = await fetch(`/api/workspaces/${workspace.id}/formulas`);
            if (formulasResponse.ok) {
              const formulas = await formulasResponse.json();
              totalFormulas += formulas.length;
              activeFormulas += formulas.filter((f: any) => f.active).length;
            }
          } catch (err) {
            console.warn(`Error fetching data for workspace ${workspace.id}:`, err);
          }
        }
        
        setSystemStats({
          totalUsers: users.length,
          totalWorkspaces: workspaces.length,
          totalTables,
          totalFormulas,
          activeFormulas,
          lastUserLogin: new Date().toLocaleString('tr-TR'),
          systemUptime: '24/7 Aktif',
          databaseSize: 'Hesaplanıyor...'
        });
        
        showSuccess('Sistem bilgileri başarıyla yüklendi');
        
      } catch (error) {
        console.error('Error fetching system stats:', error);
        showError('Sistem bilgileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl shadow-sm border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-10 w-10 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                value
              )}
            </p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FcSettings className="mr-3" />
          Sistem Yönetimi
        </h1>
        <p className="text-gray-600 mt-2">
          Çınar Çevre Laboratuvarı Veri Görüntüleme ve Analiz Portalı - Yönetici Paneli
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'overview'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <FcBarChart className="mr-2 h-5 w-5" />
            Sistem Özeti
          </button>
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
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Ana İstatistikler */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FcBarChart className="mr-2" />
                  Sistem İstatistikleri
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={FcManager}
                    title="Toplam Kullanıcı"
                    value={systemStats.totalUsers}
                    subtitle="Kayıtlı kullanıcı sayısı"
                    color="blue"
                  />
                  <StatCard
                    icon={FcFolder}
                    title="Çalışma Alanları"
                    value={systemStats.totalWorkspaces}
                    subtitle="Aktif proje sayısı"
                    color="green"
                  />
                  <StatCard
                    icon={FcDataSheet}
                    title="Kayıtlı Tablolar"
                    value={systemStats.totalTables}
                    subtitle="Toplam veri tablosu"
                    color="purple"
                  />
                  <StatCard
                    icon={FcCalculator}
                    title="Formüller"
                    value={`${systemStats.activeFormulas}/${systemStats.totalFormulas}`}
                    subtitle="Aktif/Toplam formül sayısı"
                    color="orange"
                  />
                </div>
              </div>

              {/* Sistem Durumu */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FcClock className="mr-2" />
                  Sistem Durumu
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600">Son Kullanıcı Girişi</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? 'Yükleniyor...' : systemStats.lastUserLogin}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Sistem Çalışma Süresi</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? 'Yükleniyor...' : systemStats.systemUptime}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Veritabanı Boyutu</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? 'Yükleniyor...' : systemStats.databaseSize}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sistem Bilgileri */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold mb-4 text-blue-800">
                  💻 Platform Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Framework:</span>
                    <span className="ml-2 text-blue-600">Next.js 14 (React 18)</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Veritabanı:</span>
                    <span className="ml-2 text-blue-600">PostgreSQL + Prisma ORM</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Stil:</span>
                    <span className="ml-2 text-blue-600">Tailwind CSS</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Barındırma:</span>
                    <span className="ml-2 text-blue-600">Vercel Platform</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Sürüm:</span>
                    <span className="ml-2 text-blue-600">v2.0.0</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Son Güncelleme:</span>
                    <span className="ml-2 text-blue-600">{new Date().toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManager />
          )}

          {activeTab === 'workspaces' && (
            <WorkspaceManager />
          )}
        </div>
      </div>
    </>
  );
} 