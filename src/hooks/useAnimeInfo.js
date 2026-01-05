import { useState, useEffect } from 'react';

export function useAnimeInfo(id) {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        // Busca os dados completos ("full") do anime
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
        const json = await response.json();
        
        const data = json.data;

        // Formata os dados para o design
        const formattedAnime = {
          id: data.mal_id,
          title: data.title_english || data.title,
          title_jp: data.title_japanese,
          image: data.images?.jpg?.large_image_url,
          trailer: data.trailer?.embed_url, // Link do YouTube
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
        };

        setAnime(formattedAnime);
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id]);

  return { anime, loading };
}