import { useQuery } from '@tanstack/react-query';

const currentYear = new Date().getFullYear();

const transformData = (anime) => ({
  id: anime.mal_id,
  title: anime.title_english || anime.title,
  image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
  year: anime.year || anime.aired?.prop?.from?.year || currentYear,
  score: anime.score || 'N/A',
  isNew: anime.airing || (anime.year >= currentYear - 1),
  genres: (anime.genres || []).map(g => g.name).slice(0, 3),
  synopsis: anime.synopsis ? anime.synopsis : "Sinopse indisponível.",
  trailerUrl: anime.trailer?.url
});

const removeDuplicates = (list) => {
  const seen = new Set();
  return list.filter(item => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};

const fetchPopular = async () => {
  const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=25");
  if (!response.ok) throw new Error("Erro na API Popular");
  const json = await response.json();
  return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

const fetchByGenre = async (genreId) => {
  const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&limit=25&order_by=score&sort=desc`);
  if (!response.ok) throw new Error(`Erro na API Genre ${genreId}`);
  const json = await response.json();
  return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

const fetchSeasonal = async () => {
  const response = await fetch("https://api.jikan.moe/v4/seasons/now?limit=25");
  if (!response.ok) throw new Error("Erro na API Seasonal");
  const json = await response.json();
  return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

const fetchTopCharacters = async () => {
  const response = await fetch("https://api.jikan.moe/v4/top/characters?limit=25");
  if (!response.ok) throw new Error("Erro na API Characters");
  const json = await response.json();
  return json.data || [];
};

export function useTopCharacters() {
  return useQuery({
    queryKey: ['top-characters'],
    queryFn: fetchTopCharacters,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useGenreAnime(genreId, enabled = false) {
  return useQuery({
    queryKey: ['genre', genreId],
    queryFn: () => fetchByGenre(genreId),
    staleTime: 1000 * 60 * 60,
    enabled: enabled,
  });
}

export function useJikan() {
  const popularQuery = useQuery({
    queryKey: ['popular-anime'],
    queryFn: fetchPopular,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const seasonalQuery = useQuery({
    queryKey: ['seasonal-anime'],
    queryFn: fetchSeasonal,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Query específica para o Carousel com diversidade
  const featuredQuery = useQuery({
    queryKey: ['featured-anime'],
    queryFn: async () => {

      const [topRes, popRes, favRes, seasonalRes] = await Promise.all([
        fetch("https://api.jikan.moe/v4/top/anime?limit=1"), // Top Rank
        fetch("https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=1"), // Mais Populares
        fetch("https://api.jikan.moe/v4/top/anime?filter=favorite&limit=1"), // Mais Favoritos
        fetch("https://api.jikan.moe/v4/seasons/now?limit=1") // Seasonal (moved to parallel)
      ]);

      const [topJson, popJson, favJson, seasonalJson] = await Promise.all([
        topRes.json(),
        popRes.json(),
        favRes.json(),
        seasonalRes.json()
      ]);

      let list = [
        ...(topJson.data || []),
        ...(popJson.data || []),
        ...(favJson.data || []),
        ...(seasonalJson.data || [])
      ];

      return removeDuplicates(list.map(transformData));
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const heroAnime = featuredQuery.data && featuredQuery.data.length > 0 ? featuredQuery.data[0] : null;
  const featuredAnimes = featuredQuery.data || [];

  const popularAnimes = popularQuery.data || [];
  const seasonalAnimes = seasonalQuery.data || [];

  const loading = popularQuery.isLoading || seasonalQuery.isLoading || featuredQuery.isLoading;

  return {
    heroAnime, // Mantendo para compatibilidade caso precise
    featuredAnimes,
    popularAnimes,
    seasonalAnimes,
    loading
  };
}