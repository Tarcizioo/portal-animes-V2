import { Link } from 'react-router-dom';
import { Info, Plus, Star } from 'lucide-react';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);

export function Hero({ anime }) {
  const { library, addToLibrary } = useAnimeLibrary();
  const { user } = useAuth();
  const { toast } = useToast();

  const isInLibrary = library.some(item => item.id === anime?.id);

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
      <div className="w-full h-[500px] rounded-3xl bg-gray-800 animate-pulse flex items-center justify-center">
        <span className="text-gray-500 font-medium">Carregando destaque...</span>
      </div>
    );
  }

  return (
    <section className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
      {/* Imagem de Fundo */}
      <img
        src={anime.image}
        alt={anime.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 blur-sm"
        onError={(e) => {
          e.target.src = "https://placehold.co/1200x600/1a1a1a/666?text=Imagem+Indisponível";
        }}
      />

      {/* Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/60 to-transparent lg:bg-gradient-to-r lg:from-[#121214] lg:via-[#121214]/80 lg:to-transparent"></div>

      {/* Conteúdo */}
      <div className="relative z-10 h-full flex flex-col justify-end lg:justify-center p-8 lg:p-12 max-w-4xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            {anime.isNew ? 'TOP #1' : 'Destaque'}
          </span>
          <span className="flex items-center text-yellow-400 text-sm font-semibold gap-1">
            <Star className="w-4 h-4 fill-current" /> {anime.score}
          </span>
          <span className="text-gray-300 text-sm flex items-center gap-1">
            {anime.year}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl lg:text-6xl font-black text-white mb-4 leading-tight"
        >
          {anime.title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {anime.genres && anime.genres.map((genre, index) => (
            <span
              key={`${genre}-${index}`}
              className="text-text-accent font-medium text-sm bg-text-accent/10 border border-text-accent/20 px-3 py-1 rounded-full backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 mb-8 line-clamp-3 max-w-2xl text-lg leading-relaxed"
        >
          {anime.synopsis}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4"
        >
          <MotionLink
            to={`/anime/${anime.id}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-button-accent hover:bg-button-accent/90 text-text-on-primary px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-button-accent/30 cursor-pointer"
          >
            <Info className="w-5 h-5" /> Ver Detalhes
          </MotionLink>

          {!isInLibrary && (
            <motion.button
              onClick={handleAddToList}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 transition-colors border border-white/10 cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Minha Lista
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
}