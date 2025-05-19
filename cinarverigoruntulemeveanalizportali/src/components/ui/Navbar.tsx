'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FcHome, FcSettings, FcManager } from 'react-icons/fc';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Don't show navbar on login/register pages or dashboard/admin pages (which have their own sidebar)
  if (pathname.startsWith('/auth/') || 
      pathname.startsWith('/dashboard/') || 
      pathname === '/dashboard' ||
      pathname.startsWith('/admin/') ||
      pathname === '/admin') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/cinar-yaprak.png"
                alt="Çınar Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="font-bold text-xl text-gray-800">Çınar Portal</span>
            </Link>
          </div>

          {/* Desktop menu */}
          {!isLoading && user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FcHome className="mr-1 h-5 w-5" />
                Ana Sayfa
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FcSettings className="mr-1 h-5 w-5" />
                  Admin Paneli
                </Link>
              )}

              <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center">
                  <FcManager className="h-8 w-8 rounded-full bg-gray-100 p-1" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500">
                      {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Çıkış
                </button>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Menüyü Aç</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        {!isLoading && user && (
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FcHome className="mr-2 h-5 w-5" />
              Ana Sayfa
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive('/admin')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FcSettings className="mr-2 h-5 w-5" />
                Admin Paneli
              </Link>
            )}

            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <FcManager className="h-10 w-10 rounded-full bg-gray-100 p-1" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name || user.email}</div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 