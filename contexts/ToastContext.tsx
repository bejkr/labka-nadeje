import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback(({ type, title, message, duration = 5000 }: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, title, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = (title: string, message?: string) => addToast({ type: 'success', title, message });
    const error = (title: string, message?: string) => addToast({ type: 'error', title, message });
    const info = (title: string, message?: string) => addToast({ type: 'info', title, message });
    const warning = (title: string, message?: string) => addToast({ type: 'warning', title, message });

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none p-4 md:p-0 w-full md:w-auto">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    const icons = {
        success: <CheckCircle2 className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        warning: <AlertTriangle className="text-orange-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const borders = {
        success: 'border-green-100',
        error: 'border-red-100',
        warning: 'border-orange-100',
        info: 'border-blue-100'
    };

    return (
        <div className={`
            pointer-events-auto bg-white rounded-xl shadow-lg border ${borders[toast.type]} p-4 flex items-start gap-3 
            min-w-[320px] max-w-sm animate-in slide-in-from-right-full fade-in duration-300
        `}>
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{toast.title}</h4>
                {toast.message && <p className="text-gray-500 text-sm mt-1 leading-relaxed">{toast.message}</p>}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition p-0.5 -mr-1"
            >
                <X size={16} />
            </button>
        </div>
    );
};
