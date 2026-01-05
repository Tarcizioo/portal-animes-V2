import { useState, useEffect } from 'react';

export function useCatalog() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        // Busca os animes mais populares (paginados)
        const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=24`);
        const json = await response.json();
        
        const newAnimes = json.data.map(anime => ({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images.jpg.large_image_url,
          score: anime.score || 'N/A',
          genres: anime.genres.map(g => g.name).slice(0, 2).join(', ')
        }));

        // Adiciona os novos animes à lista antiga (evitando duplicatas)
        setAnimes(prev => {
            const combined = [...prev, ...newAnimes];
            // Truque do Set para remover duplicatas por ID
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            return unique;
        });

        // Se vier menos que 24 itens, acabou a lista
        if (newAnimes.length < 24) setHasMore(false);

      } catch (error) {
        console.error("Erro ao buscar catálogo:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [page]); // Roda toda vez que a 'page' muda

  const loadMore = () => setPage(prev => prev + 1);

  return { animes, loading, loadMore, hasMore };
}