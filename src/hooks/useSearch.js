import { useState, useEffect } from 'react';
import { jikanApi } from '@/services/api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all'); // 'all', 'anime', 'character', 'person', 'studio'
  const [results, setResults] = useState([]);

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Se a busca for curta demais, limpa tudo e para
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    // O "Debounce": Espera 500ms antes de chamar a API
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        let results = [];

        if (type === 'anime') {
          const data = await jikanApi.searchAnime(query, 6, { signal });
          results = (data.data || []).map(anime => ({
            id: anime.mal_id,
            title: anime.title_english || anime.title,
            image: anime.images?.jpg?.image_url,
            score: anime.score,
            year: anime.year || 'N/A',
            status: anime.status,
            type: anime.type,
            kind: 'anime'
          }));
        } else if (type === 'character') {
          const data = await jikanApi.searchCharacters(query, 6, { signal });
          results = (data.data || []).map(char => ({
            id: char.mal_id,
            title: char.name,
            image: char.images?.jpg?.image_url,
            kind: 'character'
          }));
        } else if (type === 'person') {
          const data = await jikanApi.searchPeople(query, 6, { signal });
          results = (data.data || []).map(person => ({
            id: person.mal_id,
            title: person.name,
            image: person.images?.jpg?.image_url,
            kind: 'person' // Novo tipo
          }));
        } else if (type === 'studio') {
          const data = await jikanApi.searchStudios(query, 6, { signal });
          results = (data.data || []).map(std => ({
            id: std.mal_id,
            title: std.titles?.[0]?.title || std.about?.split('\n')[0] || 'Estúdio',
            image: std.images?.jpg?.image_url,
            kind: 'studio'
          }));
        } else {
            // Default: Anime + Character + People + Studio mix
            // Sequentially await with delays to prevent Jikan 429 Rate Limit
            const animeRes = await jikanApi.searchAnime(query, 3, { signal });
            if (signal.aborted) return;
            await new Promise(r => setTimeout(r, 400));
            
            const charRes = await jikanApi.searchCharacters(query, 2, { signal });
            if (signal.aborted) return;
            await new Promise(r => setTimeout(r, 400));
            
            const peopleRes = await jikanApi.searchPeople(query, 1, { signal });
            if (signal.aborted) return;
            await new Promise(r => setTimeout(r, 400));
            
            const studioRes = await jikanApi.searchStudios(query, 1, { signal });
            if (signal.aborted) return;

            const animes = (animeRes?.data || []).map(anime => ({
                id: anime.mal_id,
                title: anime.title_english || anime.title,
                image: anime.images?.jpg?.image_url,
                score: anime.score,
                year: anime.year || 'N/A',
                status: anime.status,
                kind: 'anime'
            }));

            const chars = (charRes?.data || []).map(char => ({
                id: char.mal_id,
                title: char.name,
                image: char.images?.jpg?.image_url,
                kind: 'character'
            }));

            const people = (peopleRes?.data || []).map(p => ({
                id: p.mal_id,
                title: p.name,
                image: p.images?.jpg?.image_url,
                kind: 'person'
            }));

            const studios = (studioRes?.data || []).map(s => ({
                id: s.mal_id,
                title: s.titles?.[0]?.title || s.about?.split('\n')[0] || 'Estúdio',
                image: s.images?.jpg?.image_url,
                kind: 'studio'
            }));

            results = [...animes, ...chars, ...people, ...studios];
        }

        setResults(results);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Erro na busca:", error);
        }
      } finally {
        if (!signal.aborted) setIsSearching(false);
      }
    }, 500);

    // Limpeza: Se o usuário digitar de novo antes dos 500ms, cancela a busca anterior
    return () => {
      clearTimeout(delayDebounce);
      controller.abort(); // Cancela request em voo
    };
  }, [query, type]); // Re-executa se query ou type mudar

  return { query, setQuery, type, setType, results, isSearching, setResults };
}