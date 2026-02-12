import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Selects up to `count` seed animes from the user's library.
 * Priority: favorites first → highest-rated → most recently added.
 */
function pickSeeds(library, count = 3) {
    if (!library || library.length === 0) return [];

    const sorted = [...library].sort((a, b) => {
        // Favorites first
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        // Then by user score (descending)
        if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
        // Then by status priority (watching > completed > rest)
        const statusOrder = { watching: 0, completed: 1, plan_to_watch: 2, paused: 3, dropped: 4 };
        return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
    });

    return sorted.slice(0, count);
}

/**
 * Fetches recommendations from Jikan for the given seed IDs.
 * Adds a delay between requests to respect rate limits.
 */
async function fetchRecommendations(seedIds, libraryIds) {
    const allRecs = [];
    const seenIds = new Set(libraryIds);

    for (let i = 0; i < seedIds.length; i++) {
        if (i > 0) await delay(400); // Respect Jikan rate limits

        try {
            const json = await jikanApi.getAnimeRecommendations(seedIds[i]);
            const recs = json.data || [];

            // Take top 10 from each seed (they come sorted by votes)
            for (const rec of recs.slice(0, 10)) {
                const entry = rec.entry;
                if (!entry || seenIds.has(entry.mal_id)) continue;
                seenIds.add(entry.mal_id);

                allRecs.push({
                    id: entry.mal_id,
                    title: entry.title,
                    image: entry.images?.webp?.large_image_url || entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url,
                    images: entry.images,
                    votes: rec.votes || 0,
                });
            }
        } catch (err) {
            console.warn(`Failed to fetch recommendations for anime ${seedIds[i]}:`, err);
        }
    }

    // Sort by votes and limit to 15
    const topRecs = allRecs.sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 15);

    // Fetch scores for each recommendation
    for (let i = 0; i < topRecs.length; i++) {
        if (i > 0) await delay(350);
        try {
            const animeData = await jikanApi.getAnimeById(topRecs[i].id);
            topRecs[i].score = animeData.data?.score || 'N/A';
        } catch {
            topRecs[i].score = 'N/A';
        }
    }

    return topRecs;
}

/**
 * Hook that returns personalized recommendations based on the user's library.
 * @param {Array} library - The user's anime library from useAnimeLibrary
 */
export function useRecommendations(library) {
    const seeds = pickSeeds(library);
    const seedIds = seeds.map((s) => s.id);
    const libraryIds = new Set((library || []).map((a) => String(a.id)));

    return useQuery({
        queryKey: ['recommendations', ...seedIds],
        queryFn: () => fetchRecommendations(seedIds, libraryIds),
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
        enabled: seedIds.length > 0,
        retry: 1,
    });
}
