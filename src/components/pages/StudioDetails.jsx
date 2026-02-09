import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useFavoriteStudios } from '@/hooks/useFavoriteStudios'; // Import hook
import { AnimeCard } from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Loader } from '@/components/ui/Loader';
import { Monitor, Calendar, Globe, MapPin, ExternalLink, ChevronRight, Grid, List, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimeListItem } from '@/components/ui/AnimeListItem';

export function StudioDetails() {
  const { id } = useParams();
  const [studio, setStudio] = useState(null);
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isFavorite, toggleFavorite } = useFavoriteStudios(id); // Use hook

  // Filters & State
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('members');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  usePageTitle(studio?.titles?.[0]?.title || 'Estúdio');

  const fetchData = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);

      // 1. Fetch Studio Details (only if not loaded) & Anime in parallel if first page
      const promises = [];
      
      if (!studio && pageNum === 1) {
          promises.push(fetch(`https://api.jikan.moe/v4/producers/${id}`).then(res => res.json()));
      } else {
          promises.push(Promise.resolve(null));
      }

      // 2. Fetch Studio Animes with Filters
      let animeParams = `producers=${id}&sfw=true&page=${pageNum}`;

      // Sort logic
      if (sortBy === 'newest') animeParams += '&order_by=start_date&sort=desc';
      else if (sortBy === 'score') animeParams += '&order_by=score&sort=desc';
      else if (sortBy === 'popularity') animeParams += '&order_by=members&sort=desc';
      else if (sortBy === 'members') animeParams += '&order_by=members&sort=desc';

      // Type logic
      if (filterType !== 'all') animeParams += `&type=${filterType}`;

      promises.push(fetch(`https://api.jikan.moe/v4/anime?${animeParams}`).then(res => res.json()));

      const [studioData, animeData] = await Promise.all(promises);

      if (studioData) {
          if (!studioData.data) throw new Error('Estúdio não encontrado');
          setStudio(studioData.data);
      }


      
      const transformedAnimes = (animeData.data || []).map(anime => ({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
          smallImage: anime.images?.webp?.image_url || anime.images?.jpg?.image_url,
          score: anime.score || 'N/A',
          genres: anime.genres ? anime.genres.map(g => g.name).slice(0, 2).join(', ') : '',
          synopsis: anime.synopsis,
          type: anime.type,
          status: anime.status,
          episodes: anime.episodes,
          year: anime.year || anime.aired?.prop?.from?.year
      }));
      
      if (pageNum === 1) {
          setAnimes(transformedAnimes);
      } else {
          setAnimes(prev => [...prev, ...transformedAnimes]);
      }

      setHasMore(animeData.pagination?.has_next_page || false);
      setPage(pageNum);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [id, sortBy, filterType]);

  const loadMore = () => {
      if (!loadingMore && hasMore) {
          fetchData(page + 1);
      }
  };

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  if (error) {
    return (
      <div className="flex bg-bg-primary text-text-primary items-center justify-center h-screen flex-col gap-4">
        <h2 className="text-2xl font-bold">Estúdio não encontrado</h2>
        <Link to="/catalog" className="text-primary hover:underline">Voltar para o catálogo</Link>
      </div>
    );
  }

  const established = studio?.established ? new Date(studio.established).toLocaleDateString() : 'Desconhecido';
  const displayTitle = studio?.titles?.[0]?.title || studio?.title || 'Carregando...';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans pb-20 pt-24 px-6 md:px-12 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        {studio ? (
           <>
                <div className="w-full md:w-64 aspect-video md:aspect-square bg-white p-6 rounded-2xl flex items-center justify-center shadow-lg">
                    {studio.images?.jpg?.image_url ? (
                        <img src={studio.images.jpg.image_url} alt={displayTitle} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <Monitor className="w-20 h-20 text-gray-300" />
                    )}
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">{displayTitle}</h1>
                        <button
                            onClick={() => toggleFavorite(studio)}
                            className={`p-3 rounded-full border transition-all shadow-sm group ${
                                isFavorite 
                                ? 'bg-red-500 border-red-500 text-white' 
                                : 'bg-bg-secondary border-border-color text-text-secondary hover:border-red-500 hover:text-red-500'
                            }`}
                            title={isFavorite ? 'Deixar de seguir' : 'Seguir estúdio'}
                        >
                            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'group-hover:fill-current'}`} />
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                        {studio.established && (
                            <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-color">
                                <Calendar className="w-4 h-4 text-primary" /> Established: {established}
                            </div>
                        )}
                        {studio.count > 0 && (
                            <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-color">
                                <Monitor className="w-4 h-4 text-primary" /> {studio.count} Obras
                            </div>
                        )}
                        {studio.favorites > 0 && (
                            <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-color">
                                <MapPin className="w-4 h-4 text-primary" /> {studio.favorites} Favoritos
                            </div>
                        )}
                    </div>
                    
                    <p className="text-gray-400 max-w-2xl leading-relaxed">
                        {studio.about || `Conheça as produções do estúdio ${displayTitle}.`}
                    </p>

                    {studio.url && (
                        <a 
                            href={studio.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-bold transition-colors"
                        >
                            <Globe className="w-4 h-4" /> Perfil no MAL <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
           </>
        ) : (
            // Skeleton Header
             <>
                <div className="w-full md:w-64 aspect-video md:aspect-square bg-bg-secondary animate-pulse rounded-2xl border border-border-color" />
                <div className="space-y-4 flex-1 w-full">
                    <div className="h-10 md:h-14 w-3/4 bg-bg-secondary animate-pulse rounded-lg" />
                     <div className="flex gap-4">
                         <div className="h-8 w-24 bg-bg-secondary animate-pulse rounded-lg" />
                         <div className="h-8 w-24 bg-bg-secondary animate-pulse rounded-lg" />
                         <div className="h-8 w-24 bg-bg-secondary animate-pulse rounded-lg" />
                     </div>
                     <div className="h-24 w-full max-w-2xl bg-bg-secondary animate-pulse rounded-lg" />
                </div>
            </>
        )}
      </div>

      {/* Anime List Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 border-l-4 border-primary pl-4">
            Produções
        </h2>

        <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-bg-secondary border border-border-color text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            >
                <option value="all">Todos</option>
                <option value="tv">TV</option>
                <option value="movie">Filme</option>
                <option value="ova">OVA</option>
                <option value="ona">ONA</option>
                <option value="special">Especial</option>
            </select>

            {/* Sort Filter */}
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-bg-secondary border border-border-color text-text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            >
                <option value="members">Membros</option>
                <option value="score">Nota</option>
                <option value="newest">Mais Recentes</option>
                <option value="popularity">Popularidade</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-bg-secondary rounded-lg border border-border-color p-1">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
                    title="Grade"
                >
                    <Grid className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
                    title="Lista"
                >
                    <List className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      {/* Anime List Content */}
      <div className="min-h-[400px]">
        {loading && page === 1 ? (
             <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                : "grid grid-cols-1 gap-4"
           }>
                {[...Array(10)].map((_, i) => (
                     <SkeletonCard key={i} viewMode={viewMode} />
                ))}
           </div>
        ) : animes.length > 0 ? (
           <>
               <div className={viewMode === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                    : "grid grid-cols-1 gap-4"
               }>
                    {animes.map(anime => (
                        viewMode === 'grid' ? (
                            <AnimeCard key={anime.id} {...anime} image={anime.smallImage || anime.image} />
                        ) : (
                            <AnimeListItem key={anime.id} {...anime} image={anime.smallImage || anime.image} />
                        )
                    ))}
               </div>
               
               {/* Infinite Scroll Sentinel & Loader */}
               {(hasMore || loadingMore) && (
                   <div ref={observerTarget} className="mt-8 flex justify-center w-full py-8">
                       {loadingMore && <Loader />}
                   </div>
               )}
           </>
        ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-bg-secondary rounded-2xl border border-border-color border-dashed">
                <p className="text-text-secondary text-lg">Nenhum anime encontrado com esses filtros.</p>
                <button onClick={() => { setFilterType('all'); setSortBy('members'); }} className="mt-4 text-primary hover:underline">
                    Limpar Filtros
                </button>
            </div>
        )}
      </div>

    </div>
  );
}
