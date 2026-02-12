import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/context/ToastContext';

export function useUserProfile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            } else {
                // Se não existir (caso raro se AuthContext já cria), cria init
                setProfile(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Erro ao buscar perfil:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const updateProfileData = async (newData) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        try {
            // Auto-generate searchName for case-insensitive search
            const dataToSave = { ...newData };
            if (dataToSave.displayName) {
                dataToSave.searchName = dataToSave.displayName.toLowerCase();
            }
            await setDoc(userRef, dataToSave, { merge: true });
            toast.success("Perfil atualizado com sucesso!", "Salvo");
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast.error("Erro ao salvar perfil.", "Erro");
            throw error;
        }
    };

    return { profile, loading, updateProfileData };
}
