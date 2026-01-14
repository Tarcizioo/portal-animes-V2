import { BarChart2, Calendar, Zap, Heart, Theater, Skull, Smile, Wand2, Rocket, Trophy } from 'lucide-react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { AnimeCarousel } from '@/components/ui/AnimeCarousel';

import { useJikan, useGenreAnime } from '@/hooks/useJikan';
import { SkeletonHero } from '@/components/ui/SkeletonHero';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useState, useRef, useEffect } from 'react';

export function Home() {
  const {
    heroAnime,
    popularAnimes,
    seasonalAnimes,
    loading
  } = useJikan();

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-primary font-sans">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative">
        <Header />
        <div className="p-6 lg:p-10 space-y-12 pb-24">
          {loading ? (
            <>
              <SkeletonHero />
              <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-300 dark:bg-surface-dark/50 rounded animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-8 w-64 bg-gray-300 dark:bg-surface-dark/50 rounded animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonCard key={i + 10} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <Hero anime={heroAnime} />

              <AnimeCarousel
                id="popular"
                title="Animes Populares"
                icon={BarChart2}
                animes={popularAnimes}
              />

              <AnimeCarousel
                id="seasonal"
                title="Lançamentos da Temporada"
                icon={Calendar}
                animes={seasonalAnimes}
              />

              {/* --- CAROUSEIS (Lazy Loaded) --- */}
              {/* Action = 1 */}
              <LazyAnimeCarousel
                id="action"
                title="Ação e Adrenalina"
                icon={Zap}
                genreId={1}
              />

              {/* Romance = 22 */}
              <LazyAnimeCarousel
                id="romance"
                title="Romance e Amor"
                icon={Heart}
                genreId={22}
              />

              {/* Drama = 8 */}
              <LazyAnimeCarousel
                id="drama"
                title="Drama e Emoção"
                icon={Theater}
                genreId={8}
              />

              {/* Horror = 14 */}
              <LazyAnimeCarousel
                id="horror"
                title="Terror e Suspense"
                icon={Skull}
                genreId={14}
              />

              {/* Comedy = 4 */}
              <LazyAnimeCarousel
                id="comedy"
                title="Comédia e Diversão"
                icon={Smile}
                genreId={4}
              />

              {/* Fantasy = 10 */}
              <LazyAnimeCarousel
                id="fantasy"
                title="Mundo da Fantasia"
                icon={Wand2}
                genreId={10}
              />

              {/* Sci-Fi = 24 */}
              <LazyAnimeCarousel
                id="scifi"
                title="Ficção Científica"
                icon={Rocket}
                genreId={24}
              />

              {/* Sports = 30 */}
              <LazyAnimeCarousel
                id="sports"
                title="Esportes & Competição"
                icon={Trophy}
                genreId={30}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function LazyAnimeCarousel({ id, title, icon: Icon, genreId }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Fetch data only when visible
  const { data: animes, isLoading } = useGenreAnime(genreId, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { rootMargin: '100px' } // Load slightly before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[300px]">
      {(isVisible && !isLoading && animes) ? (
        <AnimeCarousel
          id={id}
          title={title}
          icon={Icon}
          animes={animes}
        />
      ) : (
        /* Loading Skeleton State */
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            {Icon && <Icon className="w-8 h-8 text-primary/50 animate-pulse" />}
            <div className="h-8 w-48 bg-gray-200 dark:bg-surface-dark rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}