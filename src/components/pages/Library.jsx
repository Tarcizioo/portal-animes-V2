import { useState, useMemo, useEffect } from 'react';

import { AnimeCard } from '@/components/ui/AnimeCard';
import { AnimeListItem } from '@/components/ui/AnimeListItem';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Filter, SlidersHorizontal, ChevronDown, Search, X, Trash2, Calendar, MonitorPlay, List, Library as LibraryIcon, RefreshCw, Sparkles, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '@/context/ToastContext';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

const GENRES = [
    { id: 1, name: 'Ação' },
    { id: 2, name: 'Aventura' },
    { id: 4, name: 'Comédia' },
    { id: 8, name: 'Drama' },
    { id: 10, name: 'Fantasia' },
    { id: 14, name: 'Terror' },
    { id: 22, name: 'Romance' },
    { id: 24, name: 'Sci-Fi' },
    { id: 7, name: 'Mistério' },
    { id: 40, name: 'Psicológico' },
    { id: 18, name: 'Mecha' },
    { id: 19, name: 'Musical' },
    { id: 36, name: 'Slice of Life' },
    { id: 37, name: 'Sobrenatural' },
    { id: 30, name: 'Esportes' },
    { id: 41, name: 'Suspense' },
    { id: 23, name: 'Escolar' },
    { id: 42, name: 'Seinen' },
    { id: 27, name: 'Shounen' },
];

const GENRE_ID_MAP = {
    1: 'Action',
    2: 'Adventure',
    4: 'Comedy',
    8: 'Drama',
    10: 'Fantasy',
    14: 'Horror',
    22: 'Romance',
    24: 'Sci-Fi',
    7: 'Mystery',
    40: 'Psychological',
    18: 'Mecha',
    19: 'Music',
    36: 'Slice of Life',
    37: 'Supernatural',
    30: 'Sports',
    41: 'Suspense',
    56: 'School',
    57: 'Seinen',
    27: 'Shounen'
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
};

