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
    writeBatch
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

    // 2. Adicionar Anime (ou Atualizar se já existe)
    const addToLibrary = async (anime, status = 'plan_to_watch') => {
        if (!user) return;

        try {
            const animeId = anime.id || anime.mal_id;
            if (!animeId) {
                console.error("ID do anime inválido:", anime);
                return;
            }

            const animeRef = doc(db, 'users', user.uid, 'library', animeId.toString());

            // Dados básicos para salvar
            const animeData = {
                id: animeId, // Salvar o ID explicitamente também é bom
                title: anime.title,
                image: anime.images?.jpg?.image_url || anime.image,
                totalEp: anime.episodes || 0,
                currentEp: 0,
                status: status,
                score: 0,
                lastUpdated: serverTimestamp()
            };

            await setDoc(animeRef, animeData, { merge: true });

            // Atualizar contagem global de stats (opcional, pode ser feito via Cloud Functions, mas faremos local aqui por simplicidade)
            // await updateStats(1, 0); 
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

    return {
        library,
        loading,
        addToLibrary,
        incrementProgress,
        updateProgress,
        updateStatus,
        updateRating,
        updateRating,
        removeFromLibrary,
        toggleFavorite
    };
}
