import { useState, useEffect, useCallback } from 'react';

export function useCharacters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        async function fetchCharacters() {
            try {
                setLoading(true);

                // Delay para evitar bloqueio da API (429) e melhorar UX do skeleton
                await new Promise(resolve => setTimeout(resolve, 600));

                const response = await fetch(`https://api.jikan.moe/v4/top/characters?page=${page}&limit=25`, { signal: controller.signal });

                if (!response.ok) throw new Error(`Status: ${response.status}`);

                const json = await response.json();
                if (!isMounted) return;

                const data = json.data || [];
                const pagination = json.pagination || {};

                setCharacters(prev => {
                    // Se for página 1, substitui tudo.
                    if (page === 1) return data;

                    // Filtro extra de segurança para evitar duplicatas visuais
                    const combined = [...prev, ...data];
                    const unique = Array.from(new Map(combined.map(item => [item.mal_id, item])).values());
                    return unique;
                });

                setHasMore(pagination.has_next_page || (data.length > 0 && data.length >= 25));

            } catch (error) {
                if (error.name !== 'AbortError') console.error("Erro fetch characters:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchCharacters();

        return () => { isMounted = false; controller.abort(); };
    }, [page]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) setPage(prev => prev + 1);
    }, [loading, hasMore]);

    return { characters, loading, loadMore, hasMore };
}
