import { useState, useMemo } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Lock, Edit2, PlusCircle } from 'lucide-react';
import { BadgesModal } from './BadgesModal';
import clsx from 'clsx';
import { BADGES } from '@/constants/badges';

export function AchievementBadges({ readOnly = false, publicLibrary = null, publicProfile = null }) {
  const { unlockedBadges: localUnlocked } = useAchievements();
  const { profile: localProfile } = useUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const profile = readOnly ? publicProfile : localProfile;

  const unlockedBadges = useMemo(() => {
    if (!readOnly) return localUnlocked || [];
    if (!publicLibrary) return [];

    const stats = {
      totalAnimes: publicLibrary.length,
      completedAnimes: publicLibrary.filter(a => a.status === 'completed').length,
      episodesWatched: publicLibrary.reduce((acc, curr) => acc + (curr.currentEp || 0), 0)
    };

    return BADGES.filter(badge => badge.requirement(stats, publicLibrary));
  }, [readOnly, localUnlocked, publicLibrary]);

  // Calcular progresso total
  const totalUnlocked = unlockedBadges.length;
  const totalBadges = BADGES.length;
  const progressPercentage = Math.round((totalUnlocked / totalBadges) * 100);

  // Determinar quais badges exibir (Featured ou Default 3 unlocked)
  let displayBadges = [];

  if (profile?.featuredBadges && profile.featuredBadges.length > 0) {
    // Mapear IDs salvos para objetos badge completos
    displayBadges = profile.featuredBadges
      .map(id => BADGES.find(b => b.id === id))
      .filter(Boolean); // Remover nulls se badge não existir mais
  } else {
    // Default: 3 primeiras unlocked
    displayBadges = unlockedBadges.slice(0, 3);
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">🏆</span>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm md:text-lg leading-none">Conquistas</h3>
            <span className="text-[10px] md:text-xs text-[var(--text-secondary)] font-medium">{totalUnlocked} de {totalBadges} desbloqueadas</span>
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-primary/20 hover:text-primary text-[var(--text-secondary)] transition-all group border border-transparent hover:border-primary/30"
            title="Gerenciar Conquistas"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Editar</span>
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Barra de Progresso Total (Compacta) */}
      <div className="w-full bg-[var(--bg-primary)]/50 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Grid de Badges (Visualização Pinned - Max 3) */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {displayBadges.length > 0 ? (
          displayBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={clsx(
                  "relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 bg-black/20 hover:bg-[var(--bg-primary)]/10",
                  badge.border
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                  badge.bg
                )}>
                  <Icon className={clsx("w-5 h-5", badge.color)} />
                </div>

                <h4 className="text-[10px] font-bold text-center text-[var(--text-primary)] leading-tight line-clamp-1">
                  {badge.name}
                </h4>
              </div>
            );
          })
        ) : (
          // Estado Vazio (Sem conquistas ainda)
          <div className="col-span-3 py-4 text-center text-sm text-[var(--text-secondary)] italic bg-black/20 rounded-xl border border-[var(--border-color)] border-dashed">
            Ainda sem conquistas desbloqueadas.
          </div>
        )}

        {/* Slot "Adicionar" se tiver menos de 3 (only in edit mode) */}
        {!readOnly && displayBadges.length < 3 && unlockedBadges.length > displayBadges.length && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-color)] border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <PlusCircle className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-primary mb-1 transition-colors" />
            <span className="text-[10px] font-medium text-[var(--text-secondary)] group-hover:text-primary">Fixar</span>
          </button>
        )}
      </div>

      {!readOnly && (
        <BadgesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}