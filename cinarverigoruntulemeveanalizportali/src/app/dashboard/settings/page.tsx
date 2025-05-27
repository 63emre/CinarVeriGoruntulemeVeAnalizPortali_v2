'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcSettings, FcInfo, FcCheckmark, FcExport, FcLock, FcButtingIn } from 'react-icons/fc';

export default function SettingsPage() {
  const router = useRouter();
  const [defaultLOQ, setDefaultLOQ] = useState('0.01');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Theme colors state
  const [themeColors, setThemeColors] = useState({
    primary: '#3b82f6',
    secondary: '#10b981', 
    error: '#ef4444',
    warning: '#f59e0b',
    chart: '#8b5cf6',
    accent: '#06b6d4'
  });
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here we would save the settings to the backend
      // For now, we'll save to localStorage as a demo
      localStorage.setItem('userSettings', JSON.stringify({
        defaultLOQ,
        themeColors,
        savedAt: new Date().toISOString()
      }));
      
      setSuccessMessage('Ayarlar başarıyla kaydedildi');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
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
    } finally {
      setIsLoggingOut(false);
    }
  };

  const resetToDefaults = () => {
    setDefaultLOQ('0.01');
    setThemeColors({
      primary: '#3b82f6',
      secondary: '#10b981', 
      error: '#ef4444',
      warning: '#f59e0b',
      chart: '#8b5cf6',
      accent: '#06b6d4'
    });
    setSuccessMessage('Ayarlar varsayılan değerlere sıfırlandı');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const updateThemeColor = (colorKey: string, value: string) => {
    setThemeColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FcSettings className="mr-3 h-8 w-8 bg-white rounded-lg p-1" />
            Sistem Ayarları
          </h1>
          <p className="text-blue-100 mt-2">Uygulama tercihlerinizi ve görünümünüzü özelleştirin</p>
        </div>

        <div className="p-6">
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center shadow-sm">
              <FcCheckmark className="mr-2 h-5 w-5" />
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSaveSettings} className="space-y-8">
            {/* Theme Colors Section - ENABLED */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FcInfo className="mr-2" />
                Tema Renkleri
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Uygulamanın görünümünü özelleştirmek için renkleri ayarlayın
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(themeColors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key === 'primary' && 'Ana Renk'}
                      {key === 'secondary' && 'İkincil Renk'}
                      {key === 'error' && 'Hata Rengi'}
                      {key === 'warning' && 'Uyarı Rengi'}
                      {key === 'chart' && 'Grafik Rengi'}
                      {key === 'accent' && 'Vurgu Rengi'}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateThemeColor(key, e.target.value)}
                        className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateThemeColor(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Settings - DISABLED */}
            <div className="bg-gray-100 rounded-lg p-6 opacity-60">
              <h3 className="text-lg font-semibold text-gray-500 mb-4 flex items-center">
                <FcLock className="mr-2" />
                Diğer Ayarlar (Devre Dışı)
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Bu ayarlar şu anda kullanılamaz durumda
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Varsayılan LOQ Değeri
                  </label>
                  <input
                    type="number"
                    value={defaultLOQ}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Yeni tablolar için varsayılan LOQ değeri (şu anda devre dışı)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Bildirimler
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        disabled
                        className="rounded border-gray-300 text-blue-600 cursor-not-allowed opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-500">E-posta bildirimleri (devre dışı)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        disabled
                        className="rounded border-gray-300 text-blue-600 cursor-not-allowed opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-500">Sistem bildirimleri (devre dışı)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section - ENABLED */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FcButtingIn className="mr-2" />
                Güvenlik
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h3 className="font-medium text-gray-800 mb-2">Güvenli Çıkış</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sistemi güvenli bir şekilde terk etmek için aşağıdaki butonu kullanın. 
                    Tüm oturum bilgileriniz temizlenecektir.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center px-6 py-3 border border-red-300 rounded-lg text-sm font-medium text-black bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <FcExport className="mr-2 h-5 w-5" />
                    {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Güvenli Çıkış Yap'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={resetToDefaults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Renkleri Sıfırla
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
              >
                <FcCheckmark className="mr-2 h-5 w-5 bg-white rounded-full" />
                Renk Ayarlarını Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 