
import { useCharacters } from '@/hooks/useCharacters';
import { usePageTitle } from '@/hooks/usePageTitle';
import { CharacterCard } from '@/components/ui/CharacterCard';
import { LayoutGrid, List, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CharacterListItem } from '@/components/ui/CharacterListItem';

export function Characters() {
    const { characters, loading, loadMore, hasMore } = useCharacters();
    const sentinelRef = useRef(null);

    // Persisted View Mode
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('anime_chars_view_mode') || 'grid';
    });

    useEffect(() => {
        localStorage.setItem('anime_chars_view_mode', viewMode);
    }, [viewMode]);

    usePageTitle('Personagens');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) loadMore();
        }, { rootMargin: "200px" });

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading, loadMore]);

    return (

        <div className="min-h-screen bg-bg-primary text-text-primary font-sans pb-20">
            <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">

                {/* Header da Página */}
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-3 flex items-center gap-3 tracking-tight">
                            <span className="p-2 md:p-3 bg-primary/10 rounded-2xl text-primary">
                                <Users className="w-8 h-8 md:w-10 md:h-10" />
                            </span>
                            Top Personagens
                        </h1>
                        <p className="text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed">
                            Os ícones que marcaram gerações. Vote nos seus favoritos e descubra novas lendas.
                        </p>
                    </div>

                    {/* View Toggles */}
                    <div className="flex items-center gap-1 bg-bg-secondary p-1.5 rounded-xl border border-border-color self-start md:self-auto shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-bg-tertiary text-primary shadow-sm ring-1 ring-border-color' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}`}
                            title="Visualização em Grade"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-bg-tertiary text-primary shadow-sm ring-1 ring-border-color' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}`}
                            title="Visualização em Lista"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {viewMode === 'grid' ? (
                    /* GRID VIEW */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                        {characters.map((char, index) => (
                            <CharacterCard
                                key={char.mal_id}
                                character={char}
                                rank={index + 1}
                            />
                        ))}
                        {loading && Array.from({ length: 10 }).map((_, i) => (
                            <div key={`skeleton-${i}`} className="bg-bg-secondary rounded-3xl overflow-hidden shadow-sm border border-border-color aspect-[3/4] animate-pulse relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* LIST VIEW */
                    <div className="flex flex-col gap-4">
                        {characters.map((char, index) => (
                            <CharacterListItem
                                key={char.mal_id}
                                character={char}
                                rank={index + 1}
                            />
                        ))}
                        {loading && Array.from({ length: 5 }).map((_, i) => (
                            <div key={`skeleton-list-${i}`} className="h-24 bg-bg-secondary rounded-2xl animate-pulse border border-border-color"></div>
                        ))}
                    </div>
                )}

                {/* Sentinel para Infinite Scroll */}
                <div ref={sentinelRef} className="h-20 mt-8 flex items-center justify-center">
                    {loading && characters.length > 0 && (
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    )}
                </div>

                {!loading && characters.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-4">
                        <Users className="w-16 h-16 opacity-20" />
                        <p className="text-lg font-medium">Nenhum personagem encontrado.</p>
                    </div>
                )}

            </div>
        </div>

    );
}
