'use client';

import { useState, useEffect } from 'react';
import { FcMindMap, FcList, FcCheckmark } from 'react-icons/fc';

interface FormulaItem {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface FormulaSelectorProps {
  workspaceId: string;
  onSelectionChange: (formulaIds: string[]) => void;
}

export default function FormulaSelector({ workspaceId, onSelectionChange }: FormulaSelectorProps) {
  const [formulas, setFormulas] = useState<FormulaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
  
  // Fetch formulas on component mount
  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/formulas`);
        if (!response.ok) {
          throw new Error('Formüller yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setFormulas(data);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching formulas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (workspaceId) {
      fetchFormulas();
    }
  }, [workspaceId]);
  
  // Handle formula selection
  const toggleFormulaSelection = (formulaId: string) => {
    setSelectedFormulas(prev => {
      const isSelected = prev.includes(formulaId);
      let newSelection;
      
      if (isSelected) {
        // Remove from selection
        newSelection = prev.filter(id => id !== formulaId);
      } else {
        // Add to selection
        newSelection = [...prev, formulaId];
      }
      
      // Notify parent component using setTimeout to avoid React warning
      // about setState during render
      setTimeout(() => {
        onSelectionChange(newSelection);
      }, 0);
      
      return newSelection;
    });
  };
  
  if (loading && formulas.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded"></div>
        <div className="h-6 bg-gray-200 rounded"></div>
        <div className="h-6 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Hata Oluştu</span>
        </div>
        <p>{error}</p>
      </div>
    );
  }
  
  if (formulas.length === 0) {
    return (
      <div className="text-gray-700 text-sm bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center justify-center">
        <FcList className="mr-2 h-5 w-5" />
        <span>Bu çalışma alanı için formül bulunamadı.</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2 flex items-center">
        <FcMindMap className="mr-2 h-5 w-5" />
        <span>Tabloya uygulamak istediğiniz formülleri seçin:</span>
      </div>
      
      {formulas.map(formula => (
        <div 
          key={formula.id} 
          className={`flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedFormulas.includes(formula.id) 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-200'
          }`}
          onClick={() => toggleFormulaSelection(formula.id)}
        >
          <div className="flex-1">
            <div className="font-medium text-gray-900">{formula.name}</div>
            {formula.description && (
              <div className="text-sm text-gray-600 mt-1">{formula.description}</div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: formula.color || '#ef4444' }}
              title={`Renk: ${formula.color || 'Kırmızı'}`}
            ></div>
            
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedFormulas.includes(formula.id)}
                onChange={() => {}} // Controlled by the onClick handler on the div
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              {selectedFormulas.includes(formula.id) && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full h-3 w-3 flex items-center justify-center">
                  <FcCheckmark className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {selectedFormulas.length > 0 && (
        <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
          <strong>{selectedFormulas.length}</strong> formül seçildi
          <div className="text-xs text-blue-500 mt-1">
            💡 Seçili formülleri uygulamak için üstteki &ldquo;Formülleri Uygula&rdquo; butonunu kullanın
          </div>
        </div>
      )}
    </div>
  );
} 