import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CharacterListItem({ character, rank }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/character/${character.mal_id}`)}
            className="group flex items-center gap-6 p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-xl border border-transparent hover:border-border-color transition-all duration-300 cursor-pointer"
        >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-12 text-center">
                <span className="text-2xl font-black text-text-secondary/20 group-hover:text-primary/50 transition-colors">
                    #{rank}
                </span>
            </div>

            {/* Avatar */}
            <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-sm relative">
                <img
                    src={character.images?.jpg?.image_url}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                    {character.name}
                </h3>
                <p className="text-sm text-text-secondary truncate">
                    {character.name_kanji}
                </p>

                <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                        <Heart className="w-4 h-4 text-primary fill-primary/20" />
                        {character.favorites?.toLocaleString()}
                        <span className="text-text-secondary/50 text-xs font-normal ml-1">favoritos</span>
                    </div>
                </div>

                {/* About / Bio */}
                <p className="text-sm text-text-secondary/80 mt-3 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {character.about
                        ? character.about.replace(/\\n/g, ' ')
                        : "Sem informações disponíveis sobre este personagem."}
                </p>
            </div>

            {/* View Details Button (Desktop) */}
            <div className="hidden md:block">
                <button className="px-4 py-2 rounded-lg bg-bg-primary text-text-primary text-sm font-medium border border-border-color group-hover:border-primary group-hover:text-primary transition-all">
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
}
