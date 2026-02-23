import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';

const COMMENTS_PER_PAGE = 20;

export function useComments(animeId) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentsLimit, setCommentsLimit] = useState(COMMENTS_PER_PAGE);
    const [hasMoreComments, setHasMoreComments] = useState(false);

    // 1. Fetch Real-time Comments (com paginação)
    useEffect(() => {
        if (!animeId) {
            setLoading(false);
            return;
        }

        const commentsRef = collection(db, 'comments');
        const safeAnimeId = String(animeId);
        // Busca limit+1 para saber se há mais comentários
        const q = query(
            commentsRef,
            where("animeId", "==", safeAnimeId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            fetchedComments.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });

            // Se veio mais que o limit, há mais comentários
            setHasMoreComments(fetchedComments.length > commentsLimit);
            setComments(fetchedComments.slice(0, commentsLimit));
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar comentários:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [animeId, commentsLimit]);

    // Carregar mais comentários
    const loadMoreComments = useCallback(() => {
        setCommentsLimit(prev => prev + COMMENTS_PER_PAGE);
    }, []);

    // 2. Add Comment
    const addComment = async (content) => {
        if (!user) throw new Error("Você precisa estar logado para comentar.");
        if (!content.trim()) throw new Error("O comentário não pode estar vazio.");
        if (!animeId) throw new Error("ID do anime inválido.");

        try {
            await addDoc(collection(db, 'comments'), {
                animeId: String(animeId),
                userId: user.uid,
                userName: user.name || user.displayName || "Usuário",
                userAvatar: user.photoURL,
                content: content.trim(),
                createdAt: serverTimestamp(),
                likes: 0
            });
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            throw error;
        }
    };

    // 3. Delete Comment (com verificação de dono)
    // 3. Delete Comment
    const deleteComment = async (commentId) => {
        if (!user) return;

        // Optimistic UI update to prevent Firestore from panicking on active listeners
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            const commentRef = doc(db, 'comments', commentId);
            // Push deletion to the end of the event loop to ensure any pending
            // snapshot updates or local state reconciliations have finished
            setTimeout(async () => {
                try {
                    await deleteDoc(commentRef);
                } catch (internalError) {
                    console.error("Firestore Delete Error (Async):", internalError);
                }
            }, 50);
        } catch (error) {
            console.error("Erro ao preparar deleção:", error);
            setLoading(true); 
            throw error;
        }
    };

    return {
        comments,
        loading,
        addComment,
        deleteComment,
        hasMoreComments,
        loadMoreComments
    };
}
