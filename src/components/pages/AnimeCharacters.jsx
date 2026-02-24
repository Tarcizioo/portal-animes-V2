import { useParams, Link } from 'react-router-dom';
import { useAnimeInfo } from '@/hooks/useAnimeInfo';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader } from '@/components/ui/Loader';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { BackButton } from '@/components/ui/BackButton';

export function AnimeCharacters() {
    const { id } = useParams();
    const { anime, characters, loading } = useAnimeInfo(id);
    
    usePageTitle(anime ? `${anime.title} - Personagens` : 'Personagens do Anime');

    if (loading) {
        return (
            <div className="flex bg-bg-primary h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!anime) {
        return (
            <div className="flex bg-bg-primary text-text-primary items-center justify-center h-screen">
                <p>Anime não encontrado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans pb-20">
            <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
                
                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <div className="mb-6">
                        <BackButton label="Voltar para o Anime" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-3 flex items-center gap-3 tracking-tight">
                                <span className="p-2 md:p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Users className="w-8 h-8 md:w-10 md:h-10" />
                                </span>
                                Personagens
                            </h1>
                            <p className="text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed">
                                Conheça os personagens e os dubladores responsáveis por <span className="text-primary font-bold">{anime.title}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Characters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {characters.map((char, index) => (
                        <motion.div
                            key={`${char.character.mal_id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: (Math.min(index, 20)) * 0.05 }}
                        >
                            <Link 
                                to={`/character/${char.character.mal_id}`}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-bg-secondary border border-border-color hover:border-primary/50 hover:bg-white/5 transition-all group h-full"
                            >
                                <div className="size-16 rounded-full overflow-hidden bg-bg-tertiary shrink-0 border-2 border-transparent group-hover:border-primary transition-colors">
                                    <img 
                                        src={char.character.images?.jpg?.image_url} 
                                        alt={char.character.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="text-base font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                                        {char.character.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 text-text-secondary px-2 py-0.5 rounded-md truncate max-w-full">
                                            {char.role}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                    {characters.length === 0 && (
                        <div className="col-span-full py-20 text-center text-text-secondary">
                            <p>Nenhuma informação de elenco disponível.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
