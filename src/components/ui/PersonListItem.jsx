import { useNavigate } from 'react-router-dom';

export function PersonListItem({ person, rank }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/person/${person.id || person.mal_id}`)}
            className="group flex items-center gap-6 p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-xl border border-transparent hover:border-border-color transition-all duration-300 cursor-pointer"
        >
            {/* Rank Badge */}
            {rank && (
                <div className="flex-shrink-0 w-12 text-center">
                    <span className="text-2xl font-black text-text-secondary/20 group-hover:text-primary/50 transition-colors">
                        #{rank}
                    </span>
                </div>
            )}

            {/* Avatar */}
            <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-sm relative">
                <img
                    src={person.image || person.images?.jpg?.image_url}
                    alt={person.title || person.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                    {person.title || person.name}
                </h3>

                {/* About / Bio */}
                <p className="text-sm text-text-secondary/80 mt-3 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {person.about
                        ? person.about.replace(/\\n/g, ' ')
                        : "Sem informações disponíveis sobre esta pessoa."}
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
