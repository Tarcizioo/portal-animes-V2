import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useCharacters } from '@/hooks/useCharacters';
import { usePageTitle } from '@/hooks/usePageTitle';
import { CharacterCard } from '@/components/ui/CharacterCard';
import { LayoutGrid, List, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CharacterListItem } from '@/components/ui/CharacterListItem'; // [NEW] Import

export function Characters() {
    const { characters, loading, loadMore, hasMore } = useCharacters();
    const sentinelRef = useRef(null);

    // [NEW] Persisted View Mode
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
        <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary font-sans">
            <Sidebar />

            <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-surface-dark scrollbar-track-bg-primary">
                <Header />

                <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">

                    {/* Header da Página */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-text-primary mb-2 flex items-center gap-3">
                                <Users className="w-10 h-10 text-primary" />
                                Top Personagens
                            </h1>
                            <p className="text-lg text-text-secondary">
                                Os personagens mais amados pela comunidade mundial.
                            </p>
                        </div>

                        {/* View Toggles */}
                        <div className="flex items-center gap-2 bg-bg-secondary p-1 rounded-lg border border-border-color self-start md:self-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-bg-tertiary text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                title="Visualização em Grade"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-bg-tertiary text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                title="Visualização em Lista"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    {viewMode === 'grid' ? (
                        /* GRID VIEW */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {characters.map((char, index) => (
                                <CharacterCard
                                    key={char.mal_id}
                                    character={char}
                                    rank={index + 1}
                                />
                            ))}
                            {loading && Array.from({ length: 10 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="bg-bg-secondary rounded-2xl overflow-hidden shadow-sm border border-border-color aspect-[3/4] animate-pulse relative">
                                    <div className="absolute inset-0 bg-gray-700/50"></div>
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
                                <div key={`skeleton-list-${i}`} className="h-24 bg-bg-secondary rounded-xl animate-pulse border border-border-color"></div>
                            ))}
                        </div>
                    )}

                    {/* Sentinel para Infinite Scroll */}
                    <div ref={sentinelRef} className="h-10 mt-8" />

                    {!loading && characters.length === 0 && (
                        <p className="text-text-secondary text-center mt-10">Nenhum personagem encontrado.</p>
                    )}

                </div>
            </main>
        </div>
    );
}
