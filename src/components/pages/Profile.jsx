import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { AnimeTrackerList } from '@/components/profile/AnimeTrackerList';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { FavoriteAnimes } from '@/components/profile/FavoriteAnimes';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LogIn, Hash, Link as LinkIcon } from 'lucide-react';

export function Profile() {
  const { user, signInGoogle, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfileData } = useUserProfile();
  const { library } = useAnimeLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);

  usePageTitle('Meu Perfil');

  const loading = authLoading || (user && profileLoading);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center p-4">
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
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">

            <ProfileHeader
              user={user}
              profile={profile}
              onEdit={() => setIsModalOpen(true)}
            />

            <ProfileStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <FavoriteAnimes favorites={library?.filter(a => a.isFavorite) || []} />
                <AchievementBadges />
                <AnimeTrackerList />
              </div>

              {/* Coluna Lateral Direita */}
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
          <Footer />
        </main>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onSave={updateProfileData}
      />

    </div>
  );
}