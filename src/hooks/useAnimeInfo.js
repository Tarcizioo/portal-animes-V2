import { useState, useEffect } from 'react';

export function useAnimeInfo(id) {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController(); // Adicionado Cleanup

    async function fetchDetails() {
      try {
        setLoading(true);
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`, {
            signal: controller.signal
        });
        
        if (!response.ok) throw new Error("Erro API");

        const json = await response.json();
        const data = json.data;

        setAnime({
          id: data.mal_id,
          title: data.title_english || data.title,
          title_jp: data.title_japanese,
          image: data.images?.jpg?.large_image_url,
          // CORREÇÃO AQUI: Separar as URLs
          trailerUrl: data.trailer?.url,        // Link para o site do YouTube
          trailerEmbed: data.trailer?.embed_url,// Link para o Iframe
          synopsis: data.synopsis,
          year: data.year || data.aired?.prop?.from?.year || '?',
          score: data.score,
          episodes: data.episodes || '?',
          duration: data.duration || '24 min',
          rating: data.rating,
          status: data.status,
          studios: data.studios?.map(s => s.name).join(', ') || 'Desconhecido',
          genres: data.genres?.map(g => g.name) || [],
          rank: data.rank,
          season: data.season,
          source: data.source,
          type: data.type
        });

      } catch (error) {
        if (error.name !== 'AbortError') {
            console.error("Erro ao carregar detalhes:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchDetails();
    return () => controller.abort(); // Cleanup
  }, [id]);

  return { anime, loading };
} 