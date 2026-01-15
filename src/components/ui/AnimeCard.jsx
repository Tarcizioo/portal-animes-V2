import { Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom'; // <--- Importante: Importar o Link

// Adicione o "id" nas propriedades que o card recebe
export function AnimeCard({ id, title, genre, image, score }) {
  return (
    // Envolvemos tudo no Link para tornar clicável
    <Link to={`/anime/${id}`} className="block group relative cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
        {/* Imagem */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Escuro (aparece no hover) */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        </div>

        {/* Nota (Badge) */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-bold">{score}</span>
        </div>
      </div>

      {/* Título e Gênero */}
      <div>
        <h3 className="text-text-primary font-bold truncate group-hover:text-button-accent transition-colors">
          {title}
        </h3>
        <p className="text-text-secondary text-xs truncate">
          {genre}
        </p>
      </div>
    </Link>
  );
}