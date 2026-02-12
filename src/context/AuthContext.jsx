import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { auth, googleProvider, db } from '@/services/firebase';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    reauthenticateWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Login com Google
    const signInGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Verificar se é o primeiro login e criar documento no Firestore
            const userRef = doc(db, 'users', user.uid);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    displayName: user.displayName,
                    searchName: user.displayName?.toLowerCase() || '',
                    // email: user.email, // REMOVIDO por segurança (será lido via auth.currentUser)
                    photoURL: user.photoURL,
                    bannerURL: null,
                    createdAt: serverTimestamp(),
                    stats: {
                        watchedAnimes: 0,
                        episodesWatched: 0,
                        meanScore: 0
                    }
                });
            }
        } catch (error) {
            console.error("Erro no login Google:", error);
            toast.error(`Erro ao fazer login: ${error.message}`);
            throw error;
        }
    };

    // Logout
    const signOut = () => {
        return firebaseSignOut(auth);
    };

    // Deletar Conta
    const deleteAccount = async () => {
        if (!auth.currentUser) return;

        try {
            const uid = auth.currentUser.uid;

            // 1. Deletar documento do Firestore
            await deleteDoc(doc(db, 'users', uid));

            // 2. Deletar usuário da Autenticação
            await auth.currentUser.delete();

        } catch (error) {
            // Se o login é antigo, Firebase exige re-autenticação
            if (error.code === 'auth/requires-recent-login') {
                try {
                    toast.info("Por segurança, confirme sua identidade novamente.", "Re-autenticação");
                    await reauthenticateWithPopup(auth.currentUser, googleProvider);
                    // Tentar novamente após re-autenticação
                    await auth.currentUser.delete();
                    return;
                } catch (reAuthError) {
                    console.error("Erro na re-autenticação:", reAuthError);
                    toast.error("Falha na re-autenticação. Tente fazer login novamente.", "Erro");
                    throw reAuthError;
                }
            }
            console.error("Erro ao deletar conta:", error);
            throw error;
        }
    };

    // Monitorar Estado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        user,
        signInGoogle,
        signOut,
        deleteAccount,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
