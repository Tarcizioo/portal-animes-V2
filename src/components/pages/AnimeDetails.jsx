import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Star, Clock, Users, Trophy, Play, CheckCircle, Plus, Heart, Share2,
    Calendar, Monitor, Globe, Film, List, MessageSquare, ThumbsUp, Reply,
    ChevronDown, ArrowRight, PlayCircle, Layers, Mic2, Info, AlertCircle
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAnimeInfo } from '@/hooks/useAnimeInfo';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Loader } from '@/components/ui/Loader';
import clsx from 'clsx';

export function AnimeDetails() {
    const { id } = useParams();
    const { anime, characters, recommendations, loading } = useAnimeInfo(id);
    const { user } = useAuth();
    const { toast } = useToast();
    const { library, addToLibrary, incrementProgress, updateProgress, updateStatus, updateRating } = useAnimeLibrary();

    // Encontrar anime na biblioteca para setar estado inicial
    const libraryEntry = library.find(a => a.id.toString() === id);
    const [status, setStatus] = useState('plan_to_watch');

    useEffect(() => {
        if (libraryEntry) {
            setStatus(libraryEntry.status);
        }
    }, [libraryEntry]);

    // Estado para controlar a animação de entrada (apenas opacidade e slide, sem zoom no fundo)
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Função para atualizar status e adicionar ao library se não existir
    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        const totalEpisodes = anime.episodes || 0; // Pegar totais

        if (user) {
            if (libraryEntry) {
                updateStatus(anime.id, newStatus, totalEpisodes);
            } else {
                addToLibrary(anime, newStatus);
            }
        } else {
            toast.warning("Faça login para salvar animes na sua lista!");
        }
    };

    // Função para incrementar episódio
    const handleIncrement = () => {
        if (user && libraryEntry) {
            incrementProgress(libraryEntry.id, libraryEntry.currentEp, libraryEntry.totalEp);
        } else if (user && anime) {
            // Se não tá na lib, adiciona como assistindo
            addToLibrary(anime, 'watching').then(() => {
                // Depois incrementa? Na v1 vamos apenas adicionar
            });
        }
    };

    const currentEp = libraryEntry?.currentEp || 0;
    const totalEp = anime?.episodes || 0;

    if (loading) {
        return (
            <div className="flex h-screen bg-background-dark text-white items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!anime) return null;

    const bannerImage = anime.banner || anime.image;

    return (
        <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white">
            <Sidebar />

            <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-bg-secondary scrollbar-track-bg-primary">
                <Header />

                {/* --- HERO SECTION --- */}
                <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">

                    {/* Imagem de Fundo (ESTÁTICA) */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('${bannerImage}')` }}
                        />
                        {/* Gradientes */}
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/40 to-transparent z-10"></div>
                    </div>

                    <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
                        <div className={`grid lg:grid-cols-3 gap-10 w-full items-end transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                            {/* Texto Principal */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="flex flex-col gap-4">
                                    {/* Badges */}
                                    <div className="flex items-center gap-3 animate-fade-in">
                                        <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/40">
                                            {anime.type || 'TV'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-text-primary border border-white/20 text-xs font-bold uppercase tracking-wider">
                                            {anime.year || 'Unknown'}
                                        </span>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md",
                                            anime.status === 'Finished Airing'
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                        )}>
                                            {anime.status === 'Finished Airing' ? 'Completo' : 'Lançamento'}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-none tracking-tight text-text-primary drop-shadow-2xl">
                                        {anime.title}
                                    </h1>
                                    {anime.title_english && (
                                        <h2 className="text-xl text-text-secondary font-medium drop-shadow-md">{anime.title_english}</h2>
                                    )}
                                </div>

                                <p className="text-text-primary/90 text-lg leading-relaxed max-w-2xl line-clamp-3 drop-shadow-md">
                                    {anime.synopsis}
                                </p>

                                {/* BOTÕES REMOVIDOS AQUI */}
                            </div>

                            {/* Card Flutuante com Efeito Glass e Glow */}
                            <div className="lg:col-span-1 flex flex-col justify-end">
                                <div className="relative bg-bg-secondary/80 backdrop-blur-xl rounded-2xl p-6 border border-border-color shadow-2xl overflow-hidden group/card">
                                    {/* Glow Effect no fundo do card */}
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl group-hover/card:bg-primary/50 transition-all duration-700"></div>

                                    <div className="relative z-10">

                                        {!libraryEntry ? (
                                            /* ESTADO 1: NÃO ESTÁ NA BIBLIOTECA */
                                            <div className="flex flex-col gap-4">
                                                <h3 className="font-bold text-text-primary text-xl flex items-center gap-2 mb-2">
                                                    <Layers className="w-6 h-6 text-primary" /> Acompanhar Anime
                                                </h3>
                                                <p className="text-text-secondary text-sm mb-2">
                                                    Adicione este anime à sua lista para rastrear episódios e dar sua nota.
                                                </p>
                                                <button
                                                    onClick={() => handleStatusChange('watching')}
                                                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-5 h-5" /> Adicionar à Biblioteca
                                                </button>
                                            </div>
                                        ) : (
                                            /* ESTADO 2: JÁ ESTÁ NA BIBLIOTECA (EDITOR COMPLETO) */
                                            <>
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                                                        <Layers className="w-5 h-5 text-primary" /> Editando Progresso
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <ActionButton icon={Share2} />
                                                        <ActionButton icon={Heart} />
                                                    </div>
                                                </div>

                                                {/* Status Selector */}
                                                <div className="relative mb-5 group/select">
                                                    <select
                                                        className="block w-full rounded-xl border border-border-color bg-bg-tertiary/50 text-text-primary text-sm focus:ring-2 focus:ring-primary focus:border-transparent p-3.5 appearance-none cursor-pointer outline-none transition-all hover:bg-bg-tertiary/80"
                                                        value={status}
                                                        onChange={(e) => handleStatusChange(e.target.value)}
                                                    >
                                                        <option value="watching">Assistindo</option>
                                                        <option value="completed">Completo</option>
                                                        <option value="plan_to_watch">Planejo Assistir</option>
                                                        <option value="dropped">Dropado</option>
                                                        <option value="paused">Pausado</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-hover/select:text-primary transition-colors pointer-events-none" />
                                                </div>

                                                {/* Episódios Progress */}
                                                <div className="flex items-center justify-between mb-5 bg-black/5 dark:bg-black/20 rounded-xl p-4 border border-border-color">
                                                    <span className="text-sm text-text-secondary font-medium">Episódios</span>
                                                    <div className="flex items-center gap-3">
                                                        {/* INPUT DE EPISÓDIOS */}
                                                        <input
                                                            type="number"
                                                            value={currentEp}
                                                            onChange={(e) => updateProgress && updateProgress(libraryEntry.id, parseInt(e.target.value) || 0, totalEp)}
                                                            className="w-16 bg-bg-primary text-text-primary px-2 py-1 rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none text-center font-mono font-bold text-lg appearance-none"
                                                            min="0"
                                                            max={totalEp || 9999}
                                                        />
                                                        <span className="text-text-secondary/50">/</span>
                                                        <span className="text-text-secondary text-sm">{totalEp || '?'}</span>
                                                        <button
                                                            onClick={handleIncrement}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-110 active:scale-95"
                                                            title="Marcar +1 Episódio"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Avaliação Pessoal */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm text-text-secondary font-medium">Sua Nota</span>
                                                    <div className="flex items-center justify-between bg-black/5 dark:bg-black/20 p-3 rounded-xl border border-border-color">
                                                        {/* Stars Input */}
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 cursor-pointer transition-transform hover:scale-125 ${(libraryEntry.score || 0) >= star
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-600 hover:text-yellow-400"
                                                                        } ${star > 5 ? 'hidden sm:block' : ''} `} // Ocultar algumas se falta espaço em mobile, ou melhor, mostrar 5 estrelas? Vamos manter 10 simplificado ou 5. Vamos usar 5 para UI mais limpa, mapeando 1-5 se usuario quiser. Mas MAL usa 10... vamos tentar 5 por enquanto para caber, ou ajustar tamanho.
                                                                    // DECISÃO: Vamos usar 5 estrelas na UI para simplificar, mas salvar valor 1-10? Ou apenas mostrar 1-10 pequenas.
                                                                    // Vamos fazer 5 estrelas grandes que valem 2 pontos cada para simplificar a UI visualmente? Não, o user falou nota, geralmente é 10.
                                                                    // Vamos por 5 estrelas e ao clicar seta o valor.
                                                                    onClick={() => updateRating && updateRating(anime.id, star)} // Precisa importar updateRating
                                                                />
                                                            ))}
                                                            {/* CORREÇÃO: Vamos usar 5 estrelas visuais para não quebrar layout, representando 1-5 score. Se precisar 10, mudamos depois. O usuário não especificou escala. */}
                                                        </div>
                                                        <span className="font-bold text-text-primary text-lg">{libraryEntry.score || '-'}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- CONTEÚDO --- */}
                < div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12" >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* ESQUERDA (8) */}
                        <div className="lg:col-span-8 flex flex-col gap-12">

                            {/* Stats Grid Animado */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatsCard value={`#${anime.rank || 'N/A'}`} label="Ranking" icon={Trophy} color="text-primary" delay={100} />
                                <StatsCard value={anime.score || 'N/A'} label="Nota Média" icon={Star} color="text-yellow-400" delay={200} />
                                <StatsCard value={anime.duration?.split('per')[0] || '?'} label="Duração" icon={Clock} color="text-blue-400" delay={300} />
                                <StatsCard value={anime.members ? (anime.members / 1000).toFixed(0) + 'k' : '0'} label="Membros" icon={Users} color="text-emerald-400" delay={400} />
                            </div>

                            {/* Trailer */}
                            {anime.trailer && (
                                <section className="space-y-6">
                                    <SectionTitle icon={Film} title="Trailer Oficial" />
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border-color bg-black shadow-2xl relative group">
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                                        <iframe
                                            src={anime.trailer.replace("autoplay=1", "autoplay=0")}
                                            title="Trailer"
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Episódios */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <SectionTitle icon={List} title="Lista de Episódios" />
                                    <div className="text-sm text-text-secondary bg-bg-secondary px-3 py-1 rounded-full border border-border-color">
                                        {anime.episodes || '?'} episódios
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {[1, 2, 3].map((ep) => (
                                        <div key={ep} className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-color hover:border-primary/50 hover:bg-bg-tertiary transition-all group cursor-pointer hover:shadow-lg hover:shadow-black/5">
                                            <div className="flex items-center gap-5">
                                                <div className="relative flex items-center justify-center size-12 rounded-lg bg-bg-tertiary text-text-secondary font-bold text-lg group-hover:text-primary transition-colors overflow-hidden">
                                                    <span className="group-hover:opacity-0 transition-opacity duration-300">{ep}</span>
                                                    <Play className="absolute w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 fill-current" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="font-bold text-text-primary text-lg group-hover:text-primary transition-colors">Episódio {ep}</h4>
                                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Exibido recentemente
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-primary transition-colors flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> <span className="hidden sm:inline">Marcar Visto</span>
                                            </button>
                                        </div>
                                    ))}
                                    <button className="w-full py-4 rounded-xl border border-dashed border-border-color text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-bold uppercase tracking-wider">
                                        Ver todos os episódios
                                    </button>
                                </div>
                            </section>

                            {/* Comentários */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <SectionTitle icon={MessageSquare} title="Comentários" />
                                    <a className="text-sm font-medium text-primary hover:underline hover:text-primary-hover transition-colors" href="#">Ver todos</a>
                                </div>
                                <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color hover:border-primary/20 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-full bg-gradient-to-br from-primary to-indigo-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">JD</div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h5 className="text-text-primary font-bold">Otaku_Master</h5>
                                                    <div className="flex text-yellow-400 gap-0.5 text-xs mt-0.5">
                                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                    </div>
                                                </div>
                                                <span className="text-text-secondary text-xs bg-bg-tertiary px-2 py-1 rounded">2 dias atrás</span>
                                            </div>
                                            <p className="text-text-secondary leading-relaxed text-sm">
                                                Visuais absolutamente incríveis e uma história que te acerta em cheio. A Trigger fez um trabalho sensacional com essa adaptação. Recomendo fortemente para quem gosta do gênero cyberpunk!
                                            </p>
                                            <div className="pt-2 flex gap-4 text-xs text-text-secondary font-medium">
                                                <button className="hover:text-primary flex items-center gap-1.5 transition-colors"><ThumbsUp className="w-4 h-4" /> 423 Útil</button>
                                                <button className="hover:text-primary flex items-center gap-1.5 transition-colors"><Reply className="w-4 h-4" /> Responder</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* DIREITA (4) - Sidebar */}
                        <aside className="lg:col-span-4 flex flex-col gap-8">

                            {/* Info Card - AGORA SEM STICKY PARA NÃO SOBREPOR */}
                            <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color space-y-6">
                                <h4 className="text-text-primary font-bold text-lg flex items-center gap-2 border-b border-border-color pb-4">
                                    <Info className="w-5 h-5 text-primary" /> Informações
                                </h4>
                                <div className="flex flex-col gap-4">
                                    <InfoRow icon={Monitor} label="Tipo" value={anime.type} />
                                    <InfoRow icon={Layers} label="Episódios" value={anime.episodes} />
                                    <InfoRow icon={CheckCircle} label="Status" value={anime.status} color="text-emerald-400" />
                                    <InfoRow icon={Calendar} label="Exibição" value={anime.aired?.string?.split(' to ')[0]} />
                                    <InfoRow icon={Monitor} label="Estúdio" value={anime.studios?.[0]?.name} highlight />
                                    <InfoRow icon={Globe} label="Origem" value={anime.source} />
                                    <InfoRow icon={Clock} label="Duração" value={anime.duration?.split('per')[0]} />
                                    <InfoRow icon={AlertCircle} label="Classificação" value={anime.rating} />
                                </div>
                            </div>

                            {/* Gêneros */}
                            <div className="space-y-4">
                                <h4 className="text-text-primary font-bold text-lg">Gêneros</h4>
                                <div className="flex flex-wrap gap-2">
                                    {anime.genres?.map(g => (
                                        <span key={g.mal_id} className="px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-primary hover:text-white border border-border-color text-xs font-medium text-text-secondary transition-all cursor-pointer shadow-sm hover:shadow-primary/25">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Personagens */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-text-primary font-bold text-lg">Elenco</h4>
                                    <Link className="text-xs text-primary font-bold hover:underline" to="/characters">Ver Todos</Link>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {characters && characters.slice(0, 4).map(char => (
                                        <Link to={`/character/${char.character.mal_id}`} key={char.character.mal_id} className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary hover:bg-bg-tertiary transition-colors border border-border-color group">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="size-12 rounded-full bg-cover bg-center border-2 border-transparent group-hover:border-primary transition-all"
                                                    style={{ backgroundImage: `url('${char.character.images?.jpg?.image_url}')` }}
                                                ></div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">{char.character.name}</span>
                                                    <span className="text-xs text-text-secondary">{char.role}</span>
                                                </div>
                                            </div>
                                            <Mic2 className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Recomendações */}
                    <section className="mt-24 border-t border-border-color pt-12">
                        <div className="flex items-center justify-between mb-8">
                            <SectionTitle icon={Heart} title="Recomendações para você" />
                            <a className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-transform hover:translate-x-1" href="#">
                                Ver Mais <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {recommendations && recommendations.slice(0, 5).map(rec => (
                                <Link to={`/anime/${rec.entry.mal_id}`} key={rec.entry.mal_id} className="group flex flex-col gap-3" onClick={() => window.scrollTo(0, 0)}>
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-secondary border border-border-color shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                                        <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url('${rec.entry.images?.jpg?.large_image_url}')` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="flex items-center gap-1 text-xs font-bold text-white mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                <ThumbsUp className="w-3 h-3 text-primary" /> {rec.votes}
                                            </div>
                                        </div>
                                    </div>
                                    <h5 className="text-text-primary font-bold group-hover:text-primary transition-colors truncate px-1">{rec.entry.title}</h5>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div >
                <Footer />
            </main >
        </div >
    );
}

// --- Componentes Auxiliares ---

// eslint-disable-next-line no-unused-vars
function SectionTitle({ icon: Icon, title }) {
    return (
        <h3 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            {title}
        </h3>
    );
}

// eslint-disable-next-line no-unused-vars
function ActionButton({ icon: Icon }) {
    return (
        <button className="p-2.5 rounded-xl bg-bg-tertiary hover:bg-primary hover:text-white text-text-primary transition-all transform hover:scale-110 shadow-sm">
            <Icon className="w-5 h-5" />
        </button>
    )
}

// eslint-disable-next-line no-unused-vars
function StatsCard({ value, label, icon: Icon, color, delay }) {
    return (
        <div
            className="bg-bg-secondary p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 shadow-lg group"
            style={{ animationDelay: `${delay}ms` }}
        >
            <Icon className={`w-8 h-8 ${color} opacity-80 group-hover:scale-110 transition-transform`} />
            <span className="block text-2xl font-bold text-text-primary mt-1">{value}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{label}</span>
        </div>
    );
}

// eslint-disable-next-line no-unused-vars
function InfoRow({ label, value, icon: Icon, color = "text-text-primary", highlight = false }) {
    return (
        <div className="flex justify-between items-center py-2 group">
            <div className="flex items-center gap-3 text-text-secondary text-sm font-medium">
                <Icon className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                <span>{label}</span>
            </div>
            <span className={clsx("text-sm font-medium text-right truncate max-w-[50%]", color, highlight && "text-primary font-bold")}>
                {value || '?'}
            </span>
        </div>
    );
}