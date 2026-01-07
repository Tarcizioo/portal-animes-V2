import { useState, useEffect, useCallback } from 'react';

export function useCatalog() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    q: '',
    genres: [],
    orderBy: 'ranking', 
    status: '',
  });

  // --- AQUI ESTÁ A MÁGICA PARA EVITAR O BUG ---
  // Limpamos os animes IMEDIATAMENTE ao chamar essa função.
  const clearFilters = useCallback(() => {
    setAnimes([]);      // Limpa a tela na hora
    setLoading(true);   // Força o esqueleto aparecer
    setPage(1);
    setHasMore(true);
    setFilters({ q: '', genres: [], orderBy: 'ranking', status: '' });
  }, []);

  const updateFilter = (key, value) => {
    setAnimes([]);      // Limpa a tela na hora
    setLoading(true);   // Força o esqueleto aparecer
    setPage(1);
    setHasMore(true);
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  // ---------------------------------------------

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchCatalog() {
      try {
        setLoading(true);
        
        // Delay para evitar bloqueio da API (429)
        await new Promise(resolve => setTimeout(resolve, 600));

        const params = new URLSearchParams({ page: page, limit: 24, sfw: false });
        let endpoint = 'https://api.jikan.moe/v4/anime';

        const hasTextOrGenre = filters.q !== '' || filters.genres.length > 0;
        const isRankingMode = ['ranking', 'score'].includes(filters.orderBy);

        // LÓGICA DE ENDPOINT
        if (!hasTextOrGenre && !filters.status && (isRankingMode || filters.orderBy === 'popularity' || filters.orderBy === 'favorites')) {
            endpoint = 'https://api.jikan.moe/v4/top/anime';
            if (filters.orderBy === 'popularity') params.append('filter', 'bypopularity');
            if (filters.orderBy === 'favorites') params.append('filter', 'favorite');
        } else {
            endpoint = 'https://api.jikan.moe/v4/anime';
            if (filters.q) params.append('q', filters.q);
            if (filters.status) params.append('status', filters.status);
            if (filters.genres.length > 0) params.append('genres', filters.genres.join(','));

            switch (filters.orderBy) {
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
          genres: anime.genres ? anime.genres.map(g => g.name).slice(0, 2).join(', ') : ''
        }));

        setAnimes(prev => {
            // Se for página 1, substitui tudo. Se for scroll infinito, adiciona.
            if (page === 1) return newAnimes;
            
            // Filtro extra de segurança para evitar duplicatas visuais
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
  }, [page, filters]); 

  const loadMore = useCallback(() => {
      if (!loading && hasMore) setPage(prev => prev + 1);
  }, [loading, hasMore]);

  return { animes, loading, loadMore, hasMore, filters, updateFilter, clearFilters };
}