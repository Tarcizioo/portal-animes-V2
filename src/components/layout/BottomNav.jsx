import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Library, User, Menu, Settings, Globe, Users, LogOut, X, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { UserSearchModal } from '@/components/profile/UserSearchModal';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut, signInGoogle } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Compass, label: 'Catálogo', path: '/catalog' },
        { icon: Library, label: 'Biblioteca', path: '/library' },
        { icon: User, label: 'Perfil', path: '/profile', authRequired: true },
        { icon: Menu, label: 'Menu', action: () => setIsMenuOpen(true) },
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
            icon: BarChart3,
            label: 'Est. Pessoais',
            onClick: () => { navigate('/stats'); setIsMenuOpen(false); },
            color: 'text-green-400', bg: 'bg-green-500/10'
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
            {/* Modals */}
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
                            className="bg-bg-primary border border-white/5 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-safe"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-text-primary">Menu</h3>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-transparent hover:bg-bg-secondary rounded-full text-text-secondary hover:text-text-primary transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {menuItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={item.onClick}
                                        className="flex flex-col items-center justify-center gap-3 p-4 bg-bg-secondary/30 hover:bg-bg-secondary rounded-2xl border border-transparent hover:border-white/5 transition-all active:scale-95 group"
                                    >
                                        <div className={`p-3.5 rounded-2xl bg-bg-primary shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {user && (
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 flex items-center justify-center gap-2 text-red-400 font-bold bg-bg-secondary/30 hover:bg-red-500/10 rounded-2xl transition-colors border border-transparent active:scale-98"
                            >
                                <LogOut className="w-5 h-5" /> Sair da Conta
                            </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
                {/* Gradient Line Top */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border-color to-transparent opacity-50" />
                
                <div className="bg-bg-primary px-2 border-t border-border-color">
                    <nav className="flex justify-around items-center h-[72px]">
                        {navItems.map((item) => {
                            const isActive = item.path ? location.pathname === item.path : isMenuOpen;

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        if (item.action) {
                                            item.action();
                                        } else if (item.authRequired && !user) {
                                            signInGoogle();
                                        } else {
                                            navigate(item.path);
                                        }
                                    }}
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                    className="relative flex flex-col items-center justify-center w-full h-full gap-1 group outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none bg-transparent border-none p-0"
                                >
                                    {/* Active Indicator (Top Glow) */}
                                    {isActive && !isMenuOpen && item.path && (
                                        <motion.div
                                            layoutId="bottomNavIndicator"
                                            className="absolute -top-[1px] w-10 h-[3px] rounded-b-full bg-primary shadow-[0_4px_12px_-2px_var(--color-primary)]"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}

                                    {/* Icon Container */}
                                    <div className={clsx(
                                        "p-2 rounded-2xl transition-all duration-300 relative",
                                        isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
                                    )}>
                                        {/* Active Soft Background Glow */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-sm" />
                                        )}
                                        
                                        <item.icon
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={clsx(
                                                "w-6 h-6 transition-all duration-300 relative z-10", 
                                                isActive ? "scale-110 translate-y-[-2px]" : "group-active:scale-90"
                                            )}
                                        />
                                    </div>

                                    {/* Label */}
                                    <span className={clsx(
                                        "text-[10px] font-medium transition-all duration-300",
                                        isActive ? "text-primary font-bold translate-y-[-2px]" : "text-text-secondary/70"
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
