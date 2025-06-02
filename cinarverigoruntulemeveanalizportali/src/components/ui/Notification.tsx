'use client';

import { useState, useEffect } from 'react';
import { FcOk, FcCancel, FcInfo, FcHighPriority } from 'react-icons/fc';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
  timestamp: number;
}

// Global notification state
let notifications: NotificationState[] = [];
let notificationCallbacks: ((notifications: NotificationState[]) => void)[] = [];

// Utility functions to show notifications
export function showSuccess(message: string, duration: number = 4000) {
  addNotification('success', message, duration);
}

export function showError(message: string, duration: number = 6000) {
  addNotification('error', message, duration);
}

export function showInfo(message: string, duration: number = 3000) {
  addNotification('info', message, duration);
}

export function showWarning(message: string, duration: number = 5000) {
  addNotification('warning', message, duration);
}

function addNotification(type: NotificationState['type'], message: string, duration: number) {
  const notification: NotificationState = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    message,
    duration,
    timestamp: Date.now()
  };
  
  notifications.push(notification);
  notifyCallbacks();
  
  // Auto remove after duration
  setTimeout(() => {
    removeNotification(notification.id);
  }, duration);
}

function removeNotification(id: string) {
  notifications = notifications.filter(n => n.id !== id);
  notifyCallbacks();
}

function notifyCallbacks() {
  notificationCallbacks.forEach(callback => callback([...notifications]));
}

// Notification component
function Notification({ type, message, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <FcOk className="h-6 w-6" />;
      case 'error': return <FcCancel className="h-6 w-6" />;
      case 'warning': return <FcHighPriority className="h-6 w-6" />;
      case 'info': default: return <FcInfo className="h-6 w-6" />;
    }
  };
  
  const getColorClasses = () => {
    switch (type) {
      case 'success': 
        return 'bg-green-50 border-green-200 text-green-800 shadow-green-100';
      case 'error': 
        return 'bg-red-50 border-red-200 text-red-800 shadow-red-100';
      case 'warning': 
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100';
      case 'info': 
      default: 
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100';
    }
  };
  
  return (
    <div
      className={`
        max-w-md w-full border-l-4 p-4 rounded-lg shadow-lg
        transition-all duration-300 ease-in-out transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColorClasses()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
          >
            <span className="sr-only">Kapat</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification container component
export function NotificationContainer() {
  const [notificationList, setNotificationList] = useState<NotificationState[]>([]);
  
  useEffect(() => {
    const callback = (newNotifications: NotificationState[]) => {
      setNotificationList(newNotifications);
    };
    
    notificationCallbacks.push(callback);
    
    return () => {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
    };
  }, []);
  
  if (notificationList.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notificationList.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Cell update specific notifications
export function showCellUpdateSuccess(cellValue: string | number | null, rowId: string, colId: string) {
  const displayValue = cellValue?.toString() || 'boş değer';
  showSuccess(`✅ Hücre başarıyla güncellendi: ${displayValue}`, 3000);
}

export function showCellUpdateError(error: string) {
  showError(`❌ Hücre güncellenemedi: ${error}`, 5000);
}

export function showFormulaApplied(formulaName: string, highlightCount: number) {
  if (highlightCount > 0) {
    showSuccess(`🎯 ${formulaName} formülü uygulandı: ${highlightCount} hücre vurgulandı`, 4000);
  } else {
    showInfo(`ℹ️ ${formulaName} formülü uygulandı, hiçbir hücre kriterleri karşılamadı`, 3000);
  }
}

export function showDataSaved() {
  showSuccess('💾 Tüm değişiklikler başarıyla kaydedildi!', 3000);
}

export function showDataValidationError(errors: string[]) {
  const errorMessage = `❌ Veri doğrulama hataları:\n${errors.join('\n')}`;
  showError(errorMessage, 6000);
}

// Turkish specific messages for common operations
export const TurkishMessages = {
  CELL_UPDATED: (value: string) => `📝 Hücre güncellendi: ${value}`,
  CELL_SAVED: (value: string) => `✅ Hücre kaydedildi: ${value}`,
  CELL_SAVE_ERROR: '❌ Hücre kaydedilemedi',
  FORMULA_APPLIED: (name: string, count: number) => 
    count > 0 
      ? `🎯 ${name} formülü uygulandı: ${count} hücre vurgulandı`
      : `ℹ️ ${name} formülü uygulandı, hiçbir hücre kriterleri karşılamadı`,
  DATA_SAVED: '💾 Veriler başarıyla kaydedildi!',
  DATA_SAVE_ERROR: '❌ Veri kaydetme başarısız',
  VALIDATION_ERROR: (error: string) => `⚠️ Doğrulama hatası: ${error}`,
  NETWORK_ERROR: '🌐 Ağ bağlantısı hatası, lütfen tekrar deneyin',
  PERMISSION_ERROR: '🔒 Bu işlem için yetkiniz bulunmuyor',
  VALUE_TOO_LARGE: (max: number) => `📏 Değer çok büyük (maksimum: ${max})`,
  VALUE_TOO_SMALL: (min: number) => `📏 Değer çok küçük (minimum: ${min})`,
  INVALID_FORMAT: (expected: string) => `📝 Geçersiz format (beklenen: ${expected})`,
  DUPLICATE_VALUE: '🔄 Bu değer zaten mevcut',
  REQUIRED_FIELD: '❗ Bu alan zorunludur',
  FORMULA_CREATED: (name: string) => `✨ ${name} formülü oluşturuldu`,
  FORMULA_UPDATED: (name: string) => `🔄 ${name} formülü güncellendi`,
  FORMULA_DELETED: (name: string) => `🗑️ ${name} formülü silindi`,
  WORKSPACE_CREATED: (name: string) => `🏢 ${name} workspace'i oluşturuldu`,
  TABLE_IMPORTED: (name: string) => `📊 ${name} tablosu içe aktarıldı`,
  PDF_EXPORTED: (name: string) => `📄 ${name} PDF olarak dışa aktarıldı`,
  AUTO_SAVE_ENABLED: '🔄 Otomatik kaydetme etkinleştirildi',
  AUTO_SAVE_DISABLED: '⏸️ Otomatik kaydetme durduruldu'
};

export default Notification; 