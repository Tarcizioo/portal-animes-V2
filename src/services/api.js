const BASE_URL = "https://api.jikan.moe/v4";

/**
 * Helper delay function to pause execution
 * @param {number} ms - Milliseconds to wait
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with retry logic to handle rate limits (429)
 * @param {string} endpoint - API Endpoint (e.g., '/anime/1')
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries
 * @param {number} backoff - Initial backoff delay in ms
 */
export async function apiFetch(endpoint, options = {}, retries = 3, backoff = 1000) {
    const url = `${BASE_URL}${endpoint}`;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);

            // Handle Rate Limiting (429) specifically
            if (response.status === 429) {
                if (i === retries - 1) throw new Error("API Rate Limit Exceeded");
                console.warn(`Rate limit hit for ${url}. Retrying in ${backoff * (i + 1)}ms...`);
                await delay(backoff * (i + 1));
                continue;
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            // If it's a network error (not a 4xx/5xx response), we also retry
            await delay(backoff * (i + 1));
        }
    }
}

export const jikanApi = {
    getTopAnime: (params = '') => apiFetch(`/top/anime${params}`),
    getSeasonNow: (params = '') => apiFetch(`/seasons/now${params}`),
    getAnimeById: (id) => apiFetch(`/anime/${id}`),
    getAnimeFullById: (id) => apiFetch(`/anime/${id}/full`),
    getAnimeCharacters: (id) => apiFetch(`/anime/${id}/characters`),
    getAnimeStaff: (id) => apiFetch(`/anime/${id}/staff`),
    getAnimeEpisodes: (id) => apiFetch(`/anime/${id}/episodes`),
    getAnimeRecommendations: (id) => apiFetch(`/anime/${id}/recommendations`),
    getAnimePictures: (id) => apiFetch(`/anime/${id}/pictures`),
    getAnimeVideos: (id) => apiFetch(`/anime/${id}/videos`),
    
    getPersonById: (id) => apiFetch(`/people/${id}`),
    getPersonAnime: (id) => apiFetch(`/people/${id}/anime`),
    getPersonVoices: (id) => apiFetch(`/people/${id}/voices`),
    getPersonPictures: (id) => apiFetch(`/people/${id}/pictures`),
    getTopPeople: (params = '') => apiFetch(`/top/people${params}`),

    getCharacterById: (id) => apiFetch(`/characters/${id}`),
    getCharacterFullById: (id) => apiFetch(`/characters/${id}/full`),
    getCharacterAnime: (id) => apiFetch(`/characters/${id}/anime`),
    getCharacterVoices: (id) => apiFetch(`/characters/${id}/voices`),
    getCharacterPictures: (id) => apiFetch(`/characters/${id}/pictures`),
    getTopCharacters: (params = '') => apiFetch(`/top/characters${params}`),
    
    getGenreAnime: (genreId) => apiFetch(`/anime?genres=${genreId}&order_by=score&sort=desc`),
};
