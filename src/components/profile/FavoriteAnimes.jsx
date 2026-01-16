import { Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FavoriteAnimes({ favorites }) {
    const slots = [0, 1, 2]; // 3 slots fixos

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-primary flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Animes Favoritos
                </h3>
                <span className="text-xs font-bold bg-bg-tertiary text-text-secondary px-2 py-1 rounded-md">
                    {favorites.length} / 3
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {slots.map((index) => {
                    const anime = favorites[index];

                    if (anime) {
                        return (
                            <Link
                                to={`/anime/${anime.id}`}
                                key={anime.id}
                                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-tertiary border border-border-color shadow-lg transition-transform hover:-translate-y-1"
                            >
                                <img
                                    src={anime.image}
                                    alt={anime.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-3 w-full">
                                    <h4 className="text-white text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">
                                        {anime.title}
                                    </h4>
                                </div>
                                {/* Badge de TOP */}
                                <div className="absolute top-2 right-2">
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500 drop-shadow-lg" />
                                </div>
                            </Link>
                        );
                    }

                    // Slot Vazio
                    return (
                        <div
                            key={`empty-${index}`}
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-border-color bg-bg-tertiary/30 flex flex-col items-center justify-center gap-2 text-text-secondary hover:border-text-secondary/50 transition-colors group cursor-default"
                        >
                            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5 opacity-50" />
                            </div>
                            <span className="text-xs font-medium opacity-50">Vazio</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
