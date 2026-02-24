import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

async function fetchAnimeDetails(id) {
  // Use the built-in jikanApi wrapper which inherently handles backoffs and 429s
  const safeCall = async (apiFunc, ...args) => {
    try {
      const res = await apiFunc(...args);
      return { data: res?.data || [] };
    } catch (e) {
      console.warn(`Error in API call:`, e);
      return { data: [] };
    }
  };

  // 1. Core Details (Critical)
  let animeData;
  try {
      console.log(`[useAnimeInfo] Fetching core details for ID: ${id}...`);
      const response = await jikanApi.getAnimeFullById(id);
      animeData = response?.data;
      console.log(`[useAnimeInfo] Core details fetched successfully for ID: ${id}`);
  } catch (error) {
      console.error(`[useAnimeInfo] Error fetching core details for ID ${id}:`, error);
      throw new Error(`Falha ao carregar anime: ${error.message}`);
  }

  if (!animeData) {
      console.error(`[useAnimeInfo] animeData is null for ID: ${id}`);
      throw new Error("Anime não pôde ser resgatado da API.");
  }

  // 2. Sequentially fetch to avoid overwhelming Jikan (3 requests per sec limit)
  console.log(`[useAnimeInfo] Fetching characters for ID: ${id}...`);
  // Even though api.js has a retry, pacing it out improves UX and prevents long queue blocks
  await new Promise(r => setTimeout(r, 340));
  const charJson = await safeCall(jikanApi.getAnimeCharacters, id);
  console.log(`[useAnimeInfo] Characters fetched for ID: ${id}`);
  
  await new Promise(r => setTimeout(r, 340));
  console.log(`[useAnimeInfo] Fetching recommendations for ID: ${id}...`);
  const recJson = await safeCall(jikanApi.getAnimeRecommendations, id);
  console.log(`[useAnimeInfo] Recommendations fetched for ID: ${id}`);

  await new Promise(r => setTimeout(r, 340));
  console.log(`[useAnimeInfo] Fetching episodes for ID: ${id}...`);
  const epJson = await safeCall(jikanApi.getAnimeEpisodes, id);
  console.log(`[useAnimeInfo] Episodes fetched for ID: ${id}`);

  await new Promise(r => setTimeout(r, 340));
  console.log(`[useAnimeInfo] Fetching staff for ID: ${id}...`);
  const staffJson = await safeCall(jikanApi.getAnimeStaff, id);
  console.log(`[useAnimeInfo] Staff fetched for ID: ${id}`);

  const data = animeData;

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
    relations: data.relations || [],
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
  console.log(`[useAnimeInfo] Hook called with ID: ${id}`);
  const { data, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeDetails(id),
    staleTime: 1000 * 60 * 60, // 1 hora de cache (evita chamadas repetidas)
    enabled: !!id && id !== 'undefined',             // Só busca se tiver ID válido
    retry: 1,                  // Tenta apenas mais 1 vez se falhar
  });

  if (error) {
    console.error(`[useAnimeInfo] React Query Error for ID ${id}:`, error);
  }

  return {
    anime: data?.anime || null,
    characters: data?.characters || [],
    recommendations: data?.recommendations || [],
    staff: data?.staff || [],
    loading: isLoading,
    error
  };
}