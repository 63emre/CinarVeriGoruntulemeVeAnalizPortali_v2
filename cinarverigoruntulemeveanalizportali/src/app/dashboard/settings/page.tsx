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
            {/* General Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <FcInfo className="mr-2 h-6 w-6" />
                Genel Ayarlar
              </h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varsayılan LOQ Değeri
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={defaultLOQ}
                      onChange={(e) => setDefaultLOQ(e.target.value)}
                      className="block w-full pr-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="0.01"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FcInfo className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Ölçüm limiti altında kalan değerler için gösterilecek standart değer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Katyon-İletkenlik Tolerans (%)
                  </label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    defaultValue="20"
                    min="0"
                    max="100"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Katyon-iletkenlik uyum toleransı
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veri Sapma Sınırı (%)
                  </label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    defaultValue="50"
                    min="0"
                    max="100"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Maksimum izin verilen sapma yüzdesi
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Customization */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <FcButtingIn className="mr-2 h-6 w-6" />
                Renk Teması
              </h2>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Renk
                  </label>
                  <input
                    type="color"
                    value={themeColors.primary}
                    onChange={(e) => updateThemeColor('primary', e.target.value)}
                    className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:scale-105"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{themeColors.primary}</span>
                </div>
                
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İkincil Renk
                  </label>
                  <input
                    type="color"
                    value={themeColors.secondary}
                    onChange={(e) => updateThemeColor('secondary', e.target.value)}
                    className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:scale-105"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{themeColors.secondary}</span>
                </div>
                
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hata Rengi
                  </label>
                  <input
                    type="color"
                    value={themeColors.error}
                    onChange={(e) => updateThemeColor('error', e.target.value)}
                    className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:scale-105"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{themeColors.error}</span>
                </div>
                
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uyarı Rengi
                  </label>
                  <input
                    type="color"
                    value={themeColors.warning}
                    onChange={(e) => updateThemeColor('warning', e.target.value)}
                    className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:scale-105"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{themeColors.warning}</span>
                </div>
                
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grafik Rengi
                  </label>
                  <input
                    type="color"
                    value={themeColors.chart}
                    onChange={(e) => updateThemeColor('chart', e.target.value)}
                    className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:scale-105"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{themeColors.chart}</span>
                </div>
                
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vurgu Rengi
                  </label>
                  <input
                    type="color"
                    value={themeColors.accent}
                    onChange={(e) => updateThemeColor('accent', e.target.value)}
                    className="h-12 w-full border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:scale-105"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">{themeColors.accent}</span>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <FcLock className="mr-2 h-6 w-6" />
                Güvenlik ve Oturum
              </h2>
              
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
                    className="inline-flex items-center px-6 py-3 border border-red-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <FcExport className="mr-2 h-5 w-5" />
                    {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Güvenli Çıkış Yap'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetToDefaults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Varsayılanlara Sıfırla
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
              >
                <FcCheckmark className="mr-2 h-5 w-5 bg-white rounded-full" />
                Ayarları Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 