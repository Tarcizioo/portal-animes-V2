import { Star, Users, Calendar, MonitorPlay, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AnimeListItem({ id, title, image, score, synopsis, status, members, year, episodes, type, genres }) {
    // Limita a sinopse para não ficar gigante
    const truncatedSynopsis = synopsis?.length > 250 ? synopsis.substring(0, 250) + "..." : synopsis;

    const statusColor = status === 'Currently Airing' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
        status === 'Finished Airing' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
            'text-text-secondary border-text-secondary/30 bg-text-secondary/10';

    return (
        <Link to={`/anime/${id}`} className="group flex flex-col sm:flex-row gap-5 bg-bg-secondary border border-border-color rounded-xl p-4 hover:border-button-accent transition-all hover:shadow-lg hover:shadow-button-accent/5">

            {/* Imagem (Capa) */}
            <div className="shrink-0 w-full sm:w-32 aspect-[2/3] rounded-lg overflow-hidden relative">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {score}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 flex flex-col min-w-0">

                <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-button-accent transition-colors line-clamp-1">{title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-text-secondary">
                            {type && <span className="flex items-center gap-1"><MonitorPlay className="w-3.5 h-3.5" /> {type}</span>}
                            {year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {year}</span>}
                            {episodes && <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" /> {episodes} eps</span>}
                            {members && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {members.toLocaleString()}</span>}
                        </div>
                    </div>

                    {status && (
                        <span className={`px-2 py-1 rounded-md border text-xs font-bold uppercase tracking-wider whitespace-nowrap ${statusColor}`}>
                            {status === 'Currently Airing' ? 'Lançando' : status === 'Finished Airing' ? 'Completo' : status}
                        </span>
                    )}
                </div>

                <div className="my-3 flex flex-wrap gap-2">
                    {genres.split(', ').map(g => (
                        <span key={g} className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary border border-border-color">{g}</span>
                    ))}
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                    {truncatedSynopsis || "Sem sinopse disponível."}
                </p>

            </div>
        </Link>
    );
}
