import { useQuery } from '@tanstack/react-query';

const currentYear = new Date().getFullYear();

const transformData = (anime) => ({
  id: anime.mal_id,
  title: anime.title_english || anime.title,
  image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
  smallImage: anime.images?.webp?.image_url || anime.images?.jpg?.image_url,
  images: anime.images, // Preserving full object for component flexibility
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

const fetchTopPeople = async () => {
  const response = await fetch("https://api.jikan.moe/v4/top/people?limit=25");
  if (!response.ok) throw new Error("Erro na API Top People");
  const json = await response.json();
  return json.data || [];
};

const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url);
    if (response.status !== 429) {
      return response;
    }
    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
  }
  return fetch(url); // Final attempt
};

const fetchPersonFull = async (id) => {
  // Fetch details first (critical)
  const detailsRes = await fetchWithRetry(`https://api.jikan.moe/v4/people/${id}`);
  if (!detailsRes.ok) throw new Error("Erro ao buscar detalhes da pessoa");
  const detailsJson = await detailsRes.json();

  // Fetch optional data in parallel, allowing failures
  const [voicesRes, picturesRes] = await Promise.allSettled([
    fetchWithRetry(`https://api.jikan.moe/v4/people/${id}/voices`, 2),
    fetchWithRetry(`https://api.jikan.moe/v4/people/${id}/pictures`, 2)
  ]);

  const voicesJson = voicesRes.status === 'fulfilled' && voicesRes.value.ok ? await voicesRes.value.json() : { data: [] };
  const picturesJson = picturesRes.status === 'fulfilled' && picturesRes.value.ok ? await picturesRes.value.json() : { data: [] };

  return {
    person: detailsJson.data,
    voices: voicesJson.data || [],
    pictures: picturesJson.data || []
  };
};

export function usePersonInfo(id) {
  const query = useQuery({
    queryKey: ['person-info', id],
    queryFn: () => fetchPersonFull(id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!id,
  });

  return {
    person: query.data?.person,
    voices: query.data?.voices || [],
    pictures: query.data?.pictures || [],
    loading: query.isLoading,
    error: query.error
  };
}

export function useTopPeople() {
  return useQuery({
    queryKey: ['top-people'],
    queryFn: fetchTopPeople,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 24,
  });
}

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

const fetchCharacterFull = async (id) => {
  // Fetch details first (critical)
  const detailsRes = await fetchWithRetry(`https://api.jikan.moe/v4/characters/${id}/full`);
  if (!detailsRes.ok) throw new Error("Erro ao buscar detalhes do personagem");
  const detailsJson = await detailsRes.json();

  // Fetch optional data in parallel
  const [animeRes, voiceRes, picturesRes] = await Promise.allSettled([
    fetchWithRetry(`https://api.jikan.moe/v4/characters/${id}/anime`, 2),
    fetchWithRetry(`https://api.jikan.moe/v4/characters/${id}/voices`, 2),
    fetchWithRetry(`https://api.jikan.moe/v4/characters/${id}/pictures`, 2)
  ]);

  const animeJson = animeRes.status === 'fulfilled' && animeRes.value.ok ? await animeRes.value.json() : { data: [] };
  const voiceJson = voiceRes.status === 'fulfilled' && voiceRes.value.ok ? await voiceRes.value.json() : { data: [] };
  const picturesJson = picturesRes.status === 'fulfilled' && picturesRes.value.ok ? await picturesRes.value.json() : { data: [] };

  return {
    character: detailsJson.data,
    animeography: animeJson.data || [],
    voiceActors: voiceJson.data || [],
    pictures: picturesJson.data || []
  };
};

export function useCharacterInfo(id) {
  const query = useQuery({
    queryKey: ['character-info', id],
    queryFn: () => fetchCharacterFull(id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!id,
  });

  return {
    character: query.data?.character,
    animeography: query.data?.animeography || [],
    voiceActors: query.data?.voiceActors || [],
    pictures: query.data?.pictures || [],
    loading: query.isLoading,
    error: query.error
  };
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
    queryKey: ['featured-anime-v5'],
    queryFn: async () => {
      // Fetch more items to ensure we can find unique ones
      const [topRes, popRes, favRes, seasonalRes] = await Promise.all([
        fetch("https://api.jikan.moe/v4/top/anime?limit=20"), 
        fetch("https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=20"), 
        fetch("https://api.jikan.moe/v4/top/anime?filter=favorite&limit=20"), 
        fetch("https://api.jikan.moe/v4/seasons/now?limit=20") 
      ]);

      const [topJson, popJson, favJson, seasonalJson] = await Promise.all([
        topRes.json(),
        popRes.json(),
        favRes.json(),
        seasonalRes.json()
      ]);

      const seenIds = new Set();
      const finalHeroList = [];

      // Helper to pick unused anime
      const pickUnused = (list, label, color, iconType) => {
        const candidate = list.find(a => !seenIds.has(a.mal_id));
        if (candidate) {
          seenIds.add(candidate.mal_id);
          const transformed = transformData(candidate);
          return { ...transformed, heroLabel: label, heroColor: color, heroIcon: iconType };
        }
        return null;
      };

      // Helper to process each category with fallback
      const processCategory = (list, label, color, iconType, fallbackIdPrefix) => {
        let selected = pickUnused(list, label, color, iconType);
        
        // Fallback: If no unique item found, force the first item with a unique ID
        if (!selected && list.length > 0) {
           const fallback = list[0];
           const transformed = transformData(fallback);
           selected = {
             ...transformed,
             uniqueId: `${fallbackIdPrefix}-${fallback.mal_id}`,
             heroLabel: label,
             heroColor: color,
             heroIcon: iconType
           };
        }
        return selected;
      };

      // 1. Top Ranking
      const topAnime = processCategory(topJson.data || [], "Top Ranking", "text-yellow-400", "Award", "top");
      if (topAnime) finalHeroList.push(topAnime);

      // 2. Mais Popular
      const popAnime = processCategory(popJson.data || [], "Mais Popular", "text-blue-400", "TrendingUp", "pop");
      if (popAnime) finalHeroList.push(popAnime);

      // 3. Favorito dos Fãs
      const favAnime = processCategory(favJson.data || [], "Favorito dos Fãs", "text-red-400", "Heart", "fav");
      if (favAnime) finalHeroList.push(favAnime);

      // 4. Destaque da Temporada
      const seasonalAnime = processCategory(seasonalJson.data || [], "Destaque da Temporada", "text-green-400", "Calendar", "seasonal");
      if (seasonalAnime) finalHeroList.push(seasonalAnime);

      console.log("Featured Hero List generated:", finalHeroList);

      return finalHeroList;
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