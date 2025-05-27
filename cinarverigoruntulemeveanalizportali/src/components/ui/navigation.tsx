'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX, FiLogOut, FiHome, FiDatabase, FiUsers, FiActivity } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const menuItems = [
    { path: '/dashboard', name: 'Kontrol Paneli', icon: FiHome },
    { path: '/dashboard/workspaces', name: 'Çalışma Alanları', icon: FiDatabase },
    { path: '/dashboard/formulas', name: 'Formüller', icon: FiActivity },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ path: '/admin', name: 'Kullanıcı Yönetimi', icon: FiUsers });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <Image
                  src="/cinar.svg"
                  alt="Çınar Logo"
                  width={36}
                  height={36}
                  className="h-9 w-auto"
                />
              </Link>
              <span className="ml-2 text-xl font-bold text-green-800">Çınar Portal</span>
            </div>
            
            {/* Masaüstü görünüm için menü */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'border-green-700 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="mr-1.5 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && user && (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-gray-500 hover:text-red-600 focus:outline-none"
                  title="Çıkış Yap"
                >
                  <FiLogOut className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
          
          {/* Mobil görünüm için menü düğmesi */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menü */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(item.path)
                    ? 'border-green-700 text-green-800 bg-green-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {user && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-red-300 hover:text-red-700"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Çıkış Yap
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 