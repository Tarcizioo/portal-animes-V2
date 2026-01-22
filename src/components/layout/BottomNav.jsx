import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Library, User, Menu, Settings, Globe, Users, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { UserSearchModal } from '@/components/profile/UserSearchModal';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Compass, label: 'Catálogo', path: '/catalog' },
        { icon: Library, label: 'Biblioteca', path: '/library' },
        { icon: User, label: 'Perfil', path: '/profile' },
        { icon: Menu, label: 'Menu', action: () => setIsMenuOpen(true) }, // Menu Trigger
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const menuItems = [
        {
            icon: Users,
            label: 'Personagens',
            onClick: () => { navigate('/characters'); setIsMenuOpen(false); },
            color: 'text-purple-400', bg: 'bg-purple-500/10'
        },
        {
            icon: Globe,
            label: 'Explorar Usuários',
            onClick: () => { setIsUserSearchOpen(true); setIsMenuOpen(false); },
            color: 'text-blue-400', bg: 'bg-blue-500/10'
        },
        {
            icon: Settings,
            label: 'Configurações',
            onClick: () => { setIsSettingsOpen(true); setIsMenuOpen(false); },
            color: 'text-gray-400', bg: 'bg-gray-500/10'
        },
    ];

    return (
        <>
            {/* Modals integrated here for mobile context */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <UserSearchModal isOpen={isUserSearchOpen} onClose={() => setIsUserSearchOpen(false)} />

            {/* Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden flex items-end pb-20 justify-center px-4"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-bg-secondary border border-border-color w-full max-w-sm rounded-2xl p-4 shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-color">
                                <h3 className="font-bold text-lg text-text-primary">Menu</h3>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-bg-tertiary rounded-full text-text-secondary">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {menuItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={item.onClick}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-bg-tertiary hover:bg-bg-primary rounded-xl border border-transparent hover:border-border-color transition-all active:scale-95"
                                    >
                                        <div className={`p-3 rounded-full ${item.bg} ${item.color}`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full py-3 flex items-center justify-center gap-2 text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Sair da Conta
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
                <div className="bg-bg-primary/80 dark:bg-black/80 backdrop-blur-2xl border-t border-border-color shadow-[0_-4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
                    <nav className="flex justify-around items-center h-16 px-2">
                        {navItems.map((item) => {
                            const isActive = item.path ? location.pathname === item.path : isMenuOpen; // Highlight Menu if open

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => item.action ? item.action() : navigate(item.path)}
                                    className="relative flex flex-col items-center justify-center w-full h-full gap-1 group"
                                >
                                    {isActive && !isMenuOpen && item.path && ( // Only show indicator for routes, not menu toggle
                                        <motion.div
                                            layoutId="bottomNavIndicator"
                                            className="absolute -top-[1px] w-12 h-[2px] bg-primary shadow-[0_0_10px_var(--color-primary)]"
                                        />
                                    )}

                                    <div className={clsx(
                                        "p-1.5 rounded-xl transition-all duration-300",
                                        isActive ? "text-primary bg-primary/10" : "text-text-secondary group-hover:text-text-primary"
                                    )}>
                                        <item.icon
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={clsx("w-6 h-6 transition-transform duration-300", isActive && "scale-110")}
                                        />
                                    </div>

                                    <span className={clsx(
                                        "text-[10px] font-medium transition-colors duration-300",
                                        isActive ? "text-primary" : "text-text-secondary"
                                    )}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
}
