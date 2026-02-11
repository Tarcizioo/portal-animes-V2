import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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
    return useInfiniteQuery({
        queryKey: ['top-people-infinite'],
        queryFn: async ({ pageParam }) => {
             console.log("useTopPeople: queryFn called with pageParam:", pageParam);
             // Ensure pageParam is valid, default to 1 if not
             const page = pageParam || 1;
             try {
                const json = await jikanApi.getTopPeople(`?page=${page}&limit=25`);
                console.log(`useTopPeople: fetched page ${page}`, json);
                return json;
             } catch (error) {
                 console.error("useTopPeople: fetch error", error);
                 throw error;
             }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            console.log("useTopPeople: getNextPageParam called", { lastPage, allPages });
            const pagination = lastPage?.pagination;
            if (!pagination?.has_next_page) {
                console.log("useTopPeople: No next page");
                return undefined;
            }
            const nextPage = (pagination.current_page || 0) + 1;
            console.log("useTopPeople: Next page is", nextPage);
            return nextPage;
        },
        staleTime: STALE_TIME_24H,
        gcTime: STALE_TIME_24H,
    });
}
