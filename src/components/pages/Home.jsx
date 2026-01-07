import { BarChart2, Calendar } from 'lucide-react';
import { Sidebar } from "../layout/Sidebar";
import { Header } from "../layout/Header";
import { Hero } from "../home/Hero";
import { AnimeCarousel } from '../ui/AnimeCarousel';
import { useJikan } from '../../hooks/useJikan';
import { SkeletonHero } from '../ui/SkeletonHero';
import { SkeletonCard } from '../ui/SkeletonCard';

export function Home() { 
  const { heroAnime, popularAnimes, seasonalAnimes, loading } = useJikan();

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
            </>
          )}
        </div>
      </main>
    </div>
  );
}