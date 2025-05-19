'use client';

import { useState } from 'react';
import { FcUpload, FcCheckmark, FcHighPriority } from 'react-icons/fc';

interface ExcelUploaderProps {
  workspaceId: string;
  onUploadSuccess: (tableIds: string[]) => void;
}

export default function ExcelUploader({ workspaceId, onUploadSuccess }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile: File) => {
    setError('');
    
    // Check file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Yalnızca Excel dosyaları (.xlsx, .xls) yüklenebilir');
      setFile(null);
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'tan büyük olamaz');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (droppedFile) {
      validateFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Lütfen bir Excel dosyası seçin');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/excel`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Dosya yükleme başarısız');
      }
      
      // Check if data.sheets exists before accessing its length
      const sheetCount = data.sheets?.length || 0;
      setSuccess(`Excel dosyası başarıyla yüklendi (${sheetCount} sayfa)`);
      setFile(null);
      
      // Call the success callback with table IDs if they exist
      if (onUploadSuccess && data.tableIds) {
        onUploadSuccess(data.tableIds);
      }
    } catch (err) {
      setError((err as Error).message || 'Dosya yüklenirken bir hata oluştu');
      console.error('Excel upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FcUpload className="h-12 w-12 mb-3" />
          
          <p className="text-center text-gray-600 mb-4">
            Excel dosyasını sürükleyip bırakın veya <span className="text-blue-600 font-medium">dosya seçin</span>
          </p>
          
          <input
            type="file"
            id="excel-file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <label 
            htmlFor="excel-file"
            className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition"
          >
            Dosya Seç
          </label>
          
          {file && (
            <div className="mt-4 flex items-center p-2 bg-gray-100 rounded-md w-full">
              <FcCheckmark className="h-5 w-5 mr-2" />
              <span className="text-sm text-gray-800 truncate">{file.name}</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-3 flex items-center text-red-600">
            <FcHighPriority className="h-5 w-5 mr-1" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mt-3 flex items-center text-green-600">
            <FcCheckmark className="h-5 w-5 mr-1" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        
        <div className="mt-4">
          <button
            type="submit"
            disabled={!file || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Yükleniyor...' : 'Dosyayı Yükle'}
          </button>
        </div>
      </form>
    </div>
  );
} 