import { useState, useEffect } from 'react';

export function useCatalog() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null); // Novo estado

  useEffect(() => {
    // AbortController para cancelar requisições ao sair da tela
    const controller = new AbortController();

    async function fetchCatalog() {
      // Se já deu erro antes, não tente buscar mais automaticamente (previne loop)
      if (error) return; 

      try {
        setLoading(true);
        const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=24`, {
            signal: controller.signal
        });
        
        if (!response.ok) {
            // Se for erro 429 (Muitas requisições), trate diferente se quiser
            throw new Error(`Erro API: ${response.status}`);
        }

        const json = await response.json();
        
        const newAnimes = json.data.map(anime => ({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images.jpg.large_image_url,
          score: anime.score || 'N/A',
          genres: anime.genres.map(g => g.name).slice(0, 2).join(', ')
        }));

        setAnimes(prev => {
            const combined = [...prev, ...newAnimes];
            // Remove duplicatas
            return Array.from(new Map(combined.map(item => [item.id, item])).values());
        });

        if (newAnimes.length < 24) setHasMore(false);

      } catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Erro ao buscar catálogo:", err);
            setError(true); // Trava novas requisições automáticas
            setHasMore(false); // Para o scroll infinito temporariamente
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchCatalog();

    return () => controller.abort();
  }, [page]); // Removemos 'error' da dependência para não loopar

  const loadMore = () => {
      // Função para tentar novamente ou carregar próxima página
      if (!loading && hasMore) {
          setError(null); // Reseta erro ao tentar carregar mais
          setPage(prev => prev + 1);
      }
  };

  return { animes, loading, loadMore, hasMore, error };
}