import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AnimeCard } from '@/components/ui/AnimeCard';
import { AnimeListItem } from '@/components/ui/AnimeListItem';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Filter, SlidersHorizontal, ChevronDown, Search, X, Trash2, Calendar, MonitorPlay, Sparkles, LayoutGrid, List } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const GENRES = [
  { id: 1, name: 'Ação' },
  { id: 2, name: 'Aventura' },
  { id: 4, name: 'Comédia' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasia' },
  { id: 14, name: 'Terror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 7, name: 'Mistério' },
  { id: 40, name: 'Psicológico' },
  { id: 18, name: 'Mecha' },
  { id: 19, name: 'Musical' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Sobrenatural' },
  { id: 30, name: 'Esportes' },
  { id: 41, name: 'Suspense' },
  { id: 23, name: 'Escolar' },
  { id: 42, name: 'Seinen' },
  { id: 27, name: 'Shounen' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export function Catalog() {
  const { animes, loading, loadMore, hasMore, filters, updateFilter, clearFilters } = useCatalog();
  const sentinelRef = useRef(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();
  const [luckyLoading, setLuckyLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('anime_catalog_view_mode');
    return saved || 'grid';
  });

  // Salva ViewMode
  useEffect(() => {
    localStorage.setItem('anime_catalog_view_mode', viewMode);
  }, [viewMode]);

  usePageTitle('Catálogo');

  const handleLuckyParams = async () => {
    try {
      setLuckyLoading(true);
      // Delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await fetch('https://api.jikan.moe/v4/random/anime');
      if (!response.ok) throw new Error('Erro ao buscar anime aleatório');

      const data = await response.json();
      const randomAnimeId = data.data.mal_id;

      navigate(`/anime/${randomAnimeId}`);
    } catch (error) {
      console.error("Erro no 'Estou com sorte':", error);
      setLuckyLoading(false);
    }
  };

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

  const hasActiveFilters = filters.q || filters.status || filters.genres.length > 0 || filters.year || filters.season || filters.type;
  const skeletonCount = animes.length === 0 ? 12 : 4;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary font-sans">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-surface-dark scrollbar-track-bg-primary">
        <Header />

        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">

          <div className="mb-8 border-b border-border-color pb-6">
            <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tight">Catálogo</h1>
            <p className="text-lg text-text-secondary">Descubra, filtre e encontre seus animes favoritos.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* --- SIDEBAR DE FILTROS --- */}
            <aside className={clsx(
              "lg:w-72 flex-shrink-0 space-y-8",
              showMobileFilters ? "fixed inset-0 z-50 bg-bg-secondary p-6 overflow-y-auto" : "hidden lg:block"
            )}>
              <div className="flex items-center justify-between lg:hidden mb-6 border-b border-border-color pb-4">
                <h2 className="text-2xl font-bold text-text-primary">Filtros</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-bg-tertiary rounded-full text-text-primary"><X /></button>
              </div>

              {/* Busca - VISIBILIDADE MELHORADA */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-button-accent" /> Pesquisar
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.q}
                    placeholder="Ex: Naruto, Bleach..."
                    className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-4 py-3 text-base text-text-primary focus:outline-none focus:border-button-accent focus:ring-4 focus:ring-button-accent/10 transition-all placeholder-text-secondary/60"
                    onChange={(e) => updateFilter('q', e.target.value)}
                  />
                  {filters.q && (
                    <button onClick={() => updateFilter('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Ano e Temporada e Formato */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">  <Calendar className="w-3.5 h-3.5 text-button-accent" /> Ano </h3>
                  <select
                    value={filters.year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-2 py-2.5 text-sm text-text-primary focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Todos</option>
                    {Array.from({ length: 45 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2"> Temp. </h3>
                  <select
                    value={filters.season}
                    onChange={(e) => updateFilter('season', e.target.value)}
                    className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-2 py-2.5 text-sm text-text-primary focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Todas</option>
                    <option value="winter">Inverno</option>
                    <option value="spring">Primavera</option>
                    <option value="summer">Verão</option>
                    <option value="fall">Outono</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2"> <MonitorPlay className="w-3.5 h-3.5 text-button-accent" /> Formato </h3>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/10 transition-all cursor-pointer"
                >
                  <option value="">Todos os formatos</option>
                  <option value="tv">TV (Séries)</option>
                  <option value="movie">Filmes</option>
                  <option value="ova">OVAs</option>
                  <option value="special">Especiais</option>
                  <option value="ona">ONAs (Internet)</option>
                  <option value="music">Musical</option>
                </select>
              </div>

              {/* Status - MAIS NÍTIDO */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-button-accent" /> Status
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { val: 'airing', label: 'Em Lançamento', color: 'bg-green-500' },
                    { val: 'complete', label: 'Completo', color: 'bg-blue-500' },
                    { val: 'upcoming', label: 'Em Breve', color: 'bg-purple-500' }
                  ].map((item) => (
                    <motion.div
                      key={item.val}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusToggle(item.val)}
                      className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors border-2
                            ${filters.status === item.val
                          ? 'bg-bg-secondary border-button-accent text-text-primary shadow-lg shadow-button-accent/10'
                          : 'bg-bg-secondary/50 border-transparent hover:bg-bg-secondary hover:border-border-color text-text-secondary hover:text-text-primary'}
                        `}
                    >
                      <div className={`w-3 h-3 rounded-full ${filters.status === item.val ? item.color : 'bg-gray-600'}`} />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-4 h-4 text-button-accent" /> Gêneros
                  </h3>
                  {filters.genres.length > 0 && (
                    <span className="text-xs bg-button-accent text-text-on-primary font-bold px-2 py-0.5 rounded-full">{filters.genres.length}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const isSelected = filters.genres.includes(g.id);
                    return (
                      <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGenreToggle(g.id)}
                        className={`
                            text-sm px-4 py-2 rounded-lg border transition-colors font-medium
                            ${isSelected
                            ? 'bg-button-accent border-button-accent text-text-on-primary shadow-md shadow-button-accent/20'
                            : 'bg-bg-secondary border-border-color text-text-secondary hover:border-border-color/80 hover:text-text-primary hover:bg-bg-tertiary'}
                        `}
                      >
                        {g.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Estou com Sorte */}
              <motion.button
                onClick={handleLuckyParams}
                disabled={luckyLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 transition-all text-sm font-bold uppercase tracking-wider relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Sparkles className={`w-4 h-4 ${luckyLoading ? 'animate-spin' : ''}`} />
                {luckyLoading ? 'Sorteando...' : 'Estou com Sorte'}
              </motion.button>

              {/* Botão Limpar */}
              {hasActiveFilters && (
                <motion.button
                  onClick={clearFilters}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-bold uppercase tracking-wider"
                >
                  <Trash2 className="w-4 h-4" /> Limpar Filtros
                </motion.button>
              )}

            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <div className="flex-1 min-w-0">

              {/* Barra Superior - MELHOR CONTRASTE */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 bg-bg-secondary border border-border-color rounded-2xl shadow-xl shadow-shadow-color/10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden p-2.5 bg-button-accent text-text-on-primary rounded-lg shadow-lg shadow-button-accent/20"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <span className="text-base text-text-secondary">
                    Encontrados: <strong className="text-text-primary text-lg">{animes.length}</strong> animes
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">

                  {/* View Mode Toggles */}
                  <div className="flex bg-bg-tertiary rounded-xl p-1 border border-border-color relative">
                    <motion.button
                      onClick={() => setViewMode('grid')}
                      className={`relative z-10 p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-button-accent' : 'text-text-secondary hover:text-text-primary'}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <LayoutGrid className="w-5 h-5" />
                      {viewMode === 'grid' && (
                        <motion.div
                          layoutId="viewModeBg"
                          className="absolute inset-0 bg-bg-secondary rounded-lg shadow-sm border border-border-color/50 -z-10"
                        />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => setViewMode('list')}
                      className={`relative z-10 p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'text-button-accent' : 'text-text-secondary hover:text-text-primary'}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <List className="w-5 h-5" />
                      {viewMode === 'list' && (
                        <motion.div
                          layoutId="viewModeBg"
                          className="absolute inset-0 bg-bg-secondary rounded-lg shadow-sm border border-border-color/50 -z-10"
                        />
                      )}
                    </motion.button>
                  </div>

                  <span className="text-sm font-medium text-text-secondary hidden sm:inline whitespace-nowrap pl-2 border-l border-border-color">Ordenar por:</span>
                  <div className="relative group w-full sm:w-auto">
                    <select
                      className="w-full sm:w-auto appearance-none bg-bg-tertiary border-2 border-border-color text-text-primary pl-4 pr-12 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/20 cursor-pointer hover:bg-bg-secondary transition-colors"
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
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid / List */}
              <motion.div
                className={viewMode === 'grid'
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  : "flex flex-col gap-4"
                }
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={`${viewMode}-${JSON.stringify(filters)}-${animes.length > 0}`} // Re-renders on data load
              >
                <AnimatePresence mode="popLayout">
                  {animes.map((anime) => (
                    <motion.div
                      key={`${anime.id}-${filters.orderBy}`}
                      variants={itemVariants}
                      layout
                    >
                      {viewMode === 'grid' ? (
                        <AnimeCard
                          key={`${anime.id}-${filters.orderBy}-card`}
                          {...anime}
                        />
                      ) : (
                        <AnimeListItem
                          key={`${anime.id}-${filters.orderBy}-list`}
                          {...anime}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && Array.from({ length: skeletonCount }).map((_, i) => (
                  <motion.div key={`skeleton-${i}`} variants={itemVariants}>
                    {viewMode === 'grid' ? <SkeletonCard /> : <div className="h-48 bg-bg-secondary rounded-xl animate-pulse" />}
                  </motion.div>
                ))}
              </motion.div>

              {!loading && animes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Search className="w-10 h-10 text-text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-text-secondary mb-6">Tente usar outros termos ou limpe os filtros.</p>
                  <motion.button
                    onClick={clearFilters}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-button-accent hover:bg-button-accent/90 text-text-on-primary rounded-xl font-bold transition-all shadow-lg shadow-button-accent/20"
                  >
                    Limpar todos os filtros
                  </motion.button>
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