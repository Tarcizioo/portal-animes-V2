import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { AnimeCard } from '../ui/AnimeCard';
import { SkeletonCard } from '../ui/SkeletonCard';
import { useCatalog } from '../../hooks/useCatalog';
import { Filter, SlidersHorizontal, ChevronDown, Search, X, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const GENRES = [
  { id: 1, name: 'Ação' },
  { id: 2, name: 'Aventura' },
  { id: 4, name: 'Comédia' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasia' },
  { id: 14, name: 'Terror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Sobrenatural' },
  { id: 30, name: 'Esportes' },
  { id: 41, name: 'Suspense' },
];

export function Catalog() {
  const { animes, loading, loadMore, hasMore, filters, updateFilter, clearFilters } = useCatalog();
  const sentinelRef = useRef(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      }, 
      { rootMargin: "200px" }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  // Toggle de status
  const handleStatusToggle = (statusValue) => {
    updateFilter('status', filters.status === statusValue ? '' : statusValue);
  };

  // Toggle de gênero
  const handleGenreToggle = (genreId) => {
    const currentGenres = filters.genres;
    if (currentGenres.includes(genreId)) {
      updateFilter('genres', currentGenres.filter(id => id !== genreId));
    } else {
      updateFilter('genres', [...currentGenres, genreId]);
    }
  };

  // Verifica se há filtros ativos
  const hasActiveFilters = filters.q || filters.status || filters.genres.length > 0;
  
  // Define quantos skeletons mostrar
  const skeletonCount = animes.length === 0 ? 12 : 4;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-white font-sans">
      <Sidebar />
      
      <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-background-dark">
        <Header />

        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
          
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Catálogo Completo</h1>
            <p className="text-gray-400">Descubra e filtre seus animes favoritos.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* ============================================ */}
            {/* SIDEBAR DE FILTROS */}
            {/* ============================================ */}
            <aside className={clsx(
              "lg:w-64 flex-shrink-0 space-y-8",
              showMobileFilters 
                ? "fixed inset-0 z-50 bg-background-dark p-6 overflow-y-auto" 
                : "hidden lg:block"
            )}>
              {/* Botão fechar mobile */}
              <div className="flex items-center justify-between lg:hidden mb-6">
                <h2 className="text-xl font-bold">Filtros</h2>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Campo de busca */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4" /> Pesquisar
                </h3>
                <input 
                  type="text" 
                  value={filters.q}
                  placeholder="Naruto, One Piece..."
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors placeholder-gray-600"
                  onChange={(e) => updateFilter('q', e.target.value)} 
                />
              </div>

              {/* Filtro de Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Status
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { val: 'airing', label: 'Em Lançamento' },
                    { val: 'complete', label: 'Completo' },
                    { val: 'upcoming', label: 'Em Breve' }
                  ].map((item) => (
                    <div 
                      key={item.val}
                      onClick={() => handleStatusToggle(item.val)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border
                        ${filters.status === item.val 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400'}
                      `}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        filters.status === item.val ? 'bg-primary' : 'bg-gray-600'
                      }`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro de Gêneros */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Gêneros
                  </h3>
                  {filters.genres.length > 0 && (
                    <span className="text-xs text-primary font-bold">
                      {filters.genres.length}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const isSelected = filters.genres.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => handleGenreToggle(g.id)}
                        className={`
                          text-xs px-3 py-1.5 rounded-full border transition-all
                          ${isSelected 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' 
                            : 'bg-surface-dark border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}
                        `}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Limpar Filtros */}
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Limpar Filtros
                </button>
              )}
            </aside>

            {/* ============================================ */}
            {/* ÁREA PRINCIPAL */}
            {/* ============================================ */}
            <div className="flex-1 min-w-0">
              
              {/* Barra de controles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-surface-dark/50 rounded-xl border border-white/5">
                {/* Contador e botão mobile */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden p-2 bg-primary/10 text-primary rounded-lg"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-400">
                    <strong className="text-white">{animes.length}</strong> animes listados
                  </span>
                </div>

                {/* Dropdown de ordenação */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-gray-500 hidden sm:inline whitespace-nowrap">
                    Ordenar por:
                  </span>
                  <div className="relative group w-full sm:w-auto">
                    <select 
                      className="w-full sm:w-auto appearance-none bg-surface-dark border border-white/10 text-white pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer hover:bg-white/5 transition-colors"
                      value={filters.orderBy}
                      onChange={(e) => updateFilter('orderBy', e.target.value)}
                    >
                      <option value="ranking">🏆 Top Ranking (Melhor Score)</option>
                      <option value="popularity">🔥 Mais Populares (Members)</option>
                      <option value="favorites">❤️ Mais Favoritados</option>
                      <option disabled>──────────</option>
                      <option value="newest">📅 Mais Recentes</option>
                      <option value="oldest">🕰️ Mais Antigos</option>
                      <option value="az">🔤 A → Z</option>
                      <option value="za">🔤 Z → A</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid de animes */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {animes.map((anime) => (
                  <AnimeCard 
                    key={`${anime.id}-${filters.orderBy}`} 
                    {...anime}
                  />
                ))}

                {/* Skeletons durante carregamento */}
                {loading && Array.from({ length: skeletonCount }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </div>

              {/* Estado vazio */}
              {!loading && animes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-12 h-12 text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-400 mb-4">Tente ajustar seus filtros de busca</p>
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters} 
                      className="text-primary hover:underline font-medium"
                    >
                      Limpar todos os filtros
                    </button>
                  )}
                </div>
              )}

              {/* Sentinela para scroll infinito */}
              <div ref={sentinelRef} className="h-10 mt-8" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}