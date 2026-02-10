import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export function RoleCard({ role }) {
  const anime = role.anime;
  const character = role.character;

  return (
    <div className="flex bg-bg-secondary rounded-xl overflow-hidden border border-border-color hover:border-primary/50 transition-all duration-300 group h-32 relative">
      {/* Anime Side (Left) */}
      <Link to={`/anime/${anime.mal_id}`} className="w-24 shrink-0 relative overflow-hidden">
        <img 
          src={anime.images?.jpg?.image_url} 
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
        
        {/* Score Badge */}
        {role.anime.score && (
            <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold text-white border border-white/10">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                {role.anime.score}
            </div>
        )}
      </Link>

      {/* Info Middle */}
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0 border-r border-border-color/50 border-dashed">
        <Link to={`/anime/${anime.mal_id}`} className="text-sm font-bold text-text-primary hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
          {anime.title}
        </Link>
        <span className="text-xs text-text-secondary italic line-clamp-1 mb-2">
           Papel: <span className="text-primary font-medium">{role.role}</span>
        </span>
      </div>

      {/* Character Info (Right Middle) */}
      <div className="flex-1 p-3 flex flex-col justify-center items-end text-right min-w-0">
        <Link to={`/character/${character.mal_id}`} className="text-sm font-bold text-text-primary hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
          {character.name}
        </Link>
        <span className="text-xs text-text-secondary line-clamp-1">
          Personagem
        </span>
      </div>

      {/* Character Image (Right) */}
      <Link to={`/character/${character.mal_id}`} className="w-24 shrink-0 relative overflow-hidden">
        <img 
          src={character.images?.jpg?.image_url} 
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </Link>
    </div>
  );
}
