import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import {
    doc, getDoc, onSnapshot,
    writeBatch, increment, serverTimestamp,
} from 'firebase/firestore';

/**
 * useFollow — manages the follow/unfollow relationship between the
 * current user and a target user (`targetUid`).
 *
 * Subcollection schema:
 *   users/{followerUid}/following/{targetUid}  { displayName, photoURL, followedAt }
 *   users/{targetUid}/followers/{followerUid}  { displayName, photoURL, followedAt }
 *
 * Counters on the user root doc:
 *   followingCount  (incremented on `follow`, decremented on `unfollow`)
 *   followersCount  (incremented on `follow`, decremented on `unfollow`)
 */
export function useFollow(targetUid) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mutating, setMutating] = useState(false);

    // ── Real-time listener: am I following this user? ─────────────────────────
    useEffect(() => {
        if (!user || !targetUid || user.uid === targetUid) {
            setLoading(false);
            return;
        }

        const ref = doc(db, 'users', user.uid, 'following', targetUid);
        const unsub = onSnapshot(ref, (snap) => {
            setIsFollowing(snap.exists());
            setLoading(false);
        }, () => setLoading(false));

        return () => unsub();
    }, [user?.uid, targetUid]);

    // ── Follow ─────────────────────────────────────────────────────────────────
    const follow = useCallback(async (targetProfile) => {
        if (!user || !targetUid || mutating) return;
        setMutating(true);
        try {
            // Fetch current user's profile for the denormalized snapshot
            const mySnap = await getDoc(doc(db, 'users', user.uid));
            const myData = mySnap.data() || {};

            const now = serverTimestamp();
            const batch = writeBatch(db);

            // users/{me}/following/{target}
            batch.set(doc(db, 'users', user.uid, 'following', targetUid), {
                displayName: targetProfile?.displayName || 'Usuário',
                photoURL:    targetProfile?.photoURL    || null,
                followedAt:  now,
            });

            // users/{target}/followers/{me}
            batch.set(doc(db, 'users', targetUid, 'followers', user.uid), {
                displayName: myData.displayName || user.displayName || 'Usuário',
                photoURL:    myData.photoURL    || user.photoURL    || null,
                followedAt:  now,
            });

            // Increment counters
            batch.update(doc(db, 'users', user.uid),   { followingCount: increment(1) });
            batch.update(doc(db, 'users', targetUid),  { followersCount: increment(1) });

            await batch.commit();
        } catch (err) {
            console.error('[useFollow] follow error:', err);
        } finally {
            setMutating(false);
        }
    }, [user, targetUid, mutating]);

    // ── Unfollow ───────────────────────────────────────────────────────────────
    const unfollow = useCallback(async () => {
        if (!user || !targetUid || mutating) return;
        setMutating(true);
        try {
            const batch = writeBatch(db);

            batch.delete(doc(db, 'users', user.uid, 'following', targetUid));
            batch.delete(doc(db, 'users', targetUid, 'followers', user.uid));

            batch.update(doc(db, 'users', user.uid),  { followingCount: increment(-1) });
            batch.update(doc(db, 'users', targetUid), { followersCount: increment(-1) });

            await batch.commit();
        } catch (err) {
            console.error('[useFollow] unfollow error:', err);
        } finally {
            setMutating(false);
        }
    }, [user, targetUid, mutating]);

    return { isFollowing, loading, mutating, follow, unfollow };
}
