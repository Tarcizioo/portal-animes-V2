
import { useState } from 'react';
import { Search, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { motion } from 'framer-motion';

export function Header() {
    const { query, setQuery, results, setResults } = useSearch();
    const navigate = useNavigate();
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const { unreadCount } = useNotifications();

    // ... (rest of the hook logic is fine)

    // Just replacing the render part for buttons mainly
    const { user } = useAuth();
    const { profile } = useUserProfile();

    const displayName = profile?.displayName || user?.displayName || 'Visitante';

    const handleResultClick = (result) => {
        if (result.kind === 'character') {
            navigate(`/character/${result.id}`);
        } else {
            navigate(`/anime/${result.id}`);
        }
        setQuery('');
        setResults([]);
        setSelectedIndex(-1);
        setShowMobileSearch(false);
    };

    const handleKeyDown = (e) => {
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleResultClick(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            setResults([]);
            setSelectedIndex(-1);
            setShowMobileSearch(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between border-b border-border-color transition-colors duration-300">

            <div className="flex items-center gap-4 pl-12 md:pl-0">
                <div className={`${showMobileSearch ? 'hidden md:block' : 'block'}`}>
                    <h1 className="text-xl font-bold text-text-primary">Olá, {displayName}!! 👋</h1>
                    <p className="text-sm text-text-secondary hidden sm:block">Descubra novos animes.</p>
                </div>
            </div>

            {/* NOTIFICATIONS & SEARCH CONTAINER */}
            <div className={`flex items-center gap-4 ml-auto ${showMobileSearch ? 'w-full' : ''}`}>

                {/* Notification Bell (Hidden if mobile search active) */}
                {!showMobileSearch && (
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="p-2 relative text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-bg-tertiary"
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-primary animate-pulse"></span>
                            )}
                        </motion.button>
                        <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                    </div>
                )}

                {/* SEARCH LOGIC */}
                {!showMobileSearch && (
                    <div className="flex items-center gap-2 md:hidden">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowMobileSearch(true)}
                            className="p-2 text-text-secondary hover:text-primary"
                        >
                            <Search className="w-6 h-6" />
                        </motion.button>
                    </div>
                )}

                {/* DESKTOP SEARCH */}
                <div className={`relative group transition-all duration-300 ease-out ${showMobileSearch ? 'block flex-1 w-full' : 'hidden md:flex items-center gap-4 w-72 focus-within:w-96'}`}>

                    {/* Mobile Search Overlay */}
                    <div className={`${showMobileSearch ? 'relative w-full' : 'relative w-full'}`}>

                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors duration-300" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(-1);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Pesquisar..."
                                autoFocus={showMobileSearch}
                                className="block w-full pl-10 pr-10 py-2.5 border-2 border-transparent rounded-2xl bg-bg-tertiary text-text-primary focus:outline-none focus:border-primary focus:bg-bg-secondary focus:shadow-[0_0_20px_var(--shadow-color)] transition-all duration-300 shadow-sm hover:shadow-md placeholder-text-secondary/50"
                            />
                            {/* Mobile Close Button (Inside Input) */}
                            {showMobileSearch && (
                                <button onClick={() => setShowMobileSearch(false)} className="absolute inset-y-0 right-2 flex items-center p-2 text-text-secondary hover:text-primary">
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {/* Results Dropdown */}
                            {results.length > 0 && (
                                <div className="absolute top-full mt-3 left-0 w-full bg-bg-secondary rounded-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto border border-border-color overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-2">
                                        {results.map((item, index) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleResultClick(item)}
                                                className={`
                                                    flex gap-4 p-3 cursor-pointer transition-all border-l-4 relative overflow-hidden group/item
                                                    ${index === selectedIndex ? 'bg-primary/5 border-primary pl-4' : 'border-transparent hover:bg-bg-tertiary/50 hover:pl-4'}
                                                `}
                                            >
                                                {/* Poster */}
                                                <div className="w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-sm relative group-hover/item:scale-105 transition-transform duration-300">
                                                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                                                </div>

                                                {/* Meta Info */}
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <h4 className={`text-sm font-bold truncate transition-colors duration-200 ${index === selectedIndex ? 'text-primary' : 'text-text-primary group-hover/item:text-primary'}`}>
                                                        {item.title}
                                                    </h4>

                                                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.kind === 'character' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                            {item.kind === 'character' ? 'Personagem' : 'Anime'}
                                                        </span>

                                                        {item.year && item.year !== 'N/A' && (
                                                            <span>{item.year}</span>
                                                        )}
                                                        {item.type && item.kind !== 'character' && (
                                                            <>
                                                                <span className="w-1 h-1 bg-text-secondary/30 rounded-full"></span>
                                                                <span>{item.type}</span>
                                                            </>
                                                        )}
                                                        {item.score && (
                                                            <>
                                                                <span className="w-1 h-1 bg-text-secondary/30 rounded-full"></span>
                                                                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                                                                    ★ {item.score}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {item.status && (
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary/30 mt-1">
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
