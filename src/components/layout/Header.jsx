import { useState } from 'react';
import { Search, Loader2, Star, Menu, X, Home, Compass, Heart, Clock } from 'lucide-react'; // Ícones adicionados
import { useNavigate, Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';

export function Header() {
    const { query, setQuery, results, isSearching, setResults } = useSearch();
    const navigate = useNavigate();
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Novo estado do Menu

    const handleResultClick = (animeId) => {
        navigate(`/anime/${animeId}`);
        setQuery('');
        setResults([]);
        setShowMobileSearch(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5">

                <div className="flex items-center gap-4">
                    {/* BOTÃO HAMBURGUER (Só mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-1 text-gray-800 dark:text-white hover:bg-white/10 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className={`${showMobileSearch ? 'hidden md:block' : 'block'}`}>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Olá, Visitante!! 👋</h1>
                        <p className="text-sm text-gray-500 dark:text-text-secondary hidden sm:block">Descubra novos animes.</p>
                    </div>
                </div>

                {/* ... (Lógica da Busca mantém a mesma da resposta anterior) ... */}
                {!showMobileSearch && (
                    <button onClick={() => setShowMobileSearch(true)} className="md:hidden p-2 text-gray-500 dark:text-white">
                        <Search className="w-6 h-6" />
                    </button>
                )}

                {/* Input de Busca (código abreviado pois já foi feito na V1) */}
                <div className={`relative group w-full max-w-md ml-auto transition-all duration-300 ${showMobileSearch ? 'block absolute left-0 top-2 px-4 z-50' : 'hidden md:block'}`}>
                    {/* ... Input e Resultados ... */}
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-3 flex items-center pointer-events-none">
                        <Search className={`w-5 h-5 text-gray-400 ${showMobileSearch ? 'ml-4' : ''}`} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar..."
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-100 dark:bg-surface-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {/* Botão fechar busca mobile */}
                    {showMobileSearch && (
                        <button onClick={() => setShowMobileSearch(false)} className="absolute inset-y-0 right-4 flex items-center text-gray-500"><X className="w-5 h-5" /></button>
                    )}
                    {/* Dropdown de Resultados (mantém código anterior) */}
                    {results.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 w-full bg-surface-dark rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                            {results.map(anime => (
                                <div key={anime.id} onClick={() => handleResultClick(anime.id)} className="flex gap-3 p-3 hover:bg-primary/10 cursor-pointer border-b border-white/5">
                                    <img src={anime.image} className="w-8 h-12 object-cover rounded" />
                                    <div className="text-sm text-white">{anime.title}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* --- MENU DRAWER MOBILE --- */}
            {/* Fundo escuro */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* O Menu em si */}
            <aside className={`
          fixed top-0 left-0 h-full w-64 bg-background-dark border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col gap-6
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden
      `}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-white">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="text-white/50 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col gap-4">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-gray-300 hover:text-primary">
                        <Home className="w-5 h-5" /> Início
                    </Link>
                    <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-gray-300 hover:text-primary">
                        <Compass className="w-5 h-5" /> Explorar
                    </Link>
                    <Link to="#" className="flex items-center gap-4 text-gray-300 hover:text-primary">
                        <Heart className="w-5 h-5" /> Favoritos
                    </Link>
                    <Link to="#" className="flex items-center gap-4 text-gray-300 hover:text-primary">
                        <Clock className="w-5 h-5" /> Histórico
                    </Link>
                </nav>
            </aside>
        </>
    );
}