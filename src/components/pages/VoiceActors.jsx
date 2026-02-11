import { useEffect, useRef } from 'react';
import { useTopPeople } from '@/hooks/usePeople';
import { usePageTitle } from '@/hooks/usePageTitle';
import { VoiceActorCard } from '@/components/ui/VoiceActorCard';
import { Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function VoiceActors() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    error
  } = useTopPeople();
  
  usePageTitle('Top Dubladores');

  // Intersection Observer for Infinite Scroll
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the sentinel is visible
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="flex flex-col gap-3 rounded-xl overflow-hidden bg-bg-secondary p-4 animate-pulse border border-white/5">
        <div className="w-full aspect-[2/3] bg-white/5 rounded-lg" />
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
    </div>
  );

  const people = data?.pages.flatMap(page => page.data) || [];

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary flex items-center gap-3">
            <Mic2 className="w-8 h-8 text-primary" /> Top Pessoas da Indústria
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            As pessoas mais populares da indústria de animes.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {people.map((person, index) => (
          <motion.div
            key={`${person.mal_id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index % 20) * 0.05 }}
          >
            <Link to={`/person/${person.mal_id}`}>
                <VoiceActorCard person={person} index={index} />
            </Link>
          </motion.div>
        ))}
        
        {/* Loading Skeletons (Initial or Appending) */}
        {(isLoading || isFetchingNextPage) && (
             Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
             ))
        )}
      </div>

      {/* Sentinel Element for Infinite Scroll */}
      <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center p-4">
      </div>
      
    </div>
  );
}
