import React, { useState, useEffect } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import FormulaEditor from './FormulaEditor';

interface Formula {
  id?: string;
  name: string;
  description: string | null;
  formula: string;
  color: string;
  tableId: string | null;
  workspaceId: string;
  type: 'CELL_VALIDATION' | 'RELATIONAL';
  active?: boolean;
}

interface FormulaFormProps {
  initialFormula?: Formula;
  onSubmit: (formula: Formula) => void;
  onCancel?: () => void;
  workspaceId: string;
  tableId?: string;
  variables?: string[]; // Available variable names for suggestions
  isSubmitting?: boolean;
}

const DEFAULT_FORMULA: Formula = {
  name: '',
  description: '',
  formula: '',
  color: '#3B82F6', // Default blue color
  tableId: null,
  workspaceId: '',
  type: 'CELL_VALIDATION',
  active: true
};

export default function FormulaForm({
  initialFormula,
  onSubmit,
  onCancel,
  workspaceId,
  tableId,
  variables = [],
  isSubmitting = false
}: FormulaFormProps) {
  const [formula, setFormula] = useState<Formula>({
    ...DEFAULT_FORMULA,
    workspaceId,
    tableId: tableId || null,
    ...initialFormula
  });
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFormulaValid, setIsFormulaValid] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [variableSuggestions, setVariableSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Update form validity whenever fields change
  useEffect(() => {
    const isValid = 
      formula.name.trim() !== '' && 
      formula.formula.trim() !== '' && 
      isFormulaValid;
    
    setIsFormValid(isValid);
  }, [formula, isFormulaValid]);
  
  // Update formula with new values
  const handleChange = (field: keyof Formula, value: string | boolean) => {
    setFormula(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    onSubmit({
      ...formula,
      description: formula.description || null
    });
  };
  
  // Update cursor position when formula input changes
  const handleFormulaInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);
  };
  
  // Update suggestions when formula changes
  useEffect(() => {
    if (!variables.length) return;
    
    // Get text before cursor
    const textBeforeCursor = formula.formula.substring(0, cursorPosition);
    const lastWordMatch = textBeforeCursor.match(/[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]*$/);
    const lastWord = lastWordMatch ? lastWordMatch[0].trim() : '';
    
    // Only show suggestions if user has typed at least 2 characters
    if (lastWord.length >= 2) {
      const filteredSuggestions = variables.filter(v => 
        v.toLowerCase().includes(lastWord.toLowerCase())
      );
      
      setVariableSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formula.formula, cursorPosition, variables]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Formül Adı
        </label>
        <input
          type="text"
          id="name"
          value={formula.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Örn: İletkenlik Kontrolü"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Açıklama
        </label>
        <textarea
          id="description"
          value={formula.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Formülün ne işe yaradığını açıklayın"
          rows={2}
        />
      </div>
      
      <div>
        <label htmlFor="formula" className="block text-sm font-medium text-gray-700">
          Formül
        </label>
        <div className="relative">
          <FormulaEditor
            value={formula.formula}
            onChange={(value: string) => handleChange('formula', value)}
            onValidate={setIsFormulaValid}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
            placeholder="Örn: İletkenlik > Alkalinite Tayini"
          />
          
          {/* Variable suggestions */}
          {showSuggestions && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {variableSuggestions.map((variable) => (
                <div
                  key={variable}
                  className="relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-gray-100"
                  onClick={() => {
                    // Insert the variable at cursor position
                    const formulaText = formula.formula;
                    const textBeforeCursor = formulaText.substring(0, cursorPosition);
                    const lastWordMatch = textBeforeCursor.match(/[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]*$/);
                    const lastWord = lastWordMatch ? lastWordMatch[0] : '';
                    
                    const newFormula = 
                      formulaText.substring(0, cursorPosition - lastWord.length) + 
                      variable + 
                      formulaText.substring(cursorPosition);
                    
                    handleChange('formula', newFormula);
                    setShowSuggestions(false);
                  }}
                >
                  {variable}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Formül bir karşılaştırma operatörü içermelidir (&gt;, &lt;, &gt;=, &lt;=, ==, !=)
        </p>
      </div>
      
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
          Renk
        </label>
        <div className="mt-1 flex items-center">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 w-8 rounded border border-gray-300 shadow-sm"
            style={{ backgroundColor: formula.color }}
            aria-label="Renk seç"
          />
          <span className="ml-2 text-sm text-gray-500">{formula.color}</span>
          
          {showColorPicker && (
            <div className="absolute z-10 mt-2">
              <div 
                className="fixed inset-0" 
                onClick={() => setShowColorPicker(false)}
              />
              <ChromePicker
                color={formula.color}
                onChange={(color: ColorResult) => handleChange('color', color.hex)}
                disableAlpha
              />
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Formül Tipi
        </label>
        <select
          id="type"
          value={formula.type}
          onChange={(e) => handleChange('type', e.target.value as 'CELL_VALIDATION' | 'RELATIONAL')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="CELL_VALIDATION">Hücre Doğrulama</option>
          <option value="RELATIONAL">İlişkisel</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          id="active"
          type="checkbox"
          checked={formula.active}
          onChange={(e) => handleChange('active', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Aktif
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            disabled={isSubmitting}
          >
            İptal
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Kaydediliyor...' : initialFormula ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
} 