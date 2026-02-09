import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Star, Clock, Users, Trophy, Play, CheckCircle, Plus, Heart, Share2,
    Calendar, Monitor, Globe, Film, List, MessageSquare, ThumbsUp, Reply,
    ChevronDown, ArrowRight, PlayCircle, Layers, Mic2, Info, AlertCircle, ZoomIn, X
} from 'lucide-react';

import { useAnimeInfo } from '@/hooks/useAnimeInfo';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { Loader } from '@/components/ui/Loader';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimeDetails() {
    const { id } = useParams();
    const { anime, characters, recommendations, loading } = useAnimeInfo(id);
    const { user } = useAuth();
    const { toast } = useToast();
    const { library, addToLibrary, incrementProgress, updateProgress, updateRating, toggleFavorite, removeFromLibrary } = useAnimeLibrary();

    usePageTitle(anime?.title || 'Detalhes');

    const libraryEntry = library.find(a => a.id.toString() === id);
    const [status, setStatus] = useState('plan_to_watch');

    useEffect(() => {
        if (libraryEntry) {
            setStatus(libraryEntry.status);
        }
    }, [libraryEntry]);

    const [isVisible, setIsVisible] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleRemoveConfirm = async () => {
        if (libraryEntry) {
            await removeFromLibrary(libraryEntry.id);
            toast.success("Anime removido da biblioteca.");
            setStatus('plan_to_watch'); // Reset status visual
        }
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        if (user) {
            addToLibrary(anime, newStatus);
        } else {
            toast.warning("Faça login para salvar animes na sua lista!");
        }
    };

    const handleIncrement = () => {
        if (user && libraryEntry) {
            incrementProgress(libraryEntry.id, libraryEntry.currentEp, libraryEntry.totalEp);
        } else if (user && anime) {
            addToLibrary(anime, 'watching');
        }
    };

    const currentEp = libraryEntry?.currentEp || 0;
    const totalEp = anime?.episodes || 0;

    if (loading) {
        return (

            <div className="flex h-[80vh] items-center justify-center">
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

    const bannerImage = anime.banner || anime.image;

    return (

        <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white pb-20">

            {/* --- HERO SECTION --- */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full min-h-[50vh] lg:h-[65vh] flex items-end"
            >
                {/* Background & Gradients */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
                        style={{ backgroundImage: `url('${bannerImage}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/50 to-transparent z-10" />
                </div>

                {/* Conteúdo do Hero */}
                <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pb-8 lg:pb-16">
                    <div className={`grid lg:grid-cols-12 gap-8 items-end transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                        {/* Poster (Mobile: Visible / Desktop: Visible) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-3 xl:col-span-2 order-2 lg:order-1 flex justify-center lg:block mb-6 lg:mb-0"
                        >
                            <div
                                onClick={() => setIsZoomOpen(true)}
                                className="w-48 sm:w-64 lg:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-bg-secondary relative group cursor-zoom-in"
                            >
                                <img src={anime.image} alt={anime.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Info Principal */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4 order-1 lg:order-2 mb-6 lg:mb-0 text-center lg:text-left items-center lg:items-start pt-6 lg:pt-0"
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                <span className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
                                    {anime.type || 'TV'}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider">
                                    {anime.year || 'Unknown'}
                                </span>
                                {anime.status && (
                                    <span className={clsx(
                                        "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border backdrop-blur-md",
                                        anime.status === 'Finished Airing'
                                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                            : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                    )}>
                                        {anime.status === 'Finished Airing' ? 'Completo' : 'Em Lançamento'}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-2xl">
                                {anime.title}
                            </h1>
                            {anime.title_english && (
                                <h2 className="text-lg md:text-xl text-gray-300 font-medium">{anime.title_english}</h2>
                            )}

                            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-4">
                                {anime.synopsis}
                            </p>
                        </motion.div>

                        {/* Card de Ação (Desktop: Right / Mobile: Below) */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="lg:col-span-3 flex flex-col justify-end order-3 lg:order-3 w-full"
                        >
                            <HeroActionCard
                                anime={anime}
                                libraryEntry={libraryEntry}
                                status={status}
                                handleStatusChange={handleStatusChange}
                                handleIncrement={handleIncrement}
                                updateProgress={updateProgress}
                                updateRating={updateRating}
                                toggleFavorite={toggleFavorite}
                                currentEp={currentEp}
                                totalEp={totalEp}
                                onRemove={() => setIsRemoveModalOpen(true)}
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Remove Confirmation Modal */}
            <ConfirmationModal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                onConfirm={handleRemoveConfirm}
                title="Remover da Biblioteca"
                message={`Tem certeza que deseja remover "${anime.title}" da sua biblioteca? Todo o seu progresso será perdido.`}
                confirmText="Remover"
                isDestructive
            />

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* DIREITA (Conteúdo) --> Agora na ESQUERDA (Desktop) */}
                    <div className="lg:col-span-9 xl:col-span-9 space-y-12 order-2 lg:order-1">

                        {/* Stats Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            <StatsCard value={`#${anime.rank || '-'}`} label="Ranking" icon={Trophy} />
                            <StatsCard value={anime.score || '-'} label="Score" icon={Star} color="text-yellow-500" />
                            <StatsCard value={anime.popularity || '-'} label="Popularidade" icon={Heart} color="text-red-500" />
                            <StatsCard value={anime.members?.toLocaleString() || '-'} label="Membros" icon={Users} color="text-blue-500" />
                        </motion.div>

                        {/* Trailer */}
                        {anime.trailer && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Film className="w-5 h-5 text-primary" /> Trailer</h3>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg cursor-pointer"
                                >
                                    <iframe
                                        src={anime.trailer.replace("autoplay=1", "autoplay=0")}
                                        title="Trailer"
                                        className="w-full h-full pointer-events-none" // pointer-events-none to allow hover on parent, IF we want the card to scale. 
                                        // Actually, pointer-events-none breaks controls. Let's just animate the container and keep controls working.
                                        // Removing pointer-events-none to keep controls usable.
                                        allowFullScreen
                                    />
                                </motion.div>
                            </motion.section>
                        )}

                        {/* Episódios */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2"><List className="w-5 h-5 text-primary" /> Episódios</h3>
                                {anime.episodesList?.length > 0 && (
                                    <span className="text-xs font-medium text-text-secondary bg-bg-secondary px-2 py-1 rounded-lg border border-border-color">
                                        {anime.episodesList.length} disponíveis
                                    </span>
                                )}
                            </div>

                            {anime.episodesList && anime.episodesList.length > 0 ? (
                                <EpisodesList
                                    episodes={anime.episodesList}
                                    currentEp={currentEp}
                                    totalEp={totalEp}
                                    onUpdateProgress={(epNum) => {
                                        if (user) {
                                            updateProgress(anime.id, epNum, totalEp);
                                            if (!libraryEntry) addToLibrary(anime, 'watching');
                                        } else {
                                            toast.warning("Faça login para marcar episódios!");
                                        }
                                    }}
                                />
                            ) : (
                                <div className="p-8 text-center bg-bg-secondary rounded-xl border border-border-color">
                                    <p className="text-text-secondary">Informações de episódios indisponíveis no momento.</p>
                                </div>
                            )}
                        </motion.section>

                        {/* Recomendações */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Recomendações</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {recommendations?.slice(0, 5).map(rec => (
                                    <Link to={`/anime/${rec.entry.mal_id}`} key={rec.entry.mal_id} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-secondary" onClick={() => window.scrollTo(0, 0)}>
                                        <img src={rec.entry.images?.jpg?.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold text-white line-clamp-2">{rec.entry.title}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>

                        {/* Comentários */}
                        <div className="pt-8 border-t border-border-color">
                            <CommentsSection animeId={anime.id} />
                        </div>

                    </div>

                    {/* ESQUERDA (Info Sidebar) --> Agora na DIREITA (Desktop) */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-3 xl:col-span-3 space-y-8 h-fit order-1 lg:order-2"
                    >
                        {/* Poster removed from here */}

                        <div className="space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-border-color pb-2">
                                <Info className="w-5 h-5 text-primary" /> Informações
                            </h3>
                            <div className="space-y-3">
                                <InfoRow icon={Layers} label="Episódios" value={`${anime.episodes || '?'}`} />
                                <InfoRow icon={Clock} label="Duração" value={anime.duration?.split('per')[0]} />
                                <InfoRow 
                                    icon={Monitor} 
                                    label="Estúdio" 
                                    value={anime.studios?.[0] ? (
                                        <Link to={`/studio/${anime.studios[0].mal_id}`} className="hover:underline">
                                            {anime.studios[0].name}
                                        </Link>
                                    ) : '-'} 
                                    highlight 
                                />
                                <InfoRow icon={Star} label="Nota Média" value={anime.score} color="text-yellow-400" />
                                <div className="border-t border-border-color/50 my-2" />
                                <InfoRow icon={Film} label="Origem" value={anime.source} />
                                <InfoRow icon={CheckCircle} label="Status" value={anime.status === 'Finished Airing' ? 'Completo' : 'Em Lançamento'} color={anime.status === 'Finished Airing' ? 'text-emerald-400' : 'text-blue-400'} />
                                <InfoRow icon={AlertCircle} label="Classificação" value={anime.rating?.split(' ')[0]} />
                                <InfoRow icon={Calendar} label="Exibição" value={anime.year || anime.aired?.string?.split('to')[0]} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b border-border-color pb-2">Gêneros</h3>
                            <div className="flex flex-wrap gap-2">
                                {anime.genres?.map(g => (
                                    <Link
                                        key={g.mal_id}
                                        to={`/catalog?genre=${g.mal_id}`}
                                        className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-color text-xs font-medium transition-colors hover:bg-primary hover:text-white hover:border-primary"
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b border-border-color pb-2">Elenco</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {characters?.slice(0, 4).map(char => (
                                    <motion.div
                                        key={char.character.mal_id}
                                        whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                        className="rounded-xl transition-colors"
                                    >
                                        <Link to={`/character/${char.character.mal_id}`} className="flex items-center gap-3 p-2 group">
                                            <div className="size-10 rounded-full overflow-hidden bg-bg-secondary">
                                                <img src={char.character.images?.jpg?.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">{char.character.name}</span>
                                                <span className="text-xs text-text-secondary">{char.role}</span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                            <Link to="/characters" className="block text-center text-sm font-bold text-primary hover:underline">Ver todo o elenco</Link>
                        </div>
                    </motion.aside>
                </div>
            </div >
            {/* Image Zoom Modal */}
            <AnimatePresence>
                {isZoomOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsZoomOpen(false)}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.image}
                            alt={anime.title}
                            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setIsZoomOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >

    );
}

// --- SUB-COMPONENTS ---


import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Trash2 } from 'lucide-react';

function HeroActionCard({ anime, libraryEntry, status, handleStatusChange, handleIncrement, updateProgress, toggleFavorite, currentEp, totalEp, updateRating, onRemove }) {
    if (!libraryEntry) {
        return (
            <div className="bg-bg-secondary/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">Acompanhar</h3>
                    <button onClick={() => toggleFavorite(anime)} className="p-2 hover:bg-white/10 rounded-full transition-colors group" title="Favoritar">
                        <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>

                <p className="text-sm text-gray-300">Adicione à sua lista para rastrear.</p>
                <button
                    onClick={() => handleStatusChange('watching')}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Adicionar à Lista
                </button>
            </div>
        );
    }

    return (
        <div className="bg-bg-secondary/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-white">Editar Progresso</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onRemove}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                        title="Remover da Biblioteca"
                    >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                    <button onClick={() => toggleFavorite(anime)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Heart className={`w-5 h-5 ${libraryEntry.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                </div>
            </div>

            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-bg-tertiary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
                <option value="watching">Assistindo</option>
                <option value="completed">Completo</option>
                <option value="plan_to_watch">Planejo Assistir</option>
                <option value="dropped">Dropado</option>
                <option value="paused">Pausado</option>
            </select>

            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                <input
                    type="number"
                    value={currentEp}
                    onChange={(e) => updateProgress(libraryEntry.id, parseInt(e.target.value) || 0, totalEp)}
                    className="w-12 bg-transparent text-center font-bold text-white outline-none"
                />
                <span className="text-gray-400">/ {totalEp || '?'}</span>
                <button onClick={handleIncrement} className="ml-auto p-1.5 bg-primary rounded-lg text-white hover:bg-primary-hover">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            {/* Rating Stars - Simplified */}
            <div className="flex justify-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer transition-transform hover:scale-110 ${(libraryEntry.score || 0) >= star * 2 ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                        onClick={() => updateRating(anime.id, star * 2)} // Mapping 1-5 stars to 2-10 score roughly
                    />
                ))}
            </div>
        </div>
    );
}



function InfoRow({ icon: Icon, label, value, color, highlight }) {
    return (
        <motion.div
            whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
            className="flex items-center justify-between text-sm p-2 rounded-lg cursor-default transition-colors"
        >
            <div className="flex items-center gap-2 text-text-secondary">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <span className={clsx("font-medium truncate max-w-[50%]", color, highlight && "text-primary font-bold")}>
                {value || '-'}
            </span>
        </motion.div>
    );
}

function EpisodesList({ episodes, currentEp, totalEp, onUpdateProgress }) {
    const [showAll, setShowAll] = useState(false);
    const displayedEpisodes = showAll ? episodes : episodes.slice(0, 5);

    return (
        <div className="space-y-3">
            <AnimatePresence mode='wait'>
                {displayedEpisodes.map((ep, index) => {
                    const isWatched = currentEp >= ep.mal_id;
                    const isFiller = ep.filler;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            key={ep.mal_id}
                            className={clsx(
                                "relative overflow-hidden flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                                isWatched
                                    ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_-5px_var(--button-accent)]"
                                    : "bg-bg-secondary hover:bg-bg-tertiary border-border-color hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
                                isFiller && !isWatched && "border-orange-500/30 bg-orange-500/5"
                            )}
                            onClick={() => onUpdateProgress(ep.mal_id)}
                        >
                            {/* Subtle Glow Effect on Hover (Desktop) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                            <div className="flex items-center gap-4 flex-1 min-w-0 z-10">
                                {/* Number Box */}
                                <div className={clsx(
                                    "size-12 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-300",
                                    isWatched ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-bg-tertiary text-text-secondary group-hover:text-primary group-hover:scale-105",
                                    isFiller && !isWatched && "text-orange-400"
                                )}>
                                    {ep.mal_id}
                                </div>

                                {/* Text Info */}
                                <div className="flex flex-col min-w-0 gap-0.5">
                                    <span className={clsx(
                                        "font-bold truncate pr-4 text-base md:text-lg transition-colors duration-300",
                                        isWatched ? "text-primary" : "text-text-primary group-hover:text-primary",
                                        isFiller && "text-orange-400"
                                    )}>
                                        {ep.title}
                                        {isFiller && <span className="ml-2 text-[10px] uppercase border border-orange-500/50 text-orange-400 px-1.5 py-0.5 rounded-md font-bold tracking-wider">Filler</span>}
                                    </span>
                                    <span className="text-xs md:text-sm text-text-secondary truncate font-medium group-hover:text-text-primary transition-colors">
                                        {ep.title_japanese || ep.title_romanji}
                                        {ep.aired && <span className="opacity-50 mx-2">•</span>}
                                        {ep.aired ? new Date(ep.aired).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Action Icon */}
                            <div className="pl-4 z-10">
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                    isWatched ? "bg-primary text-white scale-110 rotate-0" : "border-2 border-text-secondary/30 text-transparent group-hover:border-primary group-hover:text-primary scale-100 rotate-180"
                                )}>
                                    <CheckCircle className={clsx("w-5 h-5", isWatched && "fill-white/20")} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {episodes.length > 5 && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-3 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl border border-dashed border-primary/30 hover:border-primary transition-colors flex items-center justify-center gap-2 mt-4"
                >
                    {showAll ? (
                        <>Mostrar menos <ChevronDown className="w-4 h-4 rotate-180" /></>
                    ) : (
                        <>Ver todos os {episodes.length} episódios <ChevronDown className="w-4 h-4" /></>
                    )}
                </motion.button>
            )}
        </div>
    );
}

function StatsCard({ label, value, icon: Icon, color }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-bg-secondary p-4 rounded-xl border border-border-color flex flex-col items-center justify-center gap-1 cursor-default hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-colors"
        >
            <Icon className={clsx("w-6 h-6 mb-1", color || "text-text-secondary")} />
            <span className="font-bold text-lg text-text-primary">{value}</span>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{label}</span>
        </motion.div>
    );
}