import { useState, useRef, useEffect } from 'react';
import { AnimeCarousel } from '@/components/ui/AnimeCarousel';
import { useGenreAnime } from '@/hooks/useJikan';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

export function LazyAnimeCarousel({ id, title, icon: Icon, genreId }) {
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
