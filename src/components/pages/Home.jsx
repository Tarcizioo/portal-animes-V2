import { BarChart2, Calendar, Zap, Heart, Theater, Skull, Smile, Wand2, Rocket, Trophy } from 'lucide-react';

import { Hero } from "@/components/home/Hero";
import { AnimeCarousel } from '@/components/ui/AnimeCarousel';
import { LazyAnimeCarousel } from '@/components/home/LazyAnimeCarousel';

import { useJikan } from '@/hooks/useJikan';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SkeletonHero } from '@/components/ui/SkeletonHero';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

const genreCategories = [
  { id: 'action', title: 'Ação e Adrenalina', icon: Zap, genreId: 1 },
  { id: 'romance', title: 'Romance e Amor', icon: Heart, genreId: 22 },
  { id: 'drama', title: 'Drama e Emoção', icon: Theater, genreId: 8 },
  { id: 'horror', title: 'Terror e Suspense', icon: Skull, genreId: 14 },
  { id: 'comedy', title: 'Comédia e Diversão', icon: Smile, genreId: 4 },
  { id: 'fantasy', title: 'Mundo da Fantasia', icon: Wand2, genreId: 10 },
  { id: 'scifi', title: 'Ficção Científica', icon: Rocket, genreId: 24 },
  { id: 'sports', title: 'Esportes & Competição', icon: Trophy, genreId: 30 },
];

export function Home() {
  const {
    featuredAnimes,
    heroAnime,
    popularAnimes,
    seasonalAnimes,
    loading
  } = useJikan();

  usePageTitle('Início');

  return (

    <div className="p-6 lg:p-10 space-y-12">
      {loading ? (
        <>
          <SkeletonHero />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-300 dark:bg-surface-dark/50 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-300 dark:bg-surface-dark/50 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i + 10} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <Hero animes={featuredAnimes} />

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
          {genreCategories.map((category) => (
            <LazyAnimeCarousel
              key={category.id}
              id={category.id}
              title={category.title}
              icon={category.icon}
              genreId={category.genreId}
            />
          ))}
        </>
      )}
    </div>

  );
}
