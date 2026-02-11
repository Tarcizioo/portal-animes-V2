import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

const fetchCharacterFull = async (id) => {
    try {
        // Fetch details first (critical)
        const detailsJson = await jikanApi.getCharacterFullById(id);
        const data = detailsJson ? detailsJson.data : null;

        if (!data) {
            throw new Error(`Character data not found for ID: ${id}`);
        }

        // Fetch optional data in parallel
        const [animeRes, voiceRes, picRes] = await Promise.allSettled([
            jikanApi.getCharacterAnime(id),
            jikanApi.getCharacterVoices(id),
            jikanApi.getCharacterPictures(id)
        ]);

        const animeJson = animeRes.status === 'fulfilled' ? animeRes.value : { data: [] };
        const voiceJson = voiceRes.status === 'fulfilled' ? voiceRes.value : { data: [] };
        const picturesJson = picRes.status === 'fulfilled' ? picRes.value : { data: [] };

        // Format main character data to match component expectations
        const formattedCharacter = {
            id: data.mal_id,
            name: data.name,
            name_kanji: data.name_kanji,
            about: data.about,
            favorites: data.favorites,
            image: data.images?.jpg?.image_url,
            large_image: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
            url: data.url,
            nicknames: data.nicknames || []
        };

        return {
            character: formattedCharacter,
            animeography: animeJson.data || [],
            voiceActors: voiceJson.data || [],
            pictures: picturesJson.data || []
        };
    } catch (error) {
        console.error("Error fetching character info:", error);
        throw error;
    }
};

export function useCharacterInfo(id) {
    const query = useQuery({
        queryKey: ['character-info-full', id],
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

