import { useQuery } from '@tanstack/react-query';

async function fetchAnimeDetails(id) {
  // Helper de delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper para não quebrar tudo se uma request falhar
  const safeFetch = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) console.warn(`Rate limit hit for ${url}`);
        return { data: [] };
      }
      return await res.json();
    } catch (e) {
      console.warn(`Error fetching ${url}:`, e);
      return { data: [] };
    }
  };

  // 1. Core Details (Critical)
  const animeRes = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  if (!animeRes.ok) {
    if (animeRes.status === 429) {
      throw new Error("Muitas requisições. Tente novamente em instantes.");
    }
    throw new Error(`Falha ao carregar anime: ${animeRes.status}`);
  }
  const animeJson = await animeRes.json();

  // 2. Characters (Wait to avoid 429)
  await delay(600);
  const charJson = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/characters`);

  // 3. Recommendations
  await delay(600);
  const recJson = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`);

  // 4. Episodes
  await delay(600);
  const epJson = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/episodes`);

  // 5. Staff
  await delay(600);
  const staffJson = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/staff`);

  const data = animeJson.data;

  const formattedAnime = {
    id: data.mal_id,
    title: data.title_english || data.title,
    title_jp: data.title_japanese,
    image: data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
    banner: data.trailer?.images?.maximum_image_url || data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url,
    trailer: data.trailer?.embed_url,
    synopsis: data.synopsis,
    year: data.year || data.aired?.prop?.from?.year || '?',
    score: data.score,
    episodes: data.episodes || '?',
    duration: data.duration || '24 min',
    rating: data.rating,
    status: data.status,
    studios: data.studios,
    genres: data.genres,
    themes: data.themes,
    demographics: data.demographics,
    rank: data.rank,
    season: data.season,
    source: data.source,
    type: data.type,
    members: data.members,
    aired: data.aired,
    episodesList: epJson.data || []
  };

  return {
    anime: formattedAnime,
    characters: charJson.data || [],
    recommendations: recJson.data || [],
    staff: staffJson.data || []
  };
}

export function useAnimeInfo(id) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeDetails(id),
    staleTime: 1000 * 60 * 60, // 1 hora de cache (evita chamadas repetidas)
    enabled: !!id,             // Só busca se tiver ID
    retry: 1,                  // Tenta apenas mais 1 vez se falhar
  });

  return {
    anime: data?.anime || null,
    characters: data?.characters || [],
    recommendations: data?.recommendations || [],
    staff: data?.staff || [],
    loading: isLoading,
    error
  };
}