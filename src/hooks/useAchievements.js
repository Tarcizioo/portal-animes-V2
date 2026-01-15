import { useMemo, useEffect, useState } from 'react';
import { BADGES } from '@/constants/badges';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/context/ToastContext';

export function useAchievements() {
    const { library } = useAnimeLibrary();
    const { profile } = useUserProfile();
    const { toast } = useToast();

    // Calcular estatísticas derivadas da biblioteca local (mais confiável/atualizado que o perfil)
    const stats = useMemo(() => {
        if (!library) return { totalAnimes: 0, completedAnimes: 0, episodesWatched: 0 };

        const totalAnimes = library.length;
        const completedAnimes = library.filter(a => a.status === 'completed').length;
        // Calcular episódios assistidos somando o progresso atual de cada anime
        const episodesWatched = library.reduce((acc, curr) => acc + (curr.currentEp || 0), 0);

        return {
            totalAnimes,
            completedAnimes,
            episodesWatched
        };
    }, [library]);

    // Calcular badges desbloqueadas (lógica pura, sem ler localStorage)
    const { unlockedBadges, lockedBadges } = useMemo(() => {
        const unlocked = [];
        const locked = [];

        BADGES.forEach(badge => {
            const isUnlocked = badge.requirement(stats, library);
            if (isUnlocked) {
                unlocked.push(badge);
            } else {
                locked.push(badge);
            }
        });

        return { unlockedBadges: unlocked, lockedBadges: locked };
    }, [stats, library]);

    // Efeito para checar novos unlocks e disparar toasts
    useEffect(() => {
        if (unlockedBadges.length > 0) {
            const knownBadges = JSON.parse(localStorage.getItem('known_badges') || '[]');
            let hasNewUpdates = false;

            unlockedBadges.forEach(badge => {
                if (!knownBadges.includes(badge.id)) {
                    toast.success(`Conquista Desbloqueada: ${badge.name}!`, "Parabéns!");
                    knownBadges.push(badge.id);
                    hasNewUpdates = true;
                }
            });

            if (hasNewUpdates) {
                localStorage.setItem('known_badges', JSON.stringify(knownBadges));
            }
        }
    }, [unlockedBadges, toast]);

    // Calcular próxima badge (a mais próxima de ser alcançada seria ideal, mas por enquanto pegamos a primeira locked simples)
    const nextBadge = lockedBadges.length > 0 ? lockedBadges[0] : null;

    return {
        stats,
        unlockedBadges,
        lockedBadges,
        nextBadge,
        totalBadges: BADGES.length,
        progressPercentage: Math.round((unlockedBadges.length / BADGES.length) * 100)
    };
}
