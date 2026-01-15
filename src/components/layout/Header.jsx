
import { useState } from 'react';
import { Search, Menu, X, Home, Compass } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export function Header() {
    const { query, setQuery, results, setResults } = useSearch();
    const navigate = useNavigate();
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

                <div className="flex items-center gap-4">
                    {/* MOBILE HAMBURGER */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-1 text-text-primary hover:bg-bg-tertiary rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

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

            {/* MOBILE DRAWER */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border-color z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col gap-6
                ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:hidden shadow-2xl
            `}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-text-primary">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="text-text-secondary hover:text-primary">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col gap-4">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-bg-tertiary">
                        <Home className="w-5 h-5" /> Início
                    </Link>
                    <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-bg-tertiary">
                        <Compass className="w-5 h-5" /> Explorar
                    </Link>
                </nav>
            </aside>
        </>
    );
}
