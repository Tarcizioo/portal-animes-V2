import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';

export function useComments(animeId) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Real-time Comments
    useEffect(() => {
        if (!animeId) {
            setLoading(false);
            return;
        }

        const commentsRef = collection(db, 'comments');
        // Query: Filter by animeId (sempre String para consistência com useParams)
        const safeAnimeId = String(animeId);
        const q = query(
            commentsRef,
            where("animeId", "==", safeAnimeId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort (Newest first)
            fetchedComments.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            setComments(fetchedComments);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar comentários:", error);
            // Se o erro for de índice, geralmente o Firebase avisa no console com um link para criar
            setLoading(false);
        });

        return () => unsubscribe();
    }, [animeId]);

    // 2. Add Comment
    const addComment = async (content) => {
        if (!user) throw new Error("Você precisa estar logado para comentar.");
        if (!content.trim()) throw new Error("O comentário não pode estar vazio.");
        if (!animeId) throw new Error("ID do anime inválido.");

        try {
            await addDoc(collection(db, 'comments'), {
                animeId: String(animeId), // Sempre String para consistência com useParams
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

        // Verificar se o comentário pertence ao usuário
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
        deleteComment
    };
}
