import { Link } from 'react-router-dom';
import { Info, Plus, Star, PlayCircle, TrendingUp, Calendar } from 'lucide-react';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export function Hero({ anime }) {
  const { library, addToLibrary } = useAnimeLibrary();
  const { user } = useAuth();
  const { toast } = useToast();

  const isInLibrary = library?.some(item => item.id === anime?.id);

  const handleAddToList = async () => {
    if (!user) {
      toast.warning("Faça login para adicionar à sua lista!");
      return;
    }
    try {
      await addToLibrary(anime);
      toast.success("Adicionado à lista com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar à lista.");
    }
  };

  if (!anime) {
    return (
      <div className="w-full h-[650px] rounded-3xl bg-gray-800 animate-pulse flex items-center justify-center">
        <span className="text-gray-500 font-medium">Carregando destaque...</span>
      </div>
    );
  }

  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl group min-h-[650px] flex items-end md:items-center transition-all duration-700">

      {/* --- BACKGROUND (Clara & Colorida + Blur Leve) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#121214]">
        <img
          src={anime.images?.jpg?.large_image_url || anime.image}
          alt={anime.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out 
                       opacity-80 scale-105 blur-sm
                       group-hover:opacity-100 group-hover:scale-100 group-hover:blur-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121214] via-[#121214]/50 to-transparent" />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 p-6 md:p-12 w-full max-w-[95%] lg:max-w-[90%] flex flex-col md:flex-row items-end md:items-center gap-6 md:gap-12 mr-auto">

        {/* POSTER (Left Side) - Moves up on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block flex-shrink-0 w-[300px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/10 group-hover:border-white/30 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
        >
          <img
            src={anime.images?.jpg?.large_image_url || anime.image}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* INFO (Right Side) */}
        <div className="flex-1 space-y-6 text-center md:text-left pb-10 md:pb-0">

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-3"
          >
            <span className="bg-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-1.5 cursor-default border border-white/5">
              <TrendingUp className="w-3.5 h-3.5" /> Destaque
            </span>
            <span className="bg-black/30 backdrop-blur-md border border-white/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-default">
              <Star className="w-3.5 h-3.5 fill-current" /> {anime.score || 'N/A'}
            </span>
            <span className="bg-black/30 backdrop-blur-md border border-white/10 text-gray-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-default">
              <Calendar className="w-3.5 h-3.5" /> {anime.year || 'N/A'}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] drop-shadow-2xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70">
              {anime.title}
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center md:justify-start gap-2"
          >
            {anime.genres && anime.genres.slice(0, 3).map((genre, index) => (
              <span
                key={`${genre?.mal_id || index}`}
                className="text-gray-200 font-medium text-xs md:text-sm px-4 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default"
              >
                {genre?.name || genre}
              </span>
            ))}
          </motion.div>

          {/* Synopsis */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl mx-auto md:mx-0 font-light drop-shadow-md"
          >
            {anime.synopsis}
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4"
          >
            <MotionLink
              to={`/anime/${anime.mal_id || anime.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
              <Info className="w-5 h-5" /> Ver Detalhes
            </MotionLink>

            {!isInLibrary ? (
              <motion.button
                onClick={handleAddToList}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/5 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/10 hover:border-white/30"
              >
                <Plus className="w-5 h-5" /> Minha Lista
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 px-8 py-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-bold backdrop-blur-md cursor-default">
                <PlayCircle className="w-5 h-5" /> Na sua Lista
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}