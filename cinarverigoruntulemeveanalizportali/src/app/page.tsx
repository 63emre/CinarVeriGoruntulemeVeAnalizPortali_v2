'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('Checking authentication...');
        const response = await fetch('/api/auth/me');
        console.log('Auth check response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data:', data);
          setUser(data.user);
        } else {
          console.log('Not authenticated');
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setError('Sunucu ile iletişim sırasında bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/cinar.svg"
            alt="Çınar Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Çınar Çevre Laboratuvarı
        </h1>
        <p className="text-gray-600 mb-8">
          Veri Görüntüleme ve Analiz Portalı
        </p>

        {loading ? (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
            {error}
          </div>
        ) : user ? (
          <div className="mb-6">
            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
              Giriş yapıldı: {user.name || user.email}
            </div>
            <Link 
              href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {user.role === 'ADMIN' ? 'Admin Paneline Git' : 'Panele Git'}
            </Link>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">
              Lütfen devam etmek için giriş yapın
            </div>
            <Link 
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Giriş Yap
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
