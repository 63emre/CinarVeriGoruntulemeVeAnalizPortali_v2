'use client';

import { useRouter } from 'next/navigation';
import { useState, ReactNode } from 'react';
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
  FcManager 
} from 'react-icons/fc';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

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
            <Image 
              src="/cinar-yaprak.svg" 
              alt="Çınar Logo" 
              width={isSidebarOpen ? 50 : 40} 
              height={isSidebarOpen ? 50 : 40} 
            />
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
              </li>
              <li>
                <Link 
                  href="/dashboard/analysis" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcBarChart className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Analiz</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <FcManager className="w-6 h-6" />
                  {isSidebarOpen && <span className="ml-3">Admin Panel</span>}
                </Link>
              </li>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Çınar Çevre Laboratuvarı</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Veri Görüntüleme ve Analiz Portali</span>
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