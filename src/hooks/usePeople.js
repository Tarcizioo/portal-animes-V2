import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

const STALE_TIME_24H = 1000 * 60 * 60 * 24;

const fetchPersonFull = async (id) => {
    // Fetch critical details first
    const detailsJson = await jikanApi.getPersonById(id);
    
    // Fetch optional data in parallel
    const [voicesRes, picturesRes, animeRes] = await Promise.allSettled([
        jikanApi.getPersonVoices(id),
        jikanApi.getPersonPictures(id),
        jikanApi.getPersonAnime(id)
    ]);

    const voicesJson = voicesRes.status === 'fulfilled' ? voicesRes.value : { data: [] };
    const picturesJson = picturesRes.status === 'fulfilled' ? picturesRes.value : { data: [] };
    const animeJson = animeRes.status === 'fulfilled' ? animeRes.value : { data: [] };

    return {
        person: detailsJson.data,
        voices: voicesJson.data || [],
        pictures: picturesJson.data || [],
        animePositions: animeJson.data || []
    };
};

export function usePersonInfo(id) {
    const query = useQuery({
        queryKey: ['person-info', id],
        queryFn: () => fetchPersonFull(id),
        staleTime: STALE_TIME_24H,
        enabled: !!id,
    });

    return {
        person: query.data?.person,
        voices: query.data?.voices || [],
        pictures: query.data?.pictures || [],
        animePositions: query.data?.animePositions || [],
        loading: query.isLoading,
        error: query.error
    };
}

export function useTopPeople() {
    return useQuery({
        queryKey: ['top-people'],
        queryFn: async () => {
             const json = await jikanApi.getTopPeople('?limit=25');
             return json.data || [];
        },
        staleTime: STALE_TIME_24H,
        gcTime: STALE_TIME_24H,
    });
}
