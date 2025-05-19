'use client';

import { useState, useEffect } from 'react';
import { FcAddRow, FcCancel, FcCheckmark } from 'react-icons/fc';

interface FormulaEditorProps {
  workspaceId: string;
  onFormulaAdded?: (formula: any) => void;
}

interface Formula {
  id: string;
  name: string;
  description: string | null;
  formula: string;
  color: string;
  tableId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function FormulaEditor({ workspaceId, onFormulaAdded }: FormulaEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formula, setFormula] = useState('');
  const [color, setColor] = useState('#ff0000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingFormulas, setExistingFormulas] = useState<Formula[]>([]);
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(true);

  useEffect(() => {
    async function fetchExistingFormulas() {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (!response.ok) {
          throw new Error('Formüller yüklenemedi');
        }
        const data = await response.json();
        setExistingFormulas(data);
      } catch (err) {
        console.error('Error fetching formulas:', err);
      } finally {
        setIsLoadingFormulas(false);
      }
    }

    fetchExistingFormulas();
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('Formül adı gereklidir');
      return;
    }
    
    if (!formula.trim()) {
      setError('Formül içeriği gereklidir');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          formula,
          color,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Formül oluşturma başarısız');
      }
      
      // Add the new formula to our list
      setExistingFormulas([...existingFormulas, data.formula]);
      
      // Clear form
      setName('');
      setDescription('');
      setFormula('');
      setColor('#ff0000');
      
      setSuccess('Formül başarıyla oluşturuldu');
      
      // Call callback if provided
      if (onFormulaAdded) {
        onFormulaAdded(data.formula);
      }
    } catch (err) {
      setError((err as Error).message || 'Bir hata oluştu');
      console.error('Formula creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (formulaId: string) => {
    if (!confirm('Bu formülü silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/formulas?formulaId=${formulaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Formül silme başarısız');
      }
      
      // Remove the formula from our list
      setExistingFormulas(existingFormulas.filter(f => f.id !== formulaId));
      setSuccess('Formül başarıyla silindi');
    } catch (err) {
      setError((err as Error).message || 'Formül silinirken bir hata oluştu');
      console.error('Formula deletion error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Yeni Formül Oluştur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Formül Adı
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örnek: WAD Siyanür vs Toplam Siyanür"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Formülün amacını açıklayın"
              rows={2}
            />
          </div>
          
          <div>
            <label htmlFor="formula" className="block text-sm font-medium text-gray-700 mb-1">
              Formül
            </label>
            <textarea
              id="formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="Örnek: value1 > value2"
              rows={3}
            />
            <p className="mt-1 text-sm text-gray-500">
              Formül yazarken değişken isimleri veya sayısal değerler kullanabilirsiniz.
            </p>
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Vurgulama Rengi
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="p-1 border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 flex items-center">
              <FcCancel className="h-5 w-5 mr-1" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 flex items-center">
              <FcCheckmark className="h-5 w-5 mr-1" />
              {success}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FcAddRow className="mr-2 bg-white rounded" />
              {isLoading ? 'Oluşturuluyor...' : 'Formül Oluştur'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Mevcut Formüller</h2>
        
        {isLoadingFormulas ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : existingFormulas.length > 0 ? (
          <ul className="space-y-4">
            {existingFormulas.map((f) => (
              <li key={f.id} className="border rounded-md p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{f.name}</h3>
                    {f.description && <p className="text-sm text-gray-600 mt-1">{f.description}</p>}
                    <div className="mt-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {f.formula}
                      </code>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="mr-2 text-sm text-gray-600">Vurgulama rengi:</span>
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: f.color }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 py-2">Henüz formül oluşturulmamış</p>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Formül Yazım Rehberi</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Temel Operatörler</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="font-mono bg-gray-100 px-1">{'>'}</code> - Büyüktür</li>
              <li><code className="font-mono bg-gray-100 px-1">{'<'}</code> - Küçüktür</li>
              <li><code className="font-mono bg-gray-100 px-1">{'>='}</code> - Büyük veya eşittir</li>
              <li><code className="font-mono bg-gray-100 px-1">{'<='}</code> - Küçük veya eşittir</li>
              <li><code className="font-mono bg-gray-100 px-1">{'=='}</code> - Eşittir</li>
              <li><code className="font-mono bg-gray-100 px-1">{'!='}</code> - Eşit değildir</li>
              <li><code className="font-mono bg-gray-100 px-1">{'+'}</code> - Toplama</li>
              <li><code className="font-mono bg-gray-100 px-1">{'-'}</code> - Çıkarma</li>
              <li><code className="font-mono bg-gray-100 px-1">{'*'}</code> - Çarpma</li>
              <li><code className="font-mono bg-gray-100 px-1">{'/'}</code> - Bölme</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Formül Örnekleri</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <p>WAD Siyanür &gt; Toplam Siyanür karşılaştırması:</p>
                <code className="font-mono bg-gray-100 px-2 py-1 block mt-1">
                  WAD_Siyanür &gt; Toplam_Siyanür
                </code>
              </li>
              <li>
                <p>Değerin LOQ değerinden küçük olup olmadığını kontrol etme:</p>
                <code className="font-mono bg-gray-100 px-2 py-1 block mt-1">
                  değer &lt; LOQ
                </code>
              </li>
              <li>
                <p>İki değer arasındaki farkın belirli bir yüzdeyi geçip geçmediğini kontrol etme:</p>
                <code className="font-mono bg-gray-100 px-2 py-1 block mt-1">
                  Math.abs(değer1 - değer2) / değer1 &gt; 0.2
                </code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 