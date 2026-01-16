
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export function Header() {
    const { query, setQuery, results, setResults } = useSearch();
    const navigate = useNavigate();
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const { user } = useAuth();
    const { profile } = useUserProfile();

    const displayName = profile?.displayName || user?.displayName || 'Visitante';

    const handleResultClick = (animeId) => {
        navigate(`/anime/${animeId}`);
        setQuery('');
        setResults([]);
        setShowMobileSearch(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between border-b border-border-color transition-colors duration-300">

                <div className="flex items-center gap-4 pl-12 md:pl-0">
                    <div className={`${showMobileSearch ? 'hidden md:block' : 'block'}`}>
                        <h1 className="text-xl font-bold text-text-primary">Olá, {displayName}!! 👋</h1>
                        <p className="text-sm text-text-secondary hidden sm:block">Descubra novos animes.</p>
                    </div>
                </div>

                {/* SEARCH LOGIC */}
                {!showMobileSearch && (
                    <div className="flex items-center gap-2 md:hidden ml-auto">
                        <button onClick={() => setShowMobileSearch(true)} className="p-2 text-text-secondary hover:text-primary">
                            <Search className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* DESKTOP SEARCH */}
                <div className={`relative group w-full max-w-md ml-auto transition-all duration-300 ${showMobileSearch ? 'block' : 'hidden md:flex items-center gap-4'}`}>

                    {/* Mobile Search Overlay */}
                    <div className={`${showMobileSearch ? 'fixed inset-0 z-50 bg-bg-primary px-4 flex items-center' : 'relative w-full'}`}>
                        {/* Mobile Close Button (Left side now for better UX?) No, keep explicit close */}

                        <div className={`relative w-full ${showMobileSearch ? 'max-w-full' : 'max-w-md'}`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-text-secondary" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Pesquisar..."
                                autoFocus={showMobileSearch}
                                className="block w-full pl-10 pr-10 py-2.5 border-none rounded-xl bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary/50"
                            />
                            {/* Mobile Close Button (Inside Input) */}
                            {showMobileSearch && (
                                <button onClick={() => setShowMobileSearch(false)} className="absolute inset-y-0 right-2 flex items-center p-2 text-text-secondary hover:text-primary">
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {/* Results Dropdown */}
                            {results.length > 0 && (
                                <div className="absolute top-full mt-2 left-0 w-full bg-bg-secondary rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto border border-border-color">
                                    {results.map(anime => (
                                        <div key={anime.id} onClick={() => handleResultClick(anime.id)} className="flex gap-3 p-3 hover:bg-primary/10 cursor-pointer border-b border-border-color last:border-0">
                                            <img src={anime.image} className="w-8 h-12 object-cover rounded" alt={anime.title} />
                                            <div className="text-sm text-text-primary">{anime.title}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* MOBILE DRAWER REMOVED - Using Sidebar's own trigger */}
        </>
    );
}
