'use client';

import { useRouter } from 'next/navigation';
import { useState, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FcHome, 
  FcFolder, 
  FcManager,
  FcSettings, 
  FcExport,
  FcDepartment
} from 'react-icons/fc';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
    <div className="flex h-screen bg-gray-100">      {/* Sidebar */}
      <div className={`bg-blue-900 shadow-md z-10 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-4 border-b border-blue-800">
            <Image 
              src="/cinar-yaprak.svg" 
              alt="Çınar Logo" 
              width={isSidebarOpen ? 50 : 40} 
              height={isSidebarOpen ? 50 : 40} 
            />
            {isSidebarOpen && (
              <h1 className="ml-3 text-xl font-bold text-white">Yönetici Paneli</h1>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul>
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white"
                >
                  <FcHome className="w-6 h-6 bg-white rounded-sm" />
                  {isSidebarOpen && <span className="ml-3">Ana Sayfa</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="flex items-center px-4 py-3 bg-blue-700 text-white"
                >
                  <FcDepartment className="w-6 h-6 bg-white rounded-sm" />
                  {isSidebarOpen && <span className="ml-3">Admin Paneli</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white"
                >
                  <FcManager className="w-6 h-6 bg-white rounded-sm" />
                  {isSidebarOpen && <span className="ml-3">Kullanıcı Yönetimi</span>}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/workspaces" 
                  className="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white"
                >
                  <FcFolder className="w-6 h-6 bg-white rounded-sm" />
                  {isSidebarOpen && <span className="ml-3">Çalışma Alanları</span>}
                </Link>
              </li>
            </ul>
          </nav>
            {/* Bottom section */}
          <div className="border-t border-blue-800 py-4">
            <ul>
              <li>
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white"
                >
                  <FcSettings className="w-6 h-6 bg-white rounded-sm" />
                  {isSidebarOpen && <span className="ml-3">Ayarlar</span>}
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white"
                >
                  <FcExport className="w-6 h-6 bg-white rounded-sm" />
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
        <header className="bg-blue-800 shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FcManager className="mr-2 bg-white rounded-sm w-6 h-6" />
              Yönetici Kontrol Paneli
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-200">Çınar Çevre Laboratuvarı - Yönetici Modu</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 