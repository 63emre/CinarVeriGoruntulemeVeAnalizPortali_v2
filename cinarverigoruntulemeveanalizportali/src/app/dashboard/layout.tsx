'use client';

import { useRouter } from 'next/navigation';
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-md z-10 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-4 border-b">
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
              <h1 className="ml-3 text-xl font-bold text-green-700">Çınar Portal</h1>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul>
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcHome className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Ana Sayfa</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/workspaces" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcFolder className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Çalışma Alanları</span>}
                </Link>
              </li>
              
              {isSidebarOpen && (
                <li className="px-4 py-2">
                  <div className="p-2 bg-gray-50 rounded-md">
                    <WorkspaceSelector />
                  </div>
                </li>
              )}
              
              <li>
                <Link 
                  href="/dashboard/tables" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcDatabase className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Tablolar</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/formulas" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcCalculator className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Formüller</span>}
                </Link>
              </li>              <li>
                <Link 
                  href="/dashboard/analysis" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcBarChart className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Analiz</span>}
                </Link>
              </li>
              {isAdmin && (
                <li className="mt-4 border-t pt-2">
                  <Link 
                    href="/admin" 
                    className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
                  >
                    <FcManager className="w-6 h-6" />
                    {isSidebarOpen && <span className="ml-3">Admin Panel</span>}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          {/* Bottom section */}
          <div className="border-t py-4">
            <ul>
              <li>
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcSettings className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Ayarlar</span>}
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcExport className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Çıkış Yap</span>}
                </button>
              </li>
            </ul>
          </div>
          
          {/* Toggle button */}
          <button 
            className="absolute top-1/2 -right-3 bg-white rounded-full p-1 shadow-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {isSidebarOpen ? '◀' : '▶'}
            </div>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Çınar Çevre Laboratuvarı
              {isAdmin && (
                <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                  YÖNETİCİ
                </span>
              )}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center mr-4">
                <FcCalendar className="h-5 w-5 mr-1" />
                <span className="text-gray-800">{currentDate}</span>
              </div>
              <div className="flex items-center">
                <FcClock className="h-5 w-5 mr-1" />
                <span className="text-gray-800">{currentTime}</span>
              </div>
              <div className="flex items-center">
                <FcManager className="h-5 w-5 mr-1" />
                <span className="text-gray-800">{user?.name || user?.email || 'Kullanıcı'}</span>
              </div>
              <span className="text-sm text-gray-800">Veri Görüntüleme ve Analiz Portali</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}