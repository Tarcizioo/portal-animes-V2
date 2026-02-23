import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

const fetchSchedules = async (day) => {
    // The Jikan API /schedules endpoint can take a ?filter=day argument
    const params = day ? `?filter=${day}` : '';
    const response = await jikanApi.getSchedules(params);
    return response.data || [];
};

export function useCalendar(selectedDay = 'monday') {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['schedules', selectedDay],
        queryFn: () => fetchSchedules(selectedDay),
        staleTime: 1000 * 60 * 30, // 30 minutes cache, schedules don't change that often
        retry: 2,
    });

    return {
        animes: data || [],
        loading: isLoading,
        error,
        refetch
    };
}
