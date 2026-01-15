import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { AnimeTrackerList } from '@/components/profile/AnimeTrackerList';

export function Profile() {
  return (
    // ADICIONEI "font-sans" AQUI EMBAIXO 👇
    <div className="flex h-screen overflow-hidden bg-background-dark text-text-primary font-sans">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">

            <ProfileHeader />
            <ProfileStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <AchievementBadges />
                {/* O Tracker List atualizado será renderizado aqui */}
                <AnimeTrackerList />
              </div>

              {/* Coluna Lateral Direita */}
              <div className="space-y-6">
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Gêneros Favoritos</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Shonen', 'Cyberpunk', 'Psychological', 'Mecha'].map(genre => (
                      <span key={genre} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Conexões</h3>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span> Discord: Hunter#9921
                    </li>
                    <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> Twitter: @hunter_anime
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}