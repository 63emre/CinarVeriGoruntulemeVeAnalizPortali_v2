'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a short delay to show logo
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Image 
          src="/cinar-yaprak.svg" 
          alt="Çınar Logo" 
          width={120} 
          height={120} 
          className="mx-auto animate-pulse"
        />
        <h1 className="mt-6 text-3xl font-bold text-green-700">
          Çınar Portal
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Veri Görüntüleme ve Analiz Sistemi
        </p>
      </div>
      <div className="mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    </div>
  );
}
