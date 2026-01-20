import { useState, useEffect } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');
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
        const [animeRes, charRes] = await Promise.all([
          fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=4&order_by=members&sort=desc`, { signal }),
          fetch(`https://api.jikan.moe/v4/characters?q=${query}&limit=3&order_by=favorites&sort=desc`, { signal })
        ]);

        const [animeJson, charJson] = await Promise.all([
          animeRes.json(),
          charRes.json()
        ]);

        if (signal.aborted) return; // Se foi cancelado, não faz nada

        // Formatar Animes
        const animes = (animeJson.data || []).map(anime => ({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.jpg?.image_url,
          score: anime.score,
          year: anime.year || 'N/A',
          status: anime.status,
          episodes: anime.episodes,
          type: anime.type, // TV, Movie, etc.
          kind: 'anime' // Identificador interno
        }));

        // Formatar Personagens
        const characters = (charJson.data || []).map(char => ({
          id: char.mal_id,
          title: char.name, // Personagens usam 'name'
          image: char.images?.jpg?.image_url,
          score: null,
          year: null,
          status: null,
          episodes: null,
          type: 'Personagem',
          kind: 'character'
        }));

        // Combina e limita resultados
        setResults([...animes, ...characters]);
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
  }, [query]);

  return { query, setQuery, results, isSearching, setResults };
}