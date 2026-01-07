import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AnimeCard } from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useCatalog } from '@/hooks/useCatalog';
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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) loadMore();
    }, { rootMargin: "200px" });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleStatusToggle = (statusValue) => {
    updateFilter('status', filters.status === statusValue ? '' : statusValue);
  };

  const handleGenreToggle = (genreId) => {
    const currentGenres = filters.genres;
    if (currentGenres.includes(genreId)) {
      updateFilter('genres', currentGenres.filter(id => id !== genreId));
    } else {
      updateFilter('genres', [...currentGenres, genreId]);
    }
  };

  const hasActiveFilters = filters.q || filters.status || filters.genres.length > 0;
  const skeletonCount = animes.length === 0 ? 12 : 4;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark dark text-white font-sans">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-background-dark">
        <Header />

        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">

          <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Catálogo</h1>
            <p className="text-lg text-gray-300">Descubra, filtre e encontre seus animes favoritos.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* --- SIDEBAR DE FILTROS --- */}
            <aside className={clsx(
              "lg:w-72 flex-shrink-0 space-y-8",
              showMobileFilters ? "fixed inset-0 z-50 bg-background-dark p-6 overflow-y-auto" : "hidden lg:block"
            )}>
              <div className="flex items-center justify-between lg:hidden mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Filtros</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-white/10 rounded-full text-white"><X /></button>
              </div>

              {/* Busca - VISIBILIDADE MELHORADA */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Pesquisar
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.q}
                    placeholder="Ex: Naruto, Bleach..."
                    className="w-full bg-surface-dark border-2 border-white/10 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-gray-500"
                    onChange={(e) => updateFilter('q', e.target.value)}
                  />
                  {filters.q && (
                    <button onClick={() => updateFilter('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status - MAIS NÍTIDO */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" /> Status
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { val: 'airing', label: 'Em Lançamento', color: 'bg-green-500' },
                    { val: 'complete', label: 'Completo', color: 'bg-blue-500' },
                    { val: 'upcoming', label: 'Em Breve', color: 'bg-purple-500' }
                  ].map((item) => (
                    <div
                      key={item.val}
                      onClick={() => handleStatusToggle(item.val)}
                      className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border-2
                            ${filters.status === item.val
                          ? 'bg-surface-dark border-primary text-white shadow-lg shadow-primary/10'
                          : 'bg-surface-dark/50 border-transparent hover:bg-surface-dark hover:border-white/20 text-gray-300 hover:text-white'}
                        `}
                    >
                      <div className={`w-3 h-3 rounded-full ${filters.status === item.val ? item.color : 'bg-gray-600'}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gêneros - BOTÕES MAIS CLAROS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" /> Gêneros
                  </h3>
                  {filters.genres.length > 0 && (
                    <span className="text-xs bg-primary text-white font-bold px-2 py-0.5 rounded-full">{filters.genres.length}</span>
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
                            text-sm px-4 py-2 rounded-lg border transition-all font-medium
                            ${isSelected
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                            : 'bg-surface-dark border-white/10 text-gray-300 hover:border-white/30 hover:text-white hover:bg-white/5'}
                        `}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Limpar - MAIS CHAMATIVO SE NECESSÁRIO */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-bold uppercase tracking-wider"
                >
                  <Trash2 className="w-4 h-4" /> Limpar Filtros
                </button>
              )}

            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <div className="flex-1 min-w-0">

              {/* Barra Superior - MELHOR CONTRASTE */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 bg-surface-dark border border-white/10 rounded-2xl shadow-xl shadow-black/20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden p-2.5 bg-primary text-white rounded-lg shadow-lg shadow-primary/20"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <span className="text-base text-gray-300">
                    Encontrados: <strong className="text-white text-lg">{animes.length}</strong> animes
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium text-gray-400 hidden sm:inline whitespace-nowrap">Ordenar por:</span>
                  <div className="relative group w-full sm:w-auto">
                    <select
                      className="w-full sm:w-auto appearance-none bg-black/20 border-2 border-white/10 text-white pl-4 pr-12 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-black/40 transition-all"
                      value={filters.orderBy}
                      onChange={(e) => updateFilter('orderBy', e.target.value)}
                    >
                      <optgroup label="Destaques">
                        <option value="ranking">🏆 Top Ranking (Geral)</option>
                        <option value="popularity">🔥 Mais Populares</option>
                        <option value="favorites">❤️ Mais Favoritados</option>
                      </optgroup>
                      <optgroup label="Outros">
                        <option value="score">⭐ Melhor Nota (Filtro)</option>
                        <option value="newest">📅 Lançamentos Recentes</option>
                        <option value="az">🔤 Ordem Alfabética (A-Z)</option>
                        <option value="za">🔤 Ordem Alfabética (Z-A)</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {animes.map((anime) => (
                  <AnimeCard
                    key={`${anime.id}-${filters.orderBy}`}
                    {...anime}
                  />
                ))}

                {loading && Array.from({ length: skeletonCount }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </div>

              {!loading && animes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-surface-dark rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Search className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-400 mb-6">Tente usar outros termos ou limpe os filtros.</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                  >
                    Limpar todos os filtros
                  </button>
                </div>
              )}

              <div ref={sentinelRef} className="h-10 mt-8" />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}