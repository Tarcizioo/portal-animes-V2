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
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=5`);
        const json = await response.json();
        
        // Formatamos os dados igual fizemos no useJikan
        const formatted = (json.data || []).map(anime => ({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.jpg?.image_url,
          score: anime.score,
          year: anime.year || 'N/A'
        }));
        
        setResults(formatted);
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