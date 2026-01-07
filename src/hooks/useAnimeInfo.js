import { useState, useEffect } from 'react';

export function useAnimeInfo(id) {
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]); // Novo estado para personagens
  const [recommendations, setRecommendations] = useState([]); // Novo estado para recomendações
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        
        // Pequeno delay para evitar erro 429 da API (Muitas requisições)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Buscamos TUDO em paralelo: Detalhes, Personagens e Recomendações
        const [animeRes, charRes, recRes] = await Promise.all([
            fetch(`https://api.jikan.moe/v4/anime/${id}/full`),
            fetch(`https://api.jikan.moe/v4/anime/${id}/characters`),
            fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`)
        ]);

        const animeJson = await animeRes.json();
        const charJson = await charRes.json();
        const recJson = await recRes.json();
        
        const data = animeJson.data;

        // Formatação dos dados principais
        const formattedAnime = {
          id: data.mal_id,
          title: data.title_english || data.title,
          title_jp: data.title_japanese,
          // Fallback inteligente para imagem de alta resolução
          image: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
          // Tenta pegar a imagem máxima do trailer para o Hero, senão usa a imagem normal
          banner: data.trailer?.images?.maximum_image_url || data.images?.jpg?.large_image_url, 
          trailer: data.trailer?.embed_url,
          synopsis: data.synopsis,
          year: data.year || data.aired?.prop?.from?.year || '?',
          score: data.score,
          episodes: data.episodes || '?',
          duration: data.duration || '24 min',
          rating: data.rating,
          status: data.status,
          studios: data.studios, // Passamos o array original para tratar no componente
          genres: data.genres,
          rank: data.rank,
          season: data.season,
          source: data.source,
          type: data.type,
          members: data.members,
          aired: data.aired
        };

        setAnime(formattedAnime);
        setCharacters(charJson.data || []);       // Salva os personagens
        setRecommendations(recJson.data || []);   // Salva as recomendações

      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id]);

  // Agora retornamos tudo o que a página pede
  return { anime, characters, recommendations, loading };
}