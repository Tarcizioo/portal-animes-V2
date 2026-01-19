import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    query,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment,
    writeBatch,
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

        const libraryRef = collection(db, 'users', user.uid, 'library');
        const q = query(libraryRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const animeList = snapshot.docs.map(doc => ({
                id: parseInt(doc.id), // Garantir que ID seja número se possível, ou string
                ...doc.data()
            }));
            setLibrary(animeList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar biblioteca:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Adicionar Anime (ou Atualizar se já existe - Preservando progresso)
    const addToLibrary = async (anime, status = 'plan_to_watch') => {
        if (!user) return;

        try {
            const animeId = anime.id || anime.mal_id;
            if (!animeId) {
                console.error("ID do anime inválido:", anime);
                return;
            }

            const animeRef = doc(db, 'users', user.uid, 'library', animeId.toString());

            // Verificar se já existe para não sobreescrever progresso
            const docSnap = await getDoc(animeRef);
            const exists = docSnap.exists();
            const existingData = exists ? docSnap.data() : {};

            // Dados básicos para salvar
            const animeData = {
                id: animeId,
                title: anime.title,
                image: anime.images?.jpg?.image_url || anime.image,
                totalEp: anime.episodes || 0,
                // Preservar dados existentes ou iniciar com 0. Se completo, preenche tudo.
                currentEp: (status === 'completed' && (anime.episodes || 0) > 0) ? (anime.episodes || 0) : (exists ? existingData.currentEp : 0),
                score: exists ? (existingData.score || 0) : 0,
                status: status, // Status atualizado
                lastUpdated: serverTimestamp(),

                // Dados Enriquecidos para Filtros (Sempre atualiza com o que veio da API)
                genres: [
                    ...(anime.genres || []),
                    ...(anime.themes || []),
                    ...(anime.demographics || [])
                ].map(g => g.name),
                year: anime.year || anime.aired?.prop?.from?.year || null,
                season: anime.season || null,
                type: anime.type || 'TV',
                synopsis: anime.synopsis || '',
                studios: anime.studios ? anime.studios.map(s => s.name) : [],
                members: anime.members || 0,

                // Preservar isFavorite se existir
                isFavorite: exists ? (existingData.isFavorite || false) : false
            };

            await setDoc(animeRef, animeData, { merge: true });

        } catch (error) {
            console.error("Erro ao adicionar anime:", error);
            throw error;
        }
    };

    // 3. Atualizar Progresso (Generico)
    const updateProgress = async (animeId, newEp, totalEp) => {
        if (!user) return;

        // Validações
        if (newEp < 0) newEp = 0;
        if (totalEp > 0 && newEp > totalEp) newEp = totalEp;

        try {
            const animeRef = doc(db, 'users', user.uid, 'library', animeId.toString());
            const updates = {
                currentEp: newEp,
                lastUpdated: serverTimestamp()
            };

            // Se atingir o total, marca como completo automaticamente
            if (totalEp > 0 && newEp === totalEp) {
                updates.status = 'completed';
            } else if (totalEp > 0 && newEp < totalEp) {
                // Opcional: Se diminuir os eps e estava completo, volta para watching? 
                // Por enquanto vamos deixar simples, o usuário muda o status se quiser.
                // Mas se estava 'plan_to_watch' e começou, vira 'watching'?
                // updates.status = 'watching'; // (Pode ser invasivo demais, vamos testar sem)
            }

            await updateDoc(animeRef, updates);
        } catch (error) {
            console.error("Erro ao atualizar progresso:", error);
        }
    };

    // Mantendo incrementProgress para compatibilidade (reutilizando lógica)
    const incrementProgress = (animeId, currentEp, totalEp) => {
        return updateProgress(animeId, currentEp + 1, totalEp);
    };

    // 4. Mudar Status
    const updateStatus = async (animeId, newStatus, totalEp = 0) => {
        if (!user) return;
        try {
            const animeRef = doc(db, 'users', user.uid, 'library', animeId.toString());

            const updates = {
                status: newStatus,
                lastUpdated: serverTimestamp()
            };

            // Se mudou para completo, preenche tudo
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
            const animeRef = doc(db, 'users', user.uid, 'library', animeId.toString());
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
            await deleteDoc(doc(db, 'users', user.uid, 'library', animeId.toString()));
        } catch (error) {
            console.error("Erro ao remover anime:", error);
        }
    };

    // 7. Toggle Favorito (Max 3)
    const toggleFavorite = async (anime) => {
        if (!user) throw new Error("Usuário não autenticado");

        const animeId = anime.id || anime.mal_id;
        const libraryItem = library.find(item => item.id === animeId);
        const isCurrentlyFavorite = libraryItem?.isFavorite;

        if (!isCurrentlyFavorite) {
            // Verificando limite
            const favoritesCount = library.filter(item => item.isFavorite).length;
            if (favoritesCount >= 3) {
                throw new Error("Você já possui 3 favoritos. Remova um para adicionar outro.");
            }
        }

        try {
            const animeRef = doc(db, 'users', user.uid, 'library', animeId.toString());

            // Se o item não existir na lib, adiciona primeiro como plan_to_watch
            if (!libraryItem) {
                await addToLibrary(anime);
                // Depois atualiza o favorito
                await updateDoc(animeRef, { isFavorite: true });
            } else {
                await updateDoc(animeRef, { isFavorite: !isCurrentlyFavorite });
            }
        } catch (error) {
            console.error("Erro ao alterar favorito:", error);
            throw error;
        }
    };

    // 8. Sincronizar/Reparar Dados da Biblioteca
    const syncLibraryData = async (onProgress) => {
        if (!user || !library.length) return;

        // Filtrar animes que precisam de atualização (sem sinopse ou info antiga)
        // Critério: Sem sinopse, sem genres ou genres é string antiga
        const animesToUpdate = library.filter(anime => {
            const hasSynopsis = !!anime.synopsis;
            const hasGenerosArray = Array.isArray(anime.genres);
            // Se faltar sinopse ou gênero for formato antigo, atualiza.
            return !hasSynopsis || !hasGenerosArray;
        });

        if (animesToUpdate.length === 0) return 0; // Nada a fazer

        let processed = 0;
        const total = animesToUpdate.length;

        for (const anime of animesToUpdate) {
            try {
                // Rate Limiting: Esperar 600ms entre chamadas
                await new Promise(r => setTimeout(r, 600));

                const response = await fetch(`https://api.jikan.moe/v4/anime/${anime.id}/full`);
                if (!response.ok) {
                    if (response.status === 429) {
                        // Se der rate limit, espera mais um pouco e tenta de novo
                        await new Promise(r => setTimeout(r, 2000));
                    }
                    continue;
                }

                const json = await response.json();
                const freshData = json.data;

                // Mapear dados frescos para o formato esperado (incluindo themes/demographics!)
                // E usar addToLibrary para salvar (preservando progresso)
                const animePayload = {
                    id: freshData.mal_id,
                    title: freshData.title_english || freshData.title,
                    image: freshData.images?.jpg?.image_url,
                    episodes: freshData.episodes,
                    year: freshData.year || freshData.aired?.prop?.from?.year,
                    season: freshData.season,
                    type: freshData.type,
                    synopsis: freshData.synopsis,
                    studios: freshData.studios,
                    genres: freshData.genres,
                    themes: freshData.themes,
                    demographics: freshData.demographics,
                    members: freshData.members,
                    score: freshData.score // Ops, isso pode sobrescrever nota user? Não, addToLibrary usa existingData.score se existir.
                    // Espera, no addToLibrary: "score: exists ? (existingData.score || 0) : 0" -> Isso é a nota do USER.
                    // Mas o payload aqui tem score do MAL?
                    // O addToLibrary NÃO usa o score do payload para o user score, ele usa o score do payload só pra nada?
                    // Ah, no meu código do addToLibrary eu NÃO salvei o score global do anime, só o do user.
                    // Tudo bem, o importante é synopsis, genres, etc.
                };

                await addToLibrary(animePayload, anime.status); // Mantém status original

                processed++;
                if (onProgress) onProgress(processed, total);

            } catch (err) {
                console.error(`Falha ao sync anime ${anime.id}:`, err);
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
