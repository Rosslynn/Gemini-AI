
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icons } from './Icon';
import { useTranslation } from '../hooks/useTranslation';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { t } = useTranslation(); // Hook para traducción

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-dismiss accesible
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in-right`}>
            <div className="toast-icon">
                {toast.type === 'success' && <Icons.Check size={16} />}
                {toast.type === 'error' && <Icons.X size={16} />}
                {toast.type === 'info' && <Icons.Sparkles size={16} />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button 
                onClick={() => removeToast(toast.id)} 
                className="toast-close" 
                aria-label={t('aria.close_notification')}
                type="button"
            >
                <Icons.X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
