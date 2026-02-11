import { useTopPeople } from '@/hooks/usePeople';
import { usePageTitle } from '@/hooks/usePageTitle';
import { VoiceActorCard } from '@/components/ui/VoiceActorCard';
import { Loader } from '@/components/ui/Loader';
import { Mic2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function VoiceActors() {
  const { data: people, isLoading } = useTopPeople();
  usePageTitle('Top Dubladores');

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8">
      
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
        {people?.map((person, index) => (
          <motion.div
            key={person.mal_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link to={`/person/${person.mal_id}`}>
                <VoiceActorCard person={person} index={index} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
