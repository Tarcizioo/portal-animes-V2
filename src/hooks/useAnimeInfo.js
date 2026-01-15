import { useQuery } from '@tanstack/react-query';

async function fetchAnimeDetails(id) {
  // Pequeno delay preventivo apenas na primeira busca real
  await new Promise(resolve => setTimeout(resolve, 300));

  const [animeRes, charRes, recRes] = await Promise.all([
    fetch(`https://api.jikan.moe/v4/anime/${id}/full`),
    fetch(`https://api.jikan.moe/v4/anime/${id}/characters`),
    fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`)
  ]);

  if (!animeRes.ok) throw new Error("Falha ao carregar anime");

  const animeJson = await animeRes.json();
  const charJson = await charRes.json();
  const recJson = await recRes.json();

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
    rank: data.rank,
    season: data.season,
    source: data.source,
    type: data.type,
    members: data.members,
    aired: data.aired
  };

  return {
    anime: formattedAnime,
    characters: charJson.data || [],
    recommendations: recJson.data || []
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
    loading: isLoading,
    error
  };
}