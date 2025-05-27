'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, ReactNode, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FcHome, 
  FcFolder, 
  FcDatabase, 
  FcCalculator, 
  FcBarChart, 
  FcSettings, 
  FcExport,
  FcManager,
  FcClock,
  FcCalendar
} from 'react-icons/fc';
import WorkspaceSelector from '@/components/workspaces/WorkspaceSelector';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch current user to check role
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAdmin(data.user?.role === 'ADMIN');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    
    fetchCurrentUser();

    // Update time and date
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('tr-TR'));
      setCurrentDate(now.toLocaleDateString('tr-TR'));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/auth/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if current path is active
  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  // Navigation items
  const navigationItems = [
    { 
      path: '/dashboard', 
      name: 'Ana Sayfa', 
      icon: FcHome,
      description: 'Kontrol paneli ve özet bilgiler'
    },
    { 
      path: '/dashboard/workspaces', 
      name: 'Çalışma Alanları', 
      icon: FcFolder,
      description: 'Proje ve veri yönetimi'
    },
    { 
      path: '/dashboard/tables', 
      name: 'Tablolar', 
      icon: FcDatabase,
      description: 'Veri tablolarını görüntüle ve düzenle'
    },
    { 
      path: '/dashboard/formulas', 
      name: 'Formüller', 
      icon: FcCalculator,
      description: 'Veri doğrulama kuralları'
    },
    { 
      path: '/dashboard/analysis', 
      name: 'Analiz', 
      icon: FcBarChart,
      description: 'Trend analizi ve raporlama'
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-inter">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg z-10 transition-all duration-300 border-r border-gray-200 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="relative" style={{ width: isSidebarOpen ? '50px' : '40px', height: isSidebarOpen ? '50px' : '40px' }}>
              <Image 
                src="/cinar.svg" 
                alt="Çınar Logo" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            {isSidebarOpen && (
              <h1 className="ml-3 text-xl font-bold text-green-700 tracking-tight">Çınar Portal</h1>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-3">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActivePath(item.path)
                        ? 'bg-green-100 text-green-800 border-l-4 border-green-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={isSidebarOpen ? item.description : item.name}
                  >
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    {isSidebarOpen && (
                      <div className="ml-3">
                        <span className="block">{item.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{item.description}</span>
                      </div>
                    )}
                  </Link>
                </li>
              ))}
              
              {isSidebarOpen && (
                <li className="px-3 py-2">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <WorkspaceSelector />
                  </div>
                </li>
              )}
              
              {isAdmin && (
                <li className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href="/admin" 
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname.startsWith('/admin')
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 shadow-sm'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <FcManager className="w-6 h-6 flex-shrink-0" />
                    {isSidebarOpen && (
                      <div className="ml-3">
                        <span className="block font-semibold">Admin Panel</span>
                        <span className="text-xs text-blue-600 mt-0.5">Sistem yönetimi</span>
                      </div>
                    )}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          {/* Bottom section */}
          <div className="border-t border-gray-200 py-4">
            <ul className="space-y-1 px-3">
              <li>
                <Link 
                  href="/dashboard/settings" 
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/dashboard/settings'
                      ? 'bg-gray-100 text-gray-800'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <FcSettings className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Ayarlar</span>}
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium bg-red-100 text-black hover:bg-red-200 hover:text-red-900 transition-all duration-200 border border-red-200"
                >
                  <FcExport className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3 font-semibold">Çıkış Yap</span>}
                </button>
              </li>
            </ul>
          </div>
          
          {/* Toggle button */}
          <button 
            className="absolute top-1/2 -right-3 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <div className="w-4 h-4 flex items-center justify-center text-gray-600 font-medium">
              {isSidebarOpen ? '◀' : '▶'}
            </div>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                Çınar Çevre Laboratuvarı
                {isAdmin && (
                  <span className="ml-3 px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                    YÖNETİCİ
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Veri Görüntüleme ve Analiz Portalı</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <FcCalendar className="h-5 w-5 mr-2" />
                <span className="font-medium">{currentDate}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FcClock className="h-5 w-5 mr-2" />
                <span className="font-medium">{currentTime}</span>
              </div>
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full p-2 mr-3">
                  <FcManager className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.name || user?.email || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'ADMIN' ? 'Sistem Yöneticisi' : 'Kullanıcı'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}