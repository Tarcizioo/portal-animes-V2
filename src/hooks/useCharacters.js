import { useState, useEffect, useCallback } from 'react';
import { jikanApi } from '@/services/api';

export function useCharacters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchCharacters() {
            try {
                setLoading(true);

                // Delay para evitar bloqueio da API (429) e melhorar UX do skeleton (if needed, but api.js handles basic rate limits)
                // Keeping a small delay for UI smoothness if desired, or relying on api.js
                // await new Promise(resolve => setTimeout(resolve, 600)); 

                const json = await jikanApi.getTopCharacters(`?page=${page}&limit=25`);

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
                 console.error("Erro fetch characters:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchCharacters();

        return () => { isMounted = false; };
    }, [page]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) setPage(prev => prev + 1);
    }, [loading, hasMore]);

    return { characters, loading, loadMore, hasMore };
}

