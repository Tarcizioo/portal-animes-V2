import { useEffect, useRef } from 'react'; // Adicionado useEffect e useRef
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { AnimeCard } from '../ui/AnimeCard';
import { useCatalog } from '../../hooks/useCatalog';
import { Loader2 } from 'lucide-react';

export function Catalog() {
  const { animes, loading, loadMore, hasMore } = useCatalog();
  const sentinelRef = useRef(null); // Referência para o elemento "sentinela"

  // Configura o "Observador" para o Scroll Infinito
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Se o elemento sentinela aparecer na tela (isIntersecting)
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, { rootMargin: "100px" }); // Carrega quando estiver a 100px do fim

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect(); // Limpeza quando sair da página
  }, [hasMore, loading, loadMore]);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark dark text-white font-sans">
      <Sidebar />
      
      <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-background-dark">
        <Header />

        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Explorar Catálogo</h1>
            <p className="text-gray-400">Descubra os animes mais bem avaliados de todos os tempos.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {animes.map((anime) => (
              <AnimeCard 
                key={anime.id}
                id={anime.id}
                title={anime.title}
                genre={anime.genres}
                image={anime.image}
                score={anime.score}
              />
            ))}
          </div>

          {/* Área de Carregamento Automático (O Sentinela) */}
          <div 
            ref={sentinelRef} 
            className="mt-12 flex justify-center pb-10 h-20 items-center"
          >
            {loading && hasMore && (
              <div className="flex items-center gap-2 text-primary">
                 <Loader2 className="w-6 h-6 animate-spin" />
                 <span className="font-bold">Carregando mais animes...</span>
              </div>
            )}
            
            {!hasMore && (
              <p className="text-gray-500 italic">Você chegou ao fim da lista!</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}