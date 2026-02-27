import { useMemo } from 'react';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useAuth } from '@/context/AuthContext';

/**
 * Calculates compatibility between the logged-in user and a public profile.
 *
 * @param {Array}  publicLibrary   - library items from usePublicProfile
 * @returns {{ score, sharedAnimes, genreOverlap, scoreAffinity, loading }}
 */
export function useCompatibility(publicLibrary = []) {
    const { user } = useAuth();
    const { library: myLibrary, loading } = useAnimeLibrary();

    const result = useMemo(() => {
        if (!user || loading || !publicLibrary.length || !myLibrary.length) {
            return { score: null, sharedAnimes: [], genreOverlap: 0, scoreAffinity: 0, sharedCount: 0 };
        }

        // ── 1. Shared anime (by id) ─────────────────────────────────────────
        const myMap = new Map(myLibrary.map(a => [String(a.id), a]));
        const publicMap = new Map(publicLibrary.map(a => [String(a.id), a]));

        const sharedAnimes = [];
        myMap.forEach((myItem, id) => {
            if (publicMap.has(id)) {
                const pubItem = publicMap.get(id);
                sharedAnimes.push({
                    id,
                    title:    myItem.title,
                    image:    myItem.image,
                    myScore:  myItem.score || 0,
                    pubScore: pubItem.score || 0,
                    scoreDiff: Math.abs((myItem.score || 0) - (pubItem.score || 0)),
                });
            }
        });

        // Sort by score similarity (lower diff first)
        sharedAnimes.sort((a, b) => a.scoreDiff - b.scoreDiff);

        const smaller = Math.min(myLibrary.length, publicLibrary.length);
        const sharedRatio = smaller > 0 ? sharedAnimes.length / smaller : 0;
        const sharedScore = sharedRatio * 50; // max 50 pts

        // ── 2. Genre overlap ────────────────────────────────────────────────
        const myGenres  = new Set(myLibrary.flatMap(a => a.genres || []));
        const pubGenres = new Set(publicLibrary.flatMap(a => a.genres || []));
        const unionSize = new Set([...myGenres, ...pubGenres]).size;
        const interSize = [...myGenres].filter(g => pubGenres.has(g)).length;
        const genreOverlap = unionSize > 0 ? (interSize / unionSize) * 30 : 0; // max 30 pts

        // ── 3. Score affinity ────────────────────────────────────────────────
        const myScored  = myLibrary.filter(a => a.score > 0);
        const pubScored = publicLibrary.filter(a => a.score > 0);
        const myAvg  = myScored.length  ? myScored.reduce((s, a)  => s + a.score, 0)  / myScored.length  : 0;
        const pubAvg = pubScored.length ? pubScored.reduce((s, a) => s + a.score, 0) / pubScored.length : 0;
        const scoreAffinity = myAvg && pubAvg
            ? Math.max(0, (1 - Math.abs(myAvg - pubAvg) / 10)) * 20  // max 20 pts
            : 0;

        const score = Math.round(sharedScore + genreOverlap + scoreAffinity);

        return {
            score:        Math.min(100, score),
            sharedAnimes: sharedAnimes.slice(0, 12),
            sharedCount:  sharedAnimes.length,
            genreOverlap: Math.round((interSize / (unionSize || 1)) * 100),
            scoreAffinity: Math.round(scoreAffinity / 20 * 100),
            commonGenres: [...myGenres].filter(g => pubGenres.has(g)).sort(),
            myAvgScore:  Math.round(myAvg * 10) / 10,
            pubAvgScore: Math.round(pubAvg * 10) / 10,
        };
    }, [user, loading, myLibrary, publicLibrary]);

    return { ...result, loading };
}
