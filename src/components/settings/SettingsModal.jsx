
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Moon, Sun, Palette, Monitor, Trash2, AlertTriangle } from 'lucide-react';

const themes = [
    { id: 'light', name: 'Claro', icon: Sun, color: 'bg-gray-100' },
    { id: 'sunshine', name: 'Sunshine', icon: Sun, color: 'bg-yellow-100' },
    { id: 'matcha', name: 'Matcha', icon: Palette, color: 'bg-green-100' },
    { id: 'rose', name: 'Rose', icon: Palette, color: 'bg-rose-100' },
    { id: 'dark', name: 'Escuro', icon: Moon, color: 'bg-gray-800' },
    { id: 'majorelle', name: 'Blue', icon: Palette, color: 'bg-indigo-900' },
    { id: 'blood', name: 'Blood', icon: Palette, color: 'bg-red-900' },
    { id: 'dracula', name: 'Dracula', icon: Palette, color: 'bg-purple-900' },
];

export function SettingsModal({ isOpen, onClose }) {
    const { theme, setTheme } = useTheme();
    const { deleteAccount, user } = useAuth();

    // States for deletion confirmation
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== 'DELETAR') return;

        setIsDeleting(true);
        try {
            await deleteAccount();
            onClose();
        } catch (error) {
            alert("Erro ao deletar conta. Talvez seja necessário fazer login novamente por segurança.");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configurações">
            <div className="space-y-8">
                {/* Appearance Section */}
                <section>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Aparência
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = theme === t.id;

                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                    ${isActive
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border-color hover:border-primary/50 hover:bg-bg-tertiary'
                                        }
`}
                                >
                                    <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${isActive ? 'bg-primary text-text-on-primary' : 'bg-bg-tertiary text-text-secondary'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                                        {t.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Other Features */}
                <section>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                        Outros
                    </h3>
                    {/* Danger Zone (Only if logged in) */}
                    {user ? (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                            <div className="p-4">
                                <h4 className="flex items-center gap-2 text-red-500 font-bold mb-2">
                                    <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                                </h4>
                                <p className="text-sm text-text-secondary mb-4">
                                    A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão apagados.
                                </p>

                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Excluir minha conta
                                    </button>
                                ) : (
                                    <div className="space-y-3 animate-fade-in bg-bg-tertiary p-4 rounded-lg">
                                        <label className="text-sm text-text-secondary block">
                                            Digite <span className="font-bold text-text-primary">DELETAR</span> para confirmar:
                                        </label>
                                        <input
                                            type="text"
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            className="w-full bg-bg-primary border border-red-500/30 rounded-lg px-3 py-2 text-text-primary focus:border-red-500 focus:outline-none text-sm"
                                            placeholder="DELETAR"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDelete}
                                                disabled={confirmText !== 'DELETAR' || isDeleting}
                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                                            >
                                                {isDeleting ? 'Apagando...' : 'Confirmar Exclusão'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDeleteConfirm(false);
                                                    setConfirmText('');
                                                }}
                                                className="px-4 py-2 bg-transparent text-text-secondary hover:text-text-primary text-sm font-medium"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-bg-tertiary border border-border-color text-center">
                            <p className="text-text-secondary text-sm">Faça login para ver as opções da conta.</p>
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
}
