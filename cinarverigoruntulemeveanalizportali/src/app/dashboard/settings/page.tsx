'use client';

import { useState } from 'react';
import { FcSettings, FcInfo, FcCheckmark } from 'react-icons/fc';

export default function SettingsPage() {
  const [defaultLOQ, setDefaultLOQ] = useState('0.01');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would save the settings to the backend
    setSuccessMessage('Ayarlar başarıyla kaydedildi');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FcSettings className="mr-2 h-6 w-6" />
          Sistem Ayarları
        </h1>
        
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <FcCheckmark className="mr-2" />
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSaveSettings}>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Genel Ayarlar</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Varsayılan LOQ Değeri
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    value={defaultLOQ}
                    onChange={(e) => setDefaultLOQ(e.target.value)}
                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FcInfo className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ölçüm limiti altında kalan değerler için gösterilecek standart değer
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Formül Ayarları</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Katyon-İletkenlik Tolerans Değeri (%)
                </label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue="20"
                  min="0"
                  max="100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Katyon değerinin iletkenlik değeri ile uyum toleransını belirler
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veri Sapma Sınır Değeri (%)
                </label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue="50"
                  min="0"
                  max="100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ölçümlerdeki izin verilen maksimum sapma yüzdesi
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Arayüz Ayarları</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Varsayılan Grafik Rengi
                </label>
                <input
                  type="color"
                  className="h-10 w-full border-gray-300 rounded-md"
                  defaultValue="#3b82f6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hata Vurgulama Rengi
                </label>
                <input
                  type="color"
                  className="h-10 w-full border-gray-300 rounded-md"
                  defaultValue="#ef4444"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başarı Vurgulama Rengi
                </label>
                <input
                  type="color"
                  className="h-10 w-full border-gray-300 rounded-md"
                  defaultValue="#10b981"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-5">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              Varsayılanlara Sıfırla
            </button>
            <button
              type="submit"
              className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ayarları Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 