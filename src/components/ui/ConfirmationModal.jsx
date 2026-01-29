
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar Ação",
    message = "Tem certeza que deseja prosseguir?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDestructive = false
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center p-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {title}
                </h3>

                <p className="text-text-secondary leading-relaxed mb-8 max-w-sm">
                    {message}
                </p>

                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-text-primary bg-bg-tertiary hover:bg-bg-tertiary/80 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
