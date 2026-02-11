// Re-exporting hooks from their new modular locations for backward compatibility
// This file is now a facade.

export { useHomeContent as useJikan, useGenreAnime } from './useAnimeDiscovery';
export { usePersonInfo, useTopPeople } from './usePeople';

// Note: useTopCharacters and useCharacterInfo were previously here.
// You should now import them from './useCharacters' and './useCharacterInfo' respectively.
// However, to keep existing imports working, we can re-export them if they match the signature.

import { useCharacters } from './useCharacters';
import { useCharacterInfo as useCharacterInfoOriginal } from './useCharacterInfo';
import { useQuery } from '@tanstack/react-query';
import { jikanApi } from '@/services/api';

// Adapter to match old useTopCharacters signature if needed, 
// or just re-export the new one if it's compatible.
// The old useTopCharacters returned a Query result. 
// The new useCharacters returns { characters, loading, loadMore, hasMore }.
// To maintain compatibility for components expecting the Query result, 
// we might need a specific hook for "Top Characters" if components used `data` directly.

// Checking original useTopCharacters:
// export function useTopCharacters() {
//   return useQuery({ ... queryFn: fetchTopCharacters ... });
// }

// New useCharacters is a manual fetch hook (not React Query). 
// So we should re-implement useTopCharacters here using React Query + api.js 
// OR refactor the components using it. 
// Given the goal is refactoring, let's keep a compatible version here using React Query and api.js.

export function useTopCharacters() {
    return useQuery({
        queryKey: ['top-characters'],
        queryFn: async () => {
             const json = await jikanApi.getTopCharacters('?limit=25');
             return json.data || [];
        },
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
    });
}


export { useCharacterInfoOriginal as useCharacterInfo };
