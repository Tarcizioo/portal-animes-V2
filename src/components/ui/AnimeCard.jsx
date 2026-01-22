import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AnimeCard({ id, title, genre, image, score }) {
  return (
    <Link to={`/anime/${id}`} className="block group relative cursor-pointer">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow duration-300"
      >
        {/* Imagem */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 will-change-transform"
        />

        {/* Overlay com Gradiente e Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
            Ver Detalhes
          </span>
        </div>

        {/* Nota (Badge) com Glassmorphism Visual */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-bold">{score}</span>
        </div>
      </motion.div>

      {/* Título e Gênero */}
      <div className="space-y-1">
        <h3 className="text-text-primary font-bold truncate group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-text-secondary text-xs truncate">
          {genre}
        </p>
      </div>
    </Link>
  );
}