export function Library() {
    const { library, loading, syncLibraryData, removeFromLibrary } = useAnimeLibrary();
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // --- PERSISTÊNCIA DE VIEW MODE ---
    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem('anime_lib_view_mode');
        return saved || 'grid';
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();
    const [animeToRemove, setAnimeToRemove] = useState(null);

    const handleRemoveConfirm = async () => {
        if (animeToRemove) {
            try {
                await removeFromLibrary(animeToRemove.id);
                toast.success(`${animeToRemove.title} removido com sucesso.`);
            } catch (error) {
                toast.error("Erro ao remover anime.");
            }
            setAnimeToRemove(null);
        }
    };

    usePageTitle('Minha Biblioteca');

    // Salva ViewMode quando mudar
    useEffect(() => {
        localStorage.setItem('anime_lib_view_mode', viewMode);
    }, [viewMode]);

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        toast.info("Iniciando sincronização de dados...");

        try {
            await syncLibraryData((processed, total) => {
                if (processed % 5 === 0) {
                    // Atualiza toast a cada 5 (opcional, só para nao floodar)
                }
            });
            toast.success("Biblioteca sincronizada com sucesso!");
        } catch (error) {
            toast.error("Erro ao sincronizar dados.");
        } finally {
            setIsSyncing(false);
        }
    };

    // --- PERSISTÊNCIA DE FILTROS ---
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem('anime_lib_filters');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Erro ao ler filtros do localStorage", e);
            }
        }
        return {
            q: '',
            genres: [], // IDs numéricos
            orderBy: 'recent_updated',
            status: '',
            libraryStatus: '',
            year: '',
            season: '',
            type: '',
        };
    });

    // Salva Filtros quando mudar
    useEffect(() => {
        localStorage.setItem('anime_lib_filters', JSON.stringify(filters));
    }, [filters]);

    // --- LÓGICA DE FILTRAGEM ---
    const filteredLibrary = useMemo(() => {
        if (!library) return [];

        return library.filter(anime => {
            // 1. Busca por Texto (Título)
            if (filters.q && !anime.title.toLowerCase().includes(filters.q.toLowerCase())) {
                return false;
            }

            // 2. Status na Biblioteca (Plan to watch, Completed, etc)
            if (filters.libraryStatus && anime.status !== filters.libraryStatus) {
                return false;
            }

            // 3. Tipo (TV, Movie) - Case Insensitive
            if (filters.type) {
                const animeType = (anime.type || 'TV').toLowerCase();
                if (animeType !== filters.type.toLowerCase()) {
                    return false;
                }
            }

            // 4. Temporada (Inverno, Verão...)
            if (filters.season) {
                const animeSeason = (anime.season || '').toLowerCase();
                if (animeSeason !== filters.season.toLowerCase()) {
                    return false;
                }
            }

            // 5. Ano
            if (filters.year && anime.year !== parseInt(filters.year)) {
                return false;
            }

            // 6. Gêneros (Com mapeamento ID -> String)
            if (filters.genres.length > 0) {
                let animeGenres = [];

                if (Array.isArray(anime.genres)) {
                    // Novo formato: ['Action', 'Fantasy']
                    animeGenres = anime.genres;
                } else if (typeof anime.genres === 'string') {
                    // Formato antigo/Legacy
                    animeGenres = anime.genres.split(',').map(g => g.trim());
                }

                // Verifica se o anime possui ALGUM dos gêneros selecionados
                // Mapeia os IDs selecionados (e.g. 1) para strings (e.g. 'Action')
                const selectedGenreNames = filters.genres
                    .map(id => GENRE_ID_MAP[id])
                    .filter(Boolean); // Remove undefined

                const hasGenre = selectedGenreNames.some(filterGenreName => {
                    return animeGenres.some(animeGenre =>
                        animeGenre.toLowerCase().trim() === filterGenreName.toLowerCase().trim()
                    );
                });

                if (!hasGenre) return false;
            }

            return true;
        }).sort((a, b) => {
            // --- ORDENAÇÃO ---
            switch (filters.orderBy) {
                case 'score':
                    return (b.score || 0) - (a.score || 0);
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                case 'recent_updated':
                    return (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0);
                case 'oldest_updated':
                    return (a.lastUpdated?.seconds || 0) - (b.lastUpdated?.seconds || 0);
                case 'favorites':
                    return (b.isFavorite === true ? 1 : 0) - (a.isFavorite === true ? 1 : 0);
                default:
                    return 0;
            }
        });
    }, [library, filters]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            q: '',
            genres: [],
            orderBy: 'recent_updated',
            status: '',
            libraryStatus: '',
            year: '',
            season: '',
            type: '',
        });
    };

    const handleGenreToggle = (genreId) => {
        const currentGenres = filters.genres;
        if (currentGenres.includes(genreId)) {
            updateFilter('genres', currentGenres.filter(id => id !== genreId));
        } else {
            updateFilter('genres', [...currentGenres, genreId]);
        }
    };

    const hasActiveFilters = filters.q || filters.libraryStatus || filters.genres.length > 0 || filters.year || filters.season || filters.type;

    if (loading) {
        return (

            <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
                {/* Skeleton Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-bg-secondary rounded-xl"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-64 bg-bg-secondary rounded-lg"></div>
                            <div className="h-5 w-96 bg-bg-secondary rounded-lg"></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Skeleton Sidebar Filters */}
                    <div className="hidden lg:block w-72 space-y-8">
                        <div className="h-40 bg-bg-secondary rounded-2xl"></div>
                        <div className="h-20 bg-bg-secondary rounded-2xl"></div>
                        <div className="h-60 bg-bg-secondary rounded-2xl"></div>
                    </div>

                    {/* Skeleton Grid */}
                    <div className="flex-1">
                        <div className="h-16 bg-bg-secondary rounded-2xl mb-8 w-full"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[...Array(12)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    return (

        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">

            <div className="mb-8 border-b border-border-color pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <LibraryIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tight">Minha Biblioteca</h1>
                        <p className="text-lg text-text-secondary">Gerencie suas séries, filmes e programe sua próxima maratona.</p>
                    </div>
                </div>

                {/* Botão de Sync */}
                <motion.button
                    onClick={handleSync}
                    disabled={isSyncing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isSyncing
                        ? 'bg-bg-tertiary text-text-secondary border-transparent cursor-not-allowed'
                        : 'bg-bg-secondary hover:bg-bg-tertiary text-text-primary border-border-color hover:border-primary/50'}`}
                    title="Atualizar dados de animes antigos"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                </motion.button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* --- SIDEBAR DE FILTROS --- */}
                <aside className={clsx(
                    "lg:w-72 flex-shrink-0 space-y-8",
                    showMobileFilters ? "fixed inset-0 z-[60] bg-bg-secondary p-6 overflow-y-auto" : "hidden lg:block"
                )}>
                    <div className="flex items-center justify-between lg:hidden mb-6 border-b border-border-color pb-4">
                        <h2 className="text-2xl font-bold text-text-primary">Filtros</h2>
                        <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-bg-tertiary rounded-full text-text-primary"><X /></button>
                    </div>

                    {/* STATUS DO USUÁRIO */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-button-accent" /> Status
                        </h3>
                        <div className="flex flex-col gap-2">
                            {[
                                { val: 'watching', label: 'Assistindo', color: 'bg-primary' },
                                { val: 'completed', label: 'Completos', color: 'bg-blue-500' },
                                { val: 'plan_to_watch', label: 'Planejo Assistir', color: 'bg-gray-500' },
                                { val: 'dropped', label: 'Dropados', color: 'bg-red-500' },
                                { val: 'paused', label: 'Pausados', color: 'bg-yellow-500' },
                            ].map(st => (
                                <motion.button
                                    key={st.val}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => updateFilter('libraryStatus', filters.libraryStatus === st.val ? '' : st.val)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors border-2 w-full text-left
                                ${filters.libraryStatus === st.val
                                            ? 'bg-bg-secondary border-button-accent text-text-primary shadow-lg'
                                            : 'bg-bg-secondary/50 border-transparent hover:bg-bg-secondary hover:border-border-color text-text-secondary hover:text-text-primary'}
                            `}
                                >
                                    <div className={`w-3 h-3 rounded-full ${st.color}`} />
                                    <span className="font-medium">{st.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Busca */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                            <Search className="w-4 h-4 text-button-accent" /> Pesquisar
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                value={filters.q}
                                placeholder="Buscar na biblioteca..."
                                className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-4 py-3 text-base text-text-primary focus:outline-none focus:border-button-accent focus:ring-4 focus:ring-button-accent/10 transition-all placeholder-text-secondary/60"
                                onChange={(e) => updateFilter('q', e.target.value)}
                            />
                            {filters.q && (
                                <button onClick={() => updateFilter('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Ano e Temporada (Grid 2 colunas como no Catalogo) */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Ano */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">  <Calendar className="w-3.5 h-3.5 text-button-accent" /> Ano </h3>
                            <select
                                value={filters.year}
                                onChange={(e) => updateFilter('year', e.target.value)}
                                className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-2 py-2.5 text-sm text-text-primary focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/10 transition-all cursor-pointer appearance-none"
                            >
                                <option value="">Todos</option>
                                {Array.from({ length: 45 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tempoarada */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2"> Temp. </h3>
                            <select
                                value={filters.season}
                                onChange={(e) => updateFilter('season', e.target.value)}
                                className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-2 py-2.5 text-sm text-text-primary focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/10 transition-all cursor-pointer appearance-none"
                            >
                                <option value="">Todas</option>
                                <option value="winter">Inverno</option>
                                <option value="spring">Primavera</option>
                                <option value="summer">Verão</option>
                                <option value="fall">Outono</option>
                            </select>
                        </div>
                    </div>

                    {/* Formato */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2"> <MonitorPlay className="w-3.5 h-3.5 text-button-accent" /> Formato </h3>
                        <select
                            value={filters.type}
                            onChange={(e) => updateFilter('type', e.target.value)}
                            className="w-full bg-bg-secondary border-2 border-border-color rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/10 transition-all cursor-pointer appearance-none"
                        >
                            <option value="">Todos</option>
                            <option value="TV">TV</option>
                            <option value="Movie">Filme</option>
                            <option value="OVA">OVA</option>
                            <option value="Special">Especial</option>
                            <option value="ONA">ONA</option>
                        </select>
                    </div>

                    {/* Gêneros */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                                <Filter className="w-4 h-4 text-button-accent" /> Gêneros
                            </h3>
                            {filters.genres.length > 0 && (
                                <span className="text-xs bg-button-accent text-text-on-primary font-bold px-2 py-0.5 rounded-full">{filters.genres.length}</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map((g) => {
                                const isSelected = filters.genres.includes(g.id);
                                return (
                                    <motion.button
                                        key={g.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleGenreToggle(g.id)}
                                        className={`
                            text-sm px-3 py-1.5 rounded-lg border transition-colors font-medium
                            ${isSelected
                                                ? 'bg-button-accent border-button-accent text-text-on-primary'
                                                : 'bg-bg-secondary border-border-color text-text-secondary hover:border-border-color/80 hover:text-text-primary'}
                        `}
                                    >
                                        {g.name}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>


                    {/* Botão Limpar */}
                    {hasActiveFilters && (
                        <motion.button
                            onClick={clearFilters}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-bold uppercase tracking-wider"
                        >
                            <Trash2 className="w-4 h-4" /> Limpar Filtros
                        </motion.button>
                    )}

                </aside>

                {/* --- ÁREA PRINCIPAL --- */}
                <div className="flex-1 min-w-0">

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 bg-bg-secondary border border-border-color rounded-2xl shadow-xl shadow-shadow-color/10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden p-2.5 bg-button-accent text-text-on-primary rounded-lg shadow-lg shadow-button-accent/20"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                            <span className="text-base text-text-secondary">
                                <strong className="text-text-primary text-lg">{filteredLibrary.length}</strong> animes na lista
                            </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">

                            <ViewToggle
                                value={viewMode}
                                onChange={setViewMode}
                                options={[
                                    { value: 'grid', label: '', icon: LayoutGrid },
                                    { value: 'list', label: '', icon: List },
                                ]}
                            />

                            <span className="text-sm font-medium text-text-secondary hidden sm:inline whitespace-nowrap pl-2 border-l border-border-color">Ordenar por:</span>
                            <div className="relative w-full sm:w-auto">
                                <select
                                    className="w-full sm:w-auto appearance-none bg-bg-tertiary border-2 border-border-color text-text-primary pl-4 pr-12 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-button-accent focus:ring-2 focus:ring-button-accent/20 cursor-pointer hover:bg-bg-secondary transition-colors"
                                    value={filters.orderBy}
                                    onChange={(e) => updateFilter('orderBy', e.target.value)}
                                >
                                    <option value="recent_updated">🕒 Editados Recentemente</option>
                                    <option value="oldest_updated">🦕 Editados Antigos</option>
                                    <option value="score">⭐ Minha Nota</option>
                                    <option value="title_asc">🔤 Título (A-Z)</option>
                                    <option value="title_desc">🔤 Título (Z-A)</option>
                                    <option value="favorites">❤️ Favoritos Primeiro</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Grid / List */}
                    <motion.div
                        className={viewMode === 'grid'
                            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                            : "flex flex-col gap-4"
                        }
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key={`${viewMode}-${JSON.stringify(filters)}-${filteredLibrary.length > 0}`}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredLibrary.map((anime) => (
                                <motion.div
                                    key={anime.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    layout
                                >
                                    {viewMode === 'grid' ? (
                                        <AnimeCard
                                            key={`${anime.id}-card`}
                                            {...anime}
                                            onRemove={() => setAnimeToRemove(anime)}
                                        />
                                    ) : (
                                        <AnimeListItem
                                            key={`${anime.id}-list`}
                                            {...anime}
                                            showPersonalProgress // Flag para mostrar progresso pessoal na lista
                                            onRemove={() => setAnimeToRemove(anime)}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredLibrary.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Search className="w-10 h-10 text-text-secondary" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Nenhum anime encontrado</h3>
                            <p className="text-text-secondary mb-6">
                                {hasActiveFilters
                                    ? "Tente ajustar seus filtros para encontrar o que procura."
                                    : "Sua biblioteca está vazia. Explore o catálogo para adicionar animes!"
                                }
                            </p>
                            {hasActiveFilters ? (
                                <motion.button
                                    onClick={clearFilters}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-button-accent hover:bg-button-accent/90 text-text-on-primary rounded-xl font-bold transition-all shadow-lg"
                                >
                                    Limpar filtros
                                </motion.button>
                            ) : (
                                <Link
                                    to="/catalog"
                                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg"
                                >
                                    Ir para o Catálogo
                                </Link>
                            )}
                        </div>
                    )}

                </div>

            </div>

            {/* Remove Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!animeToRemove}
                onClose={() => setAnimeToRemove(null)}
                onConfirm={handleRemoveConfirm}
                title="Remover da Biblioteca"
                message={`Tem certeza que deseja remover "${animeToRemove?.title}" da sua biblioteca?`}
                confirmText="Remover"
                isDestructive
            />
        </div>

    );
}
