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

    // O "Debounce": Espera 500ms antes de chamar a API
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [animeRes, charRes] = await Promise.all([
          fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=4&order_by=members&sort=desc`),
          fetch(`https://api.jikan.moe/v4/characters?q=${query}&limit=3&order_by=favorites&sort=desc`)
        ]);

        const [animeJson, charJson] = await Promise.all([
          animeRes.json(),
          charRes.json()
        ]);

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
        console.error("Erro na busca:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    // Limpeza: Se o usuário digitar de novo antes dos 500ms, cancela a busca anterior
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return { query, setQuery, results, isSearching, setResults };
}