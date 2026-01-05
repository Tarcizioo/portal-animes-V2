import { BarChart2, Calendar } from 'lucide-react';
import { Sidebar } from "../layout/Sidebar";
import { Header } from "../layout/Header";
import { Hero } from "../home/Hero";
import { AnimeCarousel } from '../ui/AnimeCarousel';
import { useJikan } from '../../hooks/useJikan';

export function Home() { 
  const { heroAnime, popularAnimes, seasonalAnimes, loading } = useJikan();

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark dark text-text-primary font-sans">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative">
        <Header />
        <div className="p-6 lg:p-10 space-y-12 pb-24">
          {loading ? (
             <div className="flex items-center justify-center h-[500px]">
                 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
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