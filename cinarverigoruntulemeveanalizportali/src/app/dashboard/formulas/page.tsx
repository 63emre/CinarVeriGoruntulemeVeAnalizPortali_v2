'use client';

import { useState } from 'react';
import { FcCalculator, FcInfo, FcPlus, FcCheckmark, FcHighPriority } from 'react-icons/fc';

interface Formula {
  id: string;
  name: string;
  expression: string;
  color: string;
  workspace: string;
  createdAt: string;
  active: boolean;
}

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([
    { 
      id: '1', 
      name: 'Fosfor Kontrol', 
      expression: 'ToplamFosfor > OrtoFosfat',
      color: '#ef4444',
      workspace: 'Çalışma Alanı 1',
      createdAt: '2023-06-15',
      active: true
    },
    { 
      id: '2', 
      name: 'LOQ Kontrol', 
      expression: 'Variable >= LOQ',
      color: '#f59e0b',
      workspace: 'Çalışma Alanı 1',
      createdAt: '2023-07-22',
      active: true
    },
    { 
      id: '3', 
      name: 'Katyon İletkenlik', 
      expression: 'Katyon <= İletkenlik * 1.2',
      color: '#3b82f6',
      workspace: 'Çalışma Alanı 2',
      createdAt: '2023-08-05',
      active: false
    },
  ]);
  
  const [selectedVariable1, setSelectedVariable1] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedVariable2, setSelectedVariable2] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [formulaColor, setFormulaColor] = useState('#ef4444');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const variables = [
    { name: 'İletkenlik', value: 'İletkenlik' },
    { name: 'Orto Fosfat', value: 'OrtoFosfat' },
    { name: 'Toplam Fosfor', value: 'ToplamFosfor' },
    { name: 'LOQ', value: 'LOQ' },
    { name: 'Katyon', value: 'Katyon' },
  ];
  
  const operators = [
    { name: 'Büyüktür (>)', value: '>' },
    { name: 'Küçüktür (<)', value: '<' },
    { name: 'Büyük veya Eşittir (≥)', value: '>=' },
    { name: 'Küçük veya Eşittir (≤)', value: '<=' },
    { name: 'Eşittir (=)', value: '==' },
    { name: 'Eşit Değildir (≠)', value: '!=' },
  ];
  
  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulaName || !selectedVariable1 || !selectedOperator || !selectedVariable2) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    const expression = `${selectedVariable1} ${selectedOperator} ${selectedVariable2}`;
    
    const newFormula: Formula = {
      id: (formulas.length + 1).toString(),
      name: formulaName,
      expression: expression,
      color: formulaColor,
      workspace: 'Çalışma Alanı 1', // This would be dynamic
      createdAt: new Date().toISOString().split('T')[0],
      active: true
    };
    
    setFormulas([...formulas, newFormula]);
    
    // Reset form
    setFormulaName('');
    setSelectedVariable1('');
    setSelectedOperator('');
    setSelectedVariable2('');
    setError('');
    setSuccess('Formül başarıyla oluşturuldu');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  const toggleFormulaStatus = (id: string) => {
    setFormulas(formulas.map(formula => 
      formula.id === id ? { ...formula, active: !formula.active } : formula
    ));
  };
  
  const deleteFormula = (id: string) => {
    setFormulas(formulas.filter(formula => formula.id !== id));
  };
  
  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FcCalculator className="mr-2 h-6 w-6" />
          Formül Yönetimi
        </h1>
        
        <div className="flex justify-end mb-4">
          <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition">
            <FcInfo className="mr-2" />
            <span>Formül Yardımı</span>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <FcHighPriority className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <FcCheckmark className="mr-2" />
            {success}
          </div>
        )}
        
        <form onSubmit={handleCreateFormula} className="mb-8">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FcPlus className="mr-2" />
              Yeni Formül Oluştur
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formül Adı
              </label>
              <input
                type="text"
                className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Formül için açıklayıcı bir isim girin"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1. Değişken
                </label>
                <select
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedVariable1}
                  onChange={(e) => setSelectedVariable1(e.target.value)}
                >
                  <option value="">Seçin</option>
                  {variables.map(variable => (
                    <option key={variable.value} value={variable.value}>
                      {variable.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operatör
                </label>
                <select
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                >
                  <option value="">Seçin</option>
                  {operators.map(operator => (
                    <option key={operator.value} value={operator.value}>
                      {operator.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2. Değişken
                </label>
                <select
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedVariable2}
                  onChange={(e) => setSelectedVariable2(e.target.value)}
                >
                  <option value="">Seçin</option>
                  {variables.map(variable => (
                    <option key={variable.value} value={variable.value}>
                      {variable.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vurgulama Rengi
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    className="h-10 w-20 border-gray-300 rounded-md"
                    value={formulaColor}
                    onChange={(e) => setFormulaColor(e.target.value)}
                  />
                  <span className="text-sm text-gray-500">
                    Seçilen renk: {formulaColor}
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
              >
                <span>Formül Oluştur</span>
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Mevcut Formüller</h3>
          
          {formulas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formül Adı</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İfade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renk</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çalışma Alanı</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formulas.map((formula) => (
                    <tr key={formula.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formula.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <code className="bg-gray-100 px-2 py-1 rounded">{formula.expression}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div 
                            className="h-6 w-6 rounded-md mr-2" 
                            style={{ backgroundColor: formula.color }}
                          ></div>
                          {formula.color}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formula.workspace}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            formula.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formula.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            className={`${formula.active ? 'text-gray-600' : 'text-green-600'} hover:text-green-800`}
                            onClick={() => toggleFormulaStatus(formula.id)}
                          >
                            {formula.active ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteFormula(formula.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Henüz formül tanımlanmamış.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 