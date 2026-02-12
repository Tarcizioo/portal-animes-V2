import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, title, message }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const value = {
        toast: {
            success: (message, title = 'Sucesso') => addToast({ type: 'success', title, message }),
            error: (message, title = 'Erro') => addToast({ type: 'error', title, message }),
            info: (message, title = 'Informação') => addToast({ type: 'info', title, message }),
            warning: (message, title = 'Atenção') => addToast({ type: 'warning', title, message }),
        }
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                    {toasts.map((t) => (
                        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Componente UI do Toast (interno)
function Toast({ type, title, message, onClose }) {
    const styles = {
        success: {
            bg: 'bg-green-500',
            icon: CheckCircle,
            border: 'border-green-600'
        },
        error: {
            bg: 'bg-red-500',
            icon: AlertCircle,
            border: 'border-red-600'
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: AlertTriangle,
            border: 'border-yellow-600'
        },
        info: {
            bg: 'bg-blue-500',
            icon: Info,
            border: 'border-blue-600'
        }
    };

    const style = styles[type] || styles.info;
    const Icon = style.icon;

    return (
        <div className="pointer-events-auto min-w-[300px] max-w-sm w-full bg-bg-secondary border border-border-color rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-slide-in-right flex relative group">

            {/* Faixa Colorida Lateral */}
            <div className={`w-1.5 ${style.bg}`} />

            <div className="flex-1 p-4 pr-10">
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-1 rounded-full ${style.bg}/20 ${type === 'warning' ? 'text-yellow-400' : 'text-' + style.bg.split('-')[1] + '-400'}`}>
                        <Icon className={`w-4 h-4 ${type === 'warning' ? 'text-yellow-400' : 'text-' + style.bg.split('-')[1] + '-400'}`} />
                    </div>
                    <div>
                        {title && <h4 className="text-sm font-bold text-text-primary mb-1">{title}</h4>}
                        <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
