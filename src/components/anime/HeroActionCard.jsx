import { Plus, Heart, Trash2, Star } from 'lucide-react';
import { clsx } from 'clsx';

export function HeroActionCard({ anime, libraryEntry, status, handleStatusChange, handleIncrement, updateProgress, toggleFavorite, currentEp, totalEp, updateRating, onRemove }) {
    if (!libraryEntry) {
        return (
            <div className="bg-bg-secondary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-color shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-text-primary">Acompanhar</h3>
                    <button onClick={() => toggleFavorite(anime)} className="p-2 hover:bg-bg-tertiary rounded-full transition-colors group" title="Favoritar">
                        <Heart className="w-5 h-5 text-text-secondary group-hover:text-red-500 transition-colors" />
                    </button>
                </div>

                <p className="text-sm text-text-secondary">Adicione à sua lista para rastrear.</p>
                <button
                    onClick={() => handleStatusChange('watching')}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Adicionar à Lista
                </button>
            </div>
        );
    }

    return (
        <div className="bg-bg-secondary/90 backdrop-blur-xl p-5 rounded-2xl border border-border-color shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">Editar Progresso</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onRemove}
                        className="p-2 hover:bg-bg-tertiary rounded-full transition-colors group"
                        title="Remover da Biblioteca"
                    >
                        <Trash2 className="w-5 h-5 text-text-secondary group-hover:text-red-500 transition-colors" />
                    </button>
                    <button onClick={() => toggleFavorite(anime)} className="p-2 hover:bg-bg-tertiary rounded-full transition-colors">
                        <Heart className={`w-5 h-5 ${libraryEntry.isFavorite ? 'fill-red-500 text-red-500' : 'text-text-secondary'}`} />
                    </button>
                </div>
            </div>

            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            >
                <option value="watching">Assistindo</option>
                <option value="completed">Completo</option>
                <option value="plan_to_watch">Planejo Assistir</option>
                <option value="dropped">Dropado</option>
                <option value="paused">Pausado</option>
            </select>

            <div className="flex items-center gap-2 bg-bg-tertiary p-2 rounded-xl border border-border-color">
                <input
                    type="number"
                    value={currentEp}
                    onChange={(e) => updateProgress(libraryEntry.id, parseInt(e.target.value) || 0, totalEp)}
                    className="w-12 bg-transparent text-center font-bold text-text-primary outline-none"
                />
                <span className="text-text-secondary">/ {totalEp || '?'}</span>
                <button onClick={handleIncrement} className="ml-auto p-1.5 bg-primary rounded-lg text-text-on-primary hover:bg-primary-hover">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            {/* Rating Stars - Simplified */}
            <div className="flex justify-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer transition-transform hover:scale-110 ${(libraryEntry.score || 0) >= star * 2 ? "fill-yellow-400 text-yellow-400" : "text-text-secondary/40"}`}
                        onClick={() => updateRating(anime.id, star * 2)} // Mapping 1-5 stars to 2-10 score roughly
                    />
                ))}
            </div>
        </div>
    );
}
