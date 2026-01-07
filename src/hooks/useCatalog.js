import { useState, useEffect } from 'react';

export function useCatalog() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let isMounted = true; // Evita atualizar estado se o componente desmontar

    async function fetchCatalog() {
      try {
        setLoading(true);
        
        // Delay de segurança para evitar erro 429 (Too Many Requests) da API Jikan
        await new Promise(resolve => setTimeout(resolve, 600));

        const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=24`);
        
        // Se der erro na API (ex: 429 ou 500), lançamos erro para cair no catch
        if (!response.ok) {
           throw new Error(`Erro API: ${response.status}`);
        }

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
            const combined = [...prev, ...newAnimes];
            // Remove duplicatas por ID
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            return unique;
        });

        if (pagination.has_next_page !== undefined) {
            setHasMore(pagination.has_next_page);
        } else {
            // Fallback: se vier menos itens que o limite, acabou.
            setHasMore(data.length >= 24);
        }

      } catch (error) {
        console.error("Erro ao buscar catálogo:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCatalog();

    return () => { isMounted = false; };
  }, [page]);

  const loadMore = () => {
      // Só carrega mais se não estiver carregando e se a API disse que tem mais
      if (!loading && hasMore) {
          setPage(prev => prev + 1);
      }
  };

  return { animes, loading, loadMore, hasMore };
}