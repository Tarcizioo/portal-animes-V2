import { useState, useRef, useEffect } from 'react';
import { AnimeCarousel } from '@/components/ui/AnimeCarousel';
import { useGenreAnime } from '@/hooks/useAnimeDiscovery';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

export function LazyAnimeCarousel({ id, title, icon: Icon, genreId }) {
    const [isVisible, setIsVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const containerRef = useRef(null);

    // Fetch data only when visible
    const { data: animes, isLoading } = useGenreAnime(genreId, isVisible);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Force strict minimum delay to prevent skeleton flickering
    useEffect(() => {
        if (isVisible && !isLoading && animes?.length > 0) {
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 600); // 600ms smoothing delay
            return () => clearTimeout(timer);
        }
    }, [isVisible, isLoading, animes]);

    return (
        <div ref={containerRef} className="min-h-[340px]">
            {showContent ? (
                <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
                    <AnimeCarousel
                        id={id}
                        title={title}
                        icon={Icon}
                        animes={animes}
                    />
                </div>
            ) : (
                /* Loading Skeleton State */
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6 px-1">
                        {Icon && <Icon className="w-6 h-6 text-primary/40 animate-pulse" />}
                        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
