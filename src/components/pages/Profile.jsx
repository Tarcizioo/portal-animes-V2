import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

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
import { LogIn, Hash, Link as LinkIcon, Monitor, X } from 'lucide-react';

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

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-10">
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
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-10">
        <ProfileHeader
          user={user}
          profile={profile}
          onEdit={() => setIsModalOpen(true)}
          onShare={() => setIsShareModalOpen(true)}
        />

        <ProfileStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <FavoritesWidget
              animeFavorites={sortedFavorites}
              characterFavorites={sortedCharFavorites}
              onReorderAnimes={handleFavoritesReorder}
              onReorderCharacters={handleCharFavoritesReorder}
              preferredView={profile?.preferredFavoritesView}
              onSetPreferredView={handleSetPreferredView}
            />
            <AchievementBadges />
          </div>

          <div className="space-y-6">
            {/* Gêneros Favoritos */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Gêneros Favoritos
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
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" /> Estúdios Favoritos
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
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" /> Conexões
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