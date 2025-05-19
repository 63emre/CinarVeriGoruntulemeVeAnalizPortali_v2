'use client';

import { useState } from 'react';
import { FcLineChart, FcCalendar } from 'react-icons/fc';

export default function AnalysisPage() {
  const [selectedVariable, setSelectedVariable] = useState('');
  const [startDate, setStartDate] = useState('');
  const [chartColor, setChartColor] = useState('#3b82f6'); // Default blue color
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FcLineChart className="mr-2 h-6 w-6" />
          Trend Analizi
        </h1>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Değişken Seçimi
            </label>
            <select 
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Değişken seçin</option>
              <option value="İletkenlik">İletkenlik</option>
              <option value="Orto Fosfat">Orto Fosfat</option>
              <option value="Toplam Fosfor">Toplam Fosfor</option>
              {/* Bu bölüm API'den gelen verilerle dinamik olarak doldurulacak */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FcCalendar className="inline mr-1" /> Başlangıç Tarihi
            </label>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Tarih seçin</option>
              <option value="Nisan 22">Nisan 22</option>
              <option value="Haziran 22">Haziran 22</option>
              <option value="Eylül 22">Eylül 22</option>
              {/* Bu bölüm API'den gelen verilerle dinamik olarak doldurulacak */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grafik Rengi
            </label>
            <input 
              type="color" 
              value={chartColor}
              onChange={(e) => setChartColor(e.target.value)}
              className="h-10 w-full border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="bg-gray-100 border border-gray-200 rounded-md p-10 flex items-center justify-center min-h-[400px]">
          {selectedVariable && startDate ? (
            <p className="text-xl">
              Grafik alanı: {selectedVariable} değerlerinin {startDate} tarihinden itibaren trendi
            </p>
          ) : (
            <p className="text-gray-500">
              Grafik görüntülemek için lütfen değişken ve başlangıç tarihi seçin
            </p>
          )}
          {/* Burada Chart.js bileşeni eklenecek */}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-end mb-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            PDF İndir
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birim</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Bu bölüm API'den gelen verilerle dinamik olarak doldurulacak */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Eylül 22</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">348</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">µS/cm</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Normal</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Aralık 22</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">342</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">µS/cm</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">Normal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 