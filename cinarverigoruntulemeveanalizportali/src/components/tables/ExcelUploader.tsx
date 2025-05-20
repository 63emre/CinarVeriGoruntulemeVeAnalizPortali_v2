'use client';

import { useState } from 'react';
import { FiUpload, FiCheck, FiAlertTriangle } from 'react-icons/fi';

interface ExcelUploaderProps {
  workspaceId: string;
  onFileUploaded?: (tableIds: string[]) => void;
}

export default function ExcelUploader({ workspaceId, onFileUploaded }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [tableIds, setTableIds] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Dosya türünü kontrol et
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setErrorMessage('Lütfen geçerli bir Excel dosyası (.xlsx veya .xls) seçin.');
        setUploadStatus('error');
        return;
      }

      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMessage('Lütfen bir Excel dosyası seçin.');
      setUploadStatus('error');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      // Form verisini oluştur
      const formData = new FormData();
      formData.append('file', file);

      // İlerleme hesabı için XMLHttpRequest kullan
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setTableIds(response.tableIds || []);
          setUploadStatus('success');
          if (onFileUploaded) {
            onFileUploaded(response.tableIds || []);
          }
        } else {
          let errorMsg = 'Dosya yüklenirken bir hata oluştu.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMsg = errorResponse.message || errorMsg;
          } catch (e) {
            // JSON ayrıştırma hatası
          }
          setErrorMessage(errorMsg);
          setUploadStatus('error');
        }
      });
      
      xhr.addEventListener('error', () => {
        setErrorMessage('Ağ hatası, lütfen bağlantınızı kontrol edin.');
        setUploadStatus('error');
      });
      
      xhr.open('POST', `/api/workspaces/${workspaceId}/excel`);
      xhr.send(formData);
      
    } catch (err) {
      console.error('Excel yükleme hatası:', err);
      setErrorMessage('Dosya yüklenirken bir hata oluştu.');
      setUploadStatus('error');
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
          <div className="mb-3 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Excel Dosyası Seçin</h3>
            <p className="mt-1 text-xs text-gray-600">
              XLSX veya XLS formatlarını destekler. Maksimum dosya boyutu: 10MB.
            </p>
          </div>
          
          <input
            type="file"
            id="excel-file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <label
            htmlFor="excel-file"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Dosya Seç
          </label>
          
          {file && (
            <div className="mt-3 text-sm text-green-600">
              Seçilen dosya: {file.name}
            </div>
          )}
        </div>
        
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Yükleniyor...</span>
              <span className="text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {uploadStatus === 'success' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  Dosya başarıyla yüklendi! {tableIds.length} tablo oluşturuldu.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || uploadStatus === 'uploading'}
            className={`px-4 py-2 rounded-md text-white ${
              !file || uploadStatus === 'uploading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploadStatus === 'uploading' ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </div>
      </form>
    </div>
  );
} 