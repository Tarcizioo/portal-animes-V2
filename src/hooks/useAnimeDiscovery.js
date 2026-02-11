import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

const STALE_TIME_24H = 1000 * 60 * 60 * 24;
const currentYear = new Date().getFullYear();

// --- Transformers ---

const transformData = (anime) => ({
    id: anime.mal_id,
    title: anime.title_english || anime.title,
    image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    smallImage: anime.images?.webp?.image_url || anime.images?.jpg?.image_url,
    images: anime.images,
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

// --- Fetchers ---

const fetchPopular = async () => {
    const json = await jikanApi.getTopAnime('?limit=25');
    return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

const fetchSeasonal = async () => {
    const json = await jikanApi.getSeasonNow('?limit=25');
    return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

const fetchGenreAnime = async (genreId) => {
    const json = await jikanApi.getGenreAnime(genreId);
    return json.data ? removeDuplicates(json.data.map(transformData)) : [];
};

// --- Hooks ---

export function useGenreAnime(genreId, enabled = false) {
    return useQuery({
        queryKey: ['genre', genreId],
        queryFn: () => fetchGenreAnime(genreId),
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: enabled,
    });
}

export function useHomeContent() {
    const popularQuery = useQuery({
        queryKey: ['popular-anime'],
        queryFn: fetchPopular,
        staleTime: STALE_TIME_24H,
        gcTime: STALE_TIME_24H,
    });

    const seasonalQuery = useQuery({
        queryKey: ['seasonal-anime'],
        queryFn: fetchSeasonal,
        staleTime: STALE_TIME_24H,
        gcTime: STALE_TIME_24H,
    });

    // "Featured" Logic (Complex)
    const featuredQuery = useQuery({
        queryKey: ['featured-anime-v5'],
        queryFn: async () => {
            const [topJson, popJson, favJson, seasonalJson] = await Promise.all([
                jikanApi.getTopAnime('?limit=20'),
                jikanApi.getTopAnime('?filter=bypopularity&limit=20'),
                jikanApi.getTopAnime('?filter=favorite&limit=20'),
                jikanApi.getSeasonNow('?limit=20')
            ]);

            const seenIds = new Set();
            const finalHeroList = [];

            const pickUnused = (list, label, color, iconType) => {
                const candidate = list.find(a => !seenIds.has(a.mal_id));
                if (candidate) {
                    seenIds.add(candidate.mal_id);
                    const transformed = transformData(candidate);
                    return { ...transformed, heroLabel: label, heroColor: color, heroIcon: iconType };
                }
                return null;
            };

            const processCategory = (data, label, color, iconType, fallbackIdPrefix) => {
                const list = data || [];
                let selected = pickUnused(list, label, color, iconType);
                
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

            const topAnime = processCategory(topJson.data, "Top Ranking", "text-yellow-400", "Award", "top");
            if (topAnime) finalHeroList.push(topAnime);

            const popAnime = processCategory(popJson.data, "Mais Popular", "text-blue-400", "TrendingUp", "pop");
            if (popAnime) finalHeroList.push(popAnime);

            const favAnime = processCategory(favJson.data, "Favorito dos Fãs", "text-red-400", "Heart", "fav");
            if (favAnime) finalHeroList.push(favAnime);

            const seasonalAnime = processCategory(seasonalJson.data, "Destaque da Temporada", "text-green-400", "Calendar", "seasonal");
            if (seasonalAnime) finalHeroList.push(seasonalAnime);

            return finalHeroList;
        },
        staleTime: STALE_TIME_24H,
    });

    return {
        heroAnime: featuredQuery.data?.[0] || null,
        featuredAnimes: featuredQuery.data || [],
        popularAnimes: popularQuery.data || [],
        seasonalAnimes: seasonalQuery.data || [],
        loading: popularQuery.isLoading || seasonalQuery.isLoading || featuredQuery.isLoading,
        error: popularQuery.error || seasonalQuery.error || featuredQuery.error
    };
}
