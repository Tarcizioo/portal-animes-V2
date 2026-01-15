import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '@/services/firebase';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    name: user.displayName,
                    email: user.email,
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
            console.error("Error Code:", error.code);
            console.error("Error Message:", error.message);
            alert(`Erro ao fazer login: ${error.message}`);
            throw error;
        }
    };

    // Logout
    const signOut = () => {
        return firebaseSignOut(auth);
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
