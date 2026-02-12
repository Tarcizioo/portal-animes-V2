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
            where("animeId", "==", safeAnimeId),
            orderBy("createdAt", "desc"),
            limit(commentsLimit + 1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

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
    const deleteComment = async (commentId) => {
        if (!user) return;

        const comment = comments.find(c => c.id === commentId);
        if (!comment || comment.userId !== user.uid) {
            console.warn("Tentativa de deletar comentário de outro usuário bloqueada.");
            return;
        }

        try {
            const commentRef = doc(db, 'comments', commentId);
            await deleteDoc(commentRef);
        } catch (error) {
            console.error("Erro ao deletar comentário:", error);
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
