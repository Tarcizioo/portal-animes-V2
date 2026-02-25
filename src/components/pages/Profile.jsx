import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { AnimeTrackerList } from '@/components/profile/AnimeTrackerList';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { FavoritesWidget } from '@/components/profile/FavoritesWidget';
import { ShareProfileModal } from '@/components/profile/ShareProfileModal';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useCharacterLibrary } from '@/hooks/useCharacterLibrary';
import { useFavoriteStudios } from '@/hooks/useFavoriteStudios';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Skeleton } from '@/components/ui/Skeleton';
import { LogIn, Hash, Link as LinkIcon, Monitor, X, Clock, ArrowRight, PlayCircle, CheckCircle, BookMarked, PauseCircle, XCircle } from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    watching:      { label: 'Assistindo', color: 'bg-green-500/90' },
    completed:     { label: 'Completo',   color: 'bg-blue-500/90' },
    plan_to_watch: { label: 'Planejado',  color: 'bg-gray-500/90' },
    paused:        { label: 'Pausado',    color: 'bg-yellow-500/90' },
    dropped:       { label: 'Dropado',    color: 'bg-red-500/90' },
};

// ─── Recent Activity (private) ────────────────────────────────────────────────
function RecentActivity({ library }) {
    const recentAnimes = useMemo(() => {
        if (!library || library.length === 0) return [];
        return [...library]
            .sort((a, b) => (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0))
            .slice(0, 6);
    }, [library]);

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-button-accent" />
                    Atividade Recente
                </h3>
                <Link
                    to="/library"
                    className="flex items-center gap-1.5 text-xs font-bold text-button-accent hover:text-text-primary transition-colors group"
                >
                    Ver minha biblioteca
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {recentAnimes.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-6 opacity-60">
                    Nenhum anime na biblioteca ainda.
                </p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {recentAnimes.map((anime, index) => {
                        const statusCfg = STATUS_CONFIG[anime.status] || STATUS_CONFIG.plan_to_watch;
                        return (
                            <motion.div
                                key={anime.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/anime/${anime.id}`} className="block group relative" title={anime.title}>
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                                        <img
                                            src={anime.image || anime.smallImage}
                                            alt={anime.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <div className={`absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-white text-center ${statusCfg.color} backdrop-blur-sm`}>
                                            {statusCfg.label}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-semibold text-text-secondary group-hover:text-primary line-clamp-2 leading-tight transition-colors">
                                        {anime.title}
                                    </p>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function Profile() {
  const { user, signInGoogle, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfileData } = useUserProfile();
  const { library } = useAnimeLibrary();
  const { characterLibrary } = useCharacterLibrary();
  const { favoriteStudios, toggleFavorite } = useFavoriteStudios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  usePageTitle('Meu Perfil');

  // Calcular favoritos ordenados (Animes)
  const sortedFavorites = useMemo(() => {
    const favorites = library?.filter(a => a.isFavorite) || [];
    const order = profile?.favoritesOrder || [];

    if (!order.length) return favorites;
    const orderMap = new Map(order.map((id, index) => [String(id), index]));

    return [...favorites].sort((a, b) => {
      const indexA = orderMap.get(String(a.id)) ?? Infinity;
      const indexB = orderMap.get(String(b.id)) ?? Infinity;
      if (indexA === indexB) return 0;
      return indexA - indexB;
    });
  }, [library, profile?.favoritesOrder]);

  // Calcular favoritos ordenados (Personagens)
  const sortedCharFavorites = useMemo(() => {
    const favorites = characterLibrary || [];
    const order = profile?.favoriteCharactersOrder || [];

    if (!order.length) return favorites;
    const orderMap = new Map(order.map((id, index) => [String(id), index]));

    return [...favorites].sort((a, b) => {
      const indexA = orderMap.get(String(a.id)) ?? Infinity;
      const indexB = orderMap.get(String(b.id)) ?? Infinity;
      if (indexA === indexB) return 0;
      return indexA - indexB;
    });
  }, [characterLibrary, profile?.favoriteCharactersOrder]);


  const handleFavoritesReorder = useCallback(async (newOrderIds) => {
    try {
      await updateProfileData({ favoritesOrder: newOrderIds });
    } catch (error) {
      console.error("Failed to update favorites order:", error);
    }
  }, [updateProfileData]);

  const handleCharFavoritesReorder = useCallback(async (newOrderIds) => {
    try {
      await updateProfileData({ favoriteCharactersOrder: newOrderIds });
    } catch (error) {
      console.error("Failed to update char favorites order:", error);
    }
  }, [updateProfileData]);

  const handleSetPreferredView = useCallback(async (view) => {
    try {
      await updateProfileData({ preferredFavoritesView: view });
    } catch (error) {
      console.error("Failed to set preferred view:", error);
    }
  }, [updateProfileData]);

  const loading = authLoading || (user && profileLoading);

  if (loading) {
    return (

      <div className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 pb-10">
        {/* Skeleton Profile Header */}
        <div className="relative mb-20">
          <Skeleton className="h-48 md:h-64 w-full rounded-2xl" />
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="w-32 h-32 rounded-full border-4 border-bg-primary bg-bg-tertiary overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-60 rounded-2xl" />
          </div>
        </div>
      </div>

    );
  }

  if (!user) {
    return (

      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Faça login para acessar</h2>
          <p className="text-gray-400">
            Crie sua biblioteca, acompanhe seus animes favoritos e ganhe conquistas exclusivas.
          </p>
          <button
            onClick={signInGoogle}
            className="w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
            Entrar com Google
          </button>
        </div>
      </div>

    );
  }

  return (

    <>
      <div className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 pb-10">
        <ProfileHeader
          user={user}
          profile={profile}
          onEdit={() => setIsModalOpen(true)}
          onShare={() => setIsShareModalOpen(true)}
        />

        <ProfileStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            <FavoritesWidget
              animeFavorites={sortedFavorites}
              characterFavorites={sortedCharFavorites}
              onReorderAnimes={handleFavoritesReorder}
              onReorderCharacters={handleCharFavoritesReorder}
              preferredView={profile?.preferredFavoritesView}
              onSetPreferredView={handleSetPreferredView}
            />
            {/* ── Atividade Recente ─────────────────────────────────────── */}
            <RecentActivity library={library} />
            <AchievementBadges />
          </div>

          <div className="space-y-3 md:space-y-6">
            {/* Gêneros Favoritos */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Hash className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Gêneros Favoritos
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.favoriteGenres && profile.favoriteGenres.length > 0 ? (
                  profile.favoriteGenres.map(genre => (
                    <span key={genre} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer">
                      {genre}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhum gênero adicionado.</p>
                )}
              </div>
            </div>

            {/* Estúdios Favoritos */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Estúdios Favoritos
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {favoriteStudios && favoriteStudios.length > 0 ? (
                  favoriteStudios.slice(0, 3).map(studio => (
                    <Link 
                      key={studio.mal_id} 
                      to={`/studio/${studio.mal_id}`}
                      className="group relative flex flex-col items-center bg-bg-tertiary rounded-xl p-2 border border-transparent hover:border-primary transition-all overflow-hidden"
                    >
                      <div className="w-full aspect-square bg-white rounded-lg mb-2 flex items-center justify-center p-2 relative">
                         {studio.image ? (
                           <img src={studio.image} alt={studio.name} className="max-w-full max-h-full object-contain" />
                         ) : (
                           <Monitor className="w-8 h-8 text-gray-300" />
                         )}
                         <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(studio);
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                            title="Deixar de seguir"
                         >
                             <X className="w-3 h-3" />
                         </button>
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-center line-clamp-1 group-hover:text-primary transition-colors w-full">
                        {studio.name}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-3 text-sm text-gray-500 italic">Nenhum estúdio seguido.</p>
                )}
              </div>
            </div>

            {/* Conexões */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Conexões
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {profile?.connections?.discord ? (
                  <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform"></span>
                    Discord: <span className="text-gray-200">{profile.connections.discord}</span>
                  </li>
                ) : null}

                {profile?.connections?.twitter ? (
                  <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform"></span>
                    Twitter: <span className="text-gray-200">{profile.connections.twitter}</span>
                  </li>
                ) : null}

                {profile?.connections?.instagram ? (
                  <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                    <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] group-hover:scale-125 transition-transform"></span>
                    Instagram: <span className="text-gray-200">{profile.connections.instagram}</span>
                  </li>
                ) : null}

                {!profile?.connections?.discord && !profile?.connections?.twitter && !profile?.connections?.instagram && (
                  <p className="text-sm text-gray-500 italic">Nenhuma rede social conectada.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onSave={updateProfileData}
      />

      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={user}
        profile={profile}
        favorites={sortedFavorites}
        library={library}
      />

    </>


  );
}