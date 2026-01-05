import { Search, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { useSearch } from '../../hooks/useSearch';

export function Header() {
  const { query, setQuery, results, isSearching, setResults } = useSearch();
  const navigate = useNavigate(); // Hook de navegação

  // Função para lidar com o clique
  const handleResultClick = (animeId) => {
    navigate(`/anime/${animeId}`); // Navega para a página
    setQuery('');   // Limpa o texto
    setResults([]); // Fecha o dropdown
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Olá, Visitante!! 👋</h1>
        <p className="text-sm text-gray-500 dark:text-text-secondary">Descubra novos animes para maratonar hoje.</p>
      </div>
      
      <div className="relative group w-full max-w-md ml-auto hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar animes, personagens..." 
          className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-gray-100 dark:bg-surface-dark text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 shadow-sm"
        />

        {isSearching && (
          <div className="absolute inset-y-0 right-12 flex items-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-xs text-gray-500 border border-gray-600 rounded px-1.5 py-0.5">⌘K</span>
        </div>

        {/* DROPDOWN DE RESULTADOS */}
        {results.length > 0 && (
          <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {results.map((anime) => (
              <div 
                key={anime.id}
                onClick={() => handleResultClick(anime.id)} // <--- AQUI ESTÁ A MÁGICA
                className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
              >
                <img src={anime.image} alt={anime.title} className="w-10 h-14 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{anime.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-text-secondary">
                    <span>{anime.year}</span>
                    <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" /> {anime.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}