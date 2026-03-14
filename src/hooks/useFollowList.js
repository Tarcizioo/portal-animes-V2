import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

/**
 * Fetches a paginated, real-time list of followers or following for a given user.
 *
 * @param {string} uid        - The user whose list to fetch
 * @param {'followers'|'following'} type
 * @param {number} maxItems   - Max items to fetch (default 50)
 */
export function useFollowList(uid, type = 'followers', maxItems = 50) {
    const [list, setList]       = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid || !type) {
            setList([]);
            setLoading(false);
            return;
        }

        const ref = collection(db, 'users', uid, type);
        const q   = query(ref, orderBy('followedAt', 'desc'), limit(maxItems));

        const unsub = onSnapshot(q, (snap) => {
            setList(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
            setLoading(false);
        }, (err) => {
            console.error(`[useFollowList] ${type} error:`, err);
            setLoading(false);
        });

        return () => unsub();
    }, [uid, type, maxItems]);

    return { list, loading };
}
