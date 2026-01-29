import { useState, useEffect, useCallback } from 'react';

// Hook de Debounce Interno
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function useCatalog() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('anime_catalog_filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao ler filtros do catálogo", e);
      }
    }
    return {
      q: '',
      genres: [],
      orderBy: 'ranking',
      status: '',
      year: '',
      season: '',
      type: '',
    };
  });

  // Debounce dos filtros para evitar chamadas excessivas
  const debouncedFilters = useDebounce(filters, 600);

  // Salva filtros no localStorage
  useEffect(() => {
    localStorage.setItem('anime_catalog_filters', JSON.stringify(filters));
  }, [filters]);

  const clearFilters = useCallback(() => {
    // Apenas reseta o estado local, o useEffect reagirá
    setPage(1);
    setHasMore(true);
    setFilters({ q: '', genres: [], orderBy: 'ranking', status: '', year: '', season: '', type: '' });
  }, []);

  const updateFilter = (key, value) => {
    // Apenas atualiza estado. Sem setLoading(true) aqui para evitar flash imediato.
    setPage(1);
    setHasMore(true);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchCatalog() {
      try {
        setLoading(true);

        // Se mudou filtros e estamos na página 1, talvez queiramos limpar lista anterior 
        // para dar feedback visual? Se não limpar, mantemos lista antiga até a nova chegar (melhor UX)
        // Mas se a nova busca for muito diferente, pode confundir.
        // Vamos manter a lista antiga enquanto carrega (Loading overlay deve cuidar da UX visual)

        const params = new URLSearchParams({ page: page, limit: 24, sfw: true });
        let endpoint = 'https://api.jikan.moe/v4/anime';

        // Usamos debouncedFilters aqui
        const currentFilters = debouncedFilters;

        const hasTextOrGenre = currentFilters.q !== '' || currentFilters.genres.length > 0;
        const hasAdvancedFilters = currentFilters.year || currentFilters.season || currentFilters.type;
        const isRankingMode = ['ranking', 'score'].includes(currentFilters.orderBy);

        // LÓGICA DE ENDPOINT
        if (!hasTextOrGenre && !currentFilters.status && !hasAdvancedFilters && (isRankingMode || currentFilters.orderBy === 'popularity' || currentFilters.orderBy === 'favorites')) {
          endpoint = 'https://api.jikan.moe/v4/top/anime';
          if (currentFilters.orderBy === 'popularity') params.append('filter', 'bypopularity');
          if (currentFilters.orderBy === 'favorites') params.append('filter', 'favorite');
        } else {
          endpoint = 'https://api.jikan.moe/v4/anime';
          if (currentFilters.q) params.append('q', currentFilters.q);
          if (currentFilters.status) params.append('status', currentFilters.status);
          if (currentFilters.genres.length > 0) params.append('genres', currentFilters.genres.join(','));
          if (currentFilters.type) params.append('type', currentFilters.type);

          // Lógica de Ano e Temporada
          if (currentFilters.year) {
            let start = `${currentFilters.year}-01-01`;
            let end = `${currentFilters.year}-12-31`;

            if (currentFilters.season) {
              switch (currentFilters.season) {
                case 'winter':
                  start = `${currentFilters.year}-01-01`;
                  end = `${currentFilters.year}-03-31`;
                  break;
                case 'spring':
                  start = `${currentFilters.year}-04-01`;
                  end = `${currentFilters.year}-06-30`;
                  break;
                case 'summer':
                  start = `${currentFilters.year}-07-01`;
                  end = `${currentFilters.year}-09-30`;
                  break;
                case 'fall':
                  start = `${currentFilters.year}-10-01`;
                  end = `${currentFilters.year}-12-31`;
                  break;
              }
            }
            params.append('start_date', start);
            params.append('end_date', end);
          }

          switch (currentFilters.orderBy) {
            case 'ranking':
            case 'score':
              params.append('order_by', 'score');
              params.append('sort', 'desc');
              break;
            case 'popularity':
              params.append('order_by', 'members');
              params.append('sort', 'desc');
              break;
            case 'favorites':
              params.append('order_by', 'favorites');
              params.append('sort', 'desc');
              break;
            case 'newest':
              params.append('order_by', 'start_date');
              params.append('sort', 'desc');
              break;
            case 'oldest':
              params.append('order_by', 'start_date');
              params.append('sort', 'asc');
              break;
            case 'az':
              params.append('order_by', 'title');
              params.append('sort', 'asc');
              break;
            case 'za':
              params.append('order_by', 'title');
              params.append('sort', 'desc');
              break;
            default:
              params.append('order_by', 'score');
              params.append('sort', 'desc');
          }
        }

        const response = await fetch(`${endpoint}?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const json = await response.json();
        if (!isMounted) return;

        const data = json.data || [];
        const pagination = json.pagination || {};

        const newAnimes = data.map(anime => ({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          score: anime.score || 'N/A',
          genres: anime.genres ? anime.genres.map(g => g.name).slice(0, 2).join(', ') : '',
          synopsis: anime.synopsis,
          status: anime.status,
          members: anime.members,
          year: anime.year || anime.aired?.prop?.from?.year,
          episodes: anime.episodes,
          type: anime.type
        }));

        setAnimes(prev => {
          if (page === 1) return newAnimes;

          // Filtro para evitar duplicatas
          const combined = [...prev, ...newAnimes];
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          return unique;
        });

        setHasMore(pagination.has_next_page || (data.length > 0 && data.length >= 24));

      } catch (error) {
        if (error.name !== 'AbortError') console.error("Erro fetch:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCatalog();

    return () => { isMounted = false; controller.abort(); };
  }, [page, debouncedFilters]); // Agora depende de debouncedFilters

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage(prev => prev + 1);
  }, [loading, hasMore]);

  return { animes, loading, loadMore, hasMore, filters, updateFilter, clearFilters };
}