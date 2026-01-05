import { useState, useEffect } from 'react';

const transformData = (anime) => ({
  id: anime.mal_id,
  title: anime.title_english || anime.title,
  image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url, 
  year: anime.year || anime.aired?.prop?.from?.year || '2024',
  score: anime.score || 'N/A',
  isNew: anime.airing || anime.year >= 2023, 
  genres: (anime.genres || []).map(g => g.name).slice(0, 3),
  synopsis: anime.synopsis ? anime.synopsis : "Sinopse indisponível.",
  trailerUrl: anime.trailer?.url 
});

export function useJikan() {
  const [heroAnime, setHeroAnime] = useState(null);
  const [popularAnimes, setPopularAnimes] = useState([]);
  const [seasonalAnimes, setSeasonalAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Pequeno delay para evitar erro 429 da API
        await new Promise(resolve => setTimeout(resolve, 500));

        const [popResponse, seasonResponse] = await Promise.all([
                    fetch("https://api.jikan.moe/v4/top/anime?limit=25"),
                    fetch("https://api.jikan.moe/v4/seasons/now?limit=25")
                  ]);

        if (!popResponse.ok || !seasonResponse.ok) {
           throw new Error("Erro na API.");
        }

        const popJson = await popResponse.json();
        const seasonJson = await seasonResponse.json();
        
        const removeDuplicates = (list) => {
            const seen = new Set();
            return list.filter(item => {
                const duplicate = seen.has(item.id);
                seen.add(item.id);
                return !duplicate;
            });
        };

        if (popJson.data) {
            const formattedPop = popJson.data.map(transformData);
            setHeroAnime(formattedPop[0]);
            setPopularAnimes(removeDuplicates(formattedPop.slice(1))); 
        }

        if (seasonJson.data) {
            const formattedSeason = seasonJson.data.map(transformData);
            setSeasonalAnimes(removeDuplicates(formattedSeason)); 
        }

      } catch (error) {
        console.error("Erro useJikan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { heroAnime, popularAnimes, seasonalAnimes, loading };
}