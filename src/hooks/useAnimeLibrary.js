import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/constants/app';
import {
    collection,
    query,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';

export function useAnimeLibrary() {
    const { user } = useAuth();
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Escutar Mudanças em Tempo Real
    useEffect(() => {
        if (!user) {
            setLibrary([]);
            setLoading(false);
            return;
        }

        const libraryRef = collection(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME);
        const q = query(libraryRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const animeList = snapshot.docs.map(doc => ({
                id: doc.id, // ID é sempre String no Firestore
                ...doc.data()
            }));
            setLibrary(animeList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar biblioteca:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Helper para Mapeamento Seguro
    const mapAnimeData = (anime, existingData = {}, status = 'plan_to_watch') => {
        const id = anime.mal_id || anime.id;
        const safeId = String(id);

        // Determina episódios assistidos
        let currentEp = 0;
        if (status === 'completed') {
            currentEp = anime.episodes || existingData.currentEp || 0;
        } else if (existingData.currentEp !== undefined) {
            currentEp = existingData.currentEp;
        }

        // Lógica de Imagem: Pode vir direto (View Model) ou aninhado (Jikan Raw)
        const imageUrl = anime.image || anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url || null;

        // Lógica de Gêneros: Pode vir como strings (View Model) ou objetos (Jikan Raw)
        let genres = [];
        if (Array.isArray(anime.genres)) {
            if (typeof anime.genres[0] === 'string') {
                genres = anime.genres; // Já mapeado
            } else {
                genres = (anime.genres || []).map(g => g.name); // Mapeia objetos
            }
        }
        // Se for Raw, pode ter themes/demographics
        if (Array.isArray(anime.themes)) genres = genres.concat(anime.themes.map(t => t.name));
        if (Array.isArray(anime.demographics)) genres = genres.concat(anime.demographics.map(d => d.name));

        // Remove duplicatas de gêneros
        genres = [...new Set(genres)];

        return {
            id: safeId, // ID normalizado como String
            title: anime.title || anime.title_english || 'Sem Título',
            image: imageUrl,
            totalEp: anime.episodes || 0,
            currentEp: currentEp,
            score: existingData.score || 0, // Nota do Usuário
            status: status,
            lastUpdated: serverTimestamp(),

            // Metadados Ricos
            genres: genres,
            year: anime.year || anime.aired?.prop?.from?.year || null,
            season: anime.season || null,
            type: anime.type || 'TV',
            synopsis: anime.synopsis || '',
            studios: anime.studios ? anime.studios.map(s => s.name) : [],
            members: anime.members || 0,

            // Preservar flags
            isFavorite: existingData.isFavorite || false
        };
    };

    // 2. Adicionar Anime (ou Atualizar)
    const addToLibrary = async (anime, status = 'plan_to_watch') => {
        if (!user) return;

        try {
            const animeId = anime.mal_id || anime.id;
            if (!animeId) {
                console.error("ID do anime inválido:", anime);
                return;
            }
            const docId = String(animeId);
            const animeRef = doc(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME, docId);

            // Verificar existência
            const docSnap = await getDoc(animeRef);
            const exists = docSnap.exists();
            const existingData = exists ? docSnap.data() : {};

            const animeData = mapAnimeData(anime, existingData, status);

            await setDoc(animeRef, animeData, { merge: true });

        } catch (error) {
            console.error("Erro ao adicionar anime:", error);
            throw error;
        }
    };

    // 3. Atualizar Progresso
    const updateProgress = async (animeId, newEp, totalEp) => {
        if (!user) return;

        // Validações
        if (newEp < 0) newEp = 0;
        if (totalEp > 0 && newEp > totalEp) newEp = totalEp;

        try {
            const animeRef = doc(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME, String(animeId));
            const updates = {
                currentEp: newEp,
                lastUpdated: serverTimestamp()
            };

            if (totalEp > 0 && newEp === totalEp) {
                updates.status = 'completed';
            }

            await updateDoc(animeRef, updates);
        } catch (error) {
            console.error("Erro ao atualizar progresso:", error);
        }
    };

    const incrementProgress = (animeId, currentEp, totalEp) => {
        return updateProgress(animeId, currentEp + 1, totalEp);
    };

    // 4. Mudar Status
    const updateStatus = async (animeId, newStatus, totalEp = 0) => {
        if (!user) return;
        try {
            const animeRef = doc(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME, String(animeId));
            const updates = {
                status: newStatus,
                lastUpdated: serverTimestamp()
            };
            if (newStatus === 'completed' && totalEp > 0) {
                updates.currentEp = totalEp;
            }
            await updateDoc(animeRef, updates);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    // 5. Atualizar Nota
    const updateRating = async (animeId, newScore) => {
        if (!user) return;
        try {
            const animeRef = doc(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME, String(animeId));
            await updateDoc(animeRef, {
                score: newScore,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao atualizar nota:", error);
        }
    };

    // 6. Remover Anime
    const removeFromLibrary = async (animeId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME, String(animeId)));
        } catch (error) {
            console.error("Erro ao remover anime:", error);
        }
    };

    // 7. Toggle Favorito
    const toggleFavorite = async (anime) => {
        if (!user) throw new Error("Usuário não autenticado");

        const rawId = anime.id || anime.mal_id;
        const animeId = String(rawId);

        const libraryItem = library.find(item => item.id === animeId);
        const isCurrentlyFavorite = libraryItem?.isFavorite;

        if (!isCurrentlyFavorite) {
            const favoritesCount = library.filter(item => item.isFavorite).length;
            if (favoritesCount >= APP_CONFIG.LIBRARY.MAX_FAVORITES) {
                throw new Error(`Você já possui ${APP_CONFIG.LIBRARY.MAX_FAVORITES} favoritos.`);
            }
        }

        try {
            const animeRef = doc(db, 'users', user.uid, APP_CONFIG.LIBRARY.COLLECTION_NAME, animeId);

            if (!libraryItem) {
                await addToLibrary(anime);
                await updateDoc(animeRef, { isFavorite: true });
            } else {
                await updateDoc(animeRef, { isFavorite: !isCurrentlyFavorite });
            }
        } catch (error) {
            console.error("Erro ao alterar favorito:", error);
            throw error;
        }
    };

    // 8. Sincronizar Dados (Otimizado com Queue)
    const syncLibraryData = async (onProgress) => {
        if (!user || !library.length) return;

        const animesToUpdate = library.filter(anime => {
            const hasSynopsis = !!anime.synopsis;
            const hasGenerosArray = Array.isArray(anime.genres);
            const hasSafeId = typeof anime.id === 'string'; // Garante que atualize legados
            return !hasSynopsis || !hasGenerosArray || !hasSafeId;
        });

        if (animesToUpdate.length === 0) return 0;

        let processed = 0;
        const total = animesToUpdate.length;

        // Processamento em Lotes (Concurrency control)
        // Jikan Rate Limit: ~3 req/s safe. Vamos fazer 3 por vez com delay.
        const concurrency = 3;
        const delayBetweenRequests = 1000; // 1s entre cada batch para ser bem seguro

        const processBatch = async (batch) => {
            const promises = batch.map(async (anime) => {
                try {
                    // Se o ID for inválido ou numérico legado, precisamos garantir que funciona
                    const response = await fetch(`https://api.jikan.moe/v4/anime/${anime.id}/full`);
                    if (!response.ok) {
                        // Se der 429, apenas ignoramos esse item por hora para não travar tudo
                        if (response.status === 429) console.warn(`Rate limit hit for ${anime.id}`);
                        return;
                    }
                    const json = await response.json();
                    const freshData = json.data;

                    // Reutiliza addToLibrary que agora é robusto
                    // Nota: Passamos a instancia do anime atual para manter status/progress
                    await addToLibrary(freshData, anime.status);

                } catch (err) {
                    console.error(`Falha ao sync anime ${anime.id}:`, err);
                } finally {
                    processed++;
                    if (onProgress) onProgress(processed, total);
                }
            });
            await Promise.all(promises);
        };

        // Divide em chunks
        for (let i = 0; i < animesToUpdate.length; i += concurrency) {
            const batch = animesToUpdate.slice(i, i + concurrency);
            await processBatch(batch);
            if (i + concurrency < animesToUpdate.length) {
                await new Promise(r => setTimeout(r, delayBetweenRequests));
            }
        }
    };

    return {
        library,
        loading,
        addToLibrary,
        incrementProgress,
        updateProgress,
        updateStatus,
        updateRating,
        removeFromLibrary,
        toggleFavorite,
        syncLibraryData
    };
}
