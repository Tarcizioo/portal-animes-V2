
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Palette, Monitor } from 'lucide-react';

const themes = [
    { id: 'light', name: 'Claro', icon: Sun, color: 'bg-gray-100' },
    { id: 'sunshine', name: 'Sunshine', icon: Sun, color: 'bg-yellow-100' },
    { id: 'matcha', name: 'Matcha', icon: Palette, color: 'bg-green-100' },
    { id: 'rose', name: 'Rose', icon: Palette, color: 'bg-rose-100' },
    { id: 'dark', name: 'Escuro', icon: Moon, color: 'bg-gray-800' },
    { id: 'majorelle', name: 'Majorelle', icon: Palette, color: 'bg-indigo-900' },
    { id: 'blood', name: 'Blood', icon: Palette, color: 'bg-red-900' },
    { id: 'dracula', name: 'Dracula', icon: Palette, color: 'bg-purple-900' },
];

export function SettingsModal({ isOpen, onClose }) {
    const { theme, setTheme } = useTheme();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configurações">
            <div className="space-y-8">
                {/* Appearance Section */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                                            : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }
`}
                                >
                                    <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {t.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Other Features - Placeholder */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                        Outros
                    </h3>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Mais opções em breve...</p>
                    </div>
                </section>
            </div>
        </Modal>
    );
}
