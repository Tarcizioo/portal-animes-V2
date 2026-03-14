import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

/**
 * Default preferences — all types enabled by default.
 * Keys match the `type` field used in notificationService.js.
 */
export const DEFAULT_NOTIFICATION_PREFS = {
    profile_view: true,
    comment_like: true,
    new_follower:  true,
};


export function useNotificationPrefs() {
    const { user } = useAuth();
    const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setPrefs(DEFAULT_NOTIFICATION_PREFS);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const saved = snap.data()?.notificationPrefs;
                setPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...saved });
            }
            setLoading(false);
        }, (err) => {
            console.error('[useNotificationPrefs] snapshot error:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    /**
     * Toggle a single preference type.
     * @param {string} type  - e.g. 'profile_view' | 'comment_like'
     * @param {boolean} value
     */
    const updatePref = useCallback(async (type, value) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userRef, {
                notificationPrefs: { ...prefs, [type]: value },
            }, { merge: true });
        } catch (err) {
            console.error('[useNotificationPrefs] update error:', err);
        }
    }, [user, prefs]);

    return { prefs, loading, updatePref };
}
