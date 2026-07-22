'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="pointer-events-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-3 w-80 transform transition-all duration-300 animate-in slide-in-from-right-8 fade-in"
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
              {t.type === 'error' && <AlertCircle size={16} className="text-rose-500" />}
              {t.type === 'info' && <Info size={16} className="text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{t.title}</div>
              {t.description && <div className="text-xs text-neutral-400 mt-1">{t.description}</div>}
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
