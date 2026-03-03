import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { notifyCommentLike } from '@/services/notificationService';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    increment
} from 'firebase/firestore';

const COMMENTS_PER_PAGE = 20;

export function useComments(animeId, profile = null, animeTitle = '') {
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

        // Prioriza dados do perfil customizado do site, não os dados brutos do Google Auth
        const authorName = profile?.displayName || user.displayName || "Usuário";
        const authorAvatar = profile?.photoURL || null;

        try {
            await addDoc(collection(db, 'comments'), {
                animeId: String(animeId),
                userId: user.uid,
                userName: authorName,
                userAvatar: authorAvatar,
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

    // 4. Toggle Like (curte / descurte)
    const toggleLike = async (comment) => {
        if (!user) return;

        const commentRef = doc(db, 'comments', comment.id);
        const likedBy = comment.likedBy || [];
        const alreadyLiked = likedBy.includes(user.uid);

        try {
            if (alreadyLiked) {
                // Descurtir
                await updateDoc(commentRef, {
                    likedBy: arrayRemove(user.uid),
                    likes: increment(-1),
                });
            } else {
                // Curtir
                await updateDoc(commentRef, {
                    likedBy: arrayUnion(user.uid),
                    likes: increment(1),
                });
                // Notificar o dono do comentario (anti-spam embutido no service)
                await notifyCommentLike(
                    comment.userId,
                    profile,
                    user.uid,
                    comment.content,
                    animeId,
                    animeTitle
                );
            }
        } catch (err) {
            console.error('Erro ao curtir comentario:', err);
        }
    };

    return {
        comments,
        loading,
        addComment,
        deleteComment,
        toggleLike,
        hasMoreComments,
        loadMoreComments
    };
}
