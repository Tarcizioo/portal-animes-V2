import { useQuery } from '@tanstack/react-query';

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

const fetchSeasonal = async () => {
  const response = await fetch("https://api.jikan.moe/v4/seasons/now?limit=25");
  if (!response.ok) throw new Error("Erro na API Seasonal");
  const json = await response.json();
  return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

export function useJikan() {
  const popularQuery = useQuery({
    queryKey: ['popular-anime'],
    queryFn: fetchPopular,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const seasonalQuery = useQuery({
    queryKey: ['seasonal-anime'],
    queryFn: fetchSeasonal,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const heroAnime = popularQuery.data ? popularQuery.data[0] : null;
  const popularAnimes = popularQuery.data ? popularQuery.data.slice(1) : [];
  const seasonalAnimes = seasonalQuery.data || [];

  const loading = popularQuery.isLoading || seasonalQuery.isLoading;

  return { heroAnime, popularAnimes, seasonalAnimes, loading };
}