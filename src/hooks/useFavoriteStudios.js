import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/context/ToastContext';

export function useFavoriteStudios(studioId = null) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteStudios, setFavoriteStudios] = useState([]);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setFavoriteStudios([]);
        setIsFavorite(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Check if specific studio is favorite
  useEffect(() => {
    if (!user || !studioId) return;

    const docRef = doc(db, 'users', user.uid, 'followed_studios', String(studioId));
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setIsFavorite(doc.exists());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, studioId]);

  // Fetch all favorite studios
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'followed_studios'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavoriteStudios(studios);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (studioData) => {
    if (!user) {
      toast.error("Você precisa estar logado para seguir estúdios!", "Login Necessário");
      return;
    }

    if (!isFavorite && favoriteStudios.length >= 3) {
      toast.error("Você só pode seguir até 3 estúdios!", "Limite Atingido");
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'followed_studios', String(studioData.mal_id));

    try {
      if (isFavorite) {
        await deleteDoc(docRef);
        toast.info("Deixou de seguir o estúdio.", "Removido");
      } else {
        await setDoc(docRef, {
          name: studioData.titles?.[0]?.title || studioData.title,
          image: studioData.images?.jpg?.image_url,
          url: studioData.url,
          mal_id: studioData.mal_id,
          addedAt: new Date().toISOString()
        });
        toast.success("Estúdio seguido com sucesso!", "Favorito");
      }
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
      toast.error("Erro ao atualizar. Tente novamente.", "Falha");
    }
  };

  return { isFavorite, toggleFavorite, favoriteStudios, loading, user };
}
