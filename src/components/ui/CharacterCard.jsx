import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CharacterCard({ character, rank }) {
    return (
        <Link to={`/character/${character.mal_id}`} className="block group relative bg-bg-secondary rounded-2xl overflow-hidden shadow-sm border border-border-color hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* Imagem */}
            <div className="aspect-[3/4] overflow-hidden relative">
                <img
                    src={character.images?.jpg?.image_url}
                    alt={character.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay for visual consistency */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Rank Number (Large & Bold like reference) */}
                {/* Rank Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                    <span className="text-white font-bold text-sm">#{rank}</span>
                </div>
            </div>

            {/* Info Footer */}
            <div className="p-4 bg-bg-secondary group-hover:bg-bg-tertiary transition-colors">
                <h3 className="text-base font-bold text-text-primary truncate mb-3" title={character.name}>
                    {character.name}
                </h3>

                <div className="flex items-center justify-between">
                    {/* Kanji Badge */}
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md truncate max-w-[60%] border border-primary/20">
                        {character.name_kanji || 'N/A'}
                    </span>

                    {/* Favorites */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{(character.favorites || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
