import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// @dnd-kit
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { AnimeTrackerList } from '@/components/profile/AnimeTrackerList';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { FavoritesWidget } from '@/components/profile/FavoritesWidget';
import { ShareProfileModal } from '@/components/profile/ShareProfileModal';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useCharacterLibrary } from '@/hooks/useCharacterLibrary';
import { useFavoriteStudios } from '@/hooks/useFavoriteStudios';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    LogIn, Hash, Link as LinkIcon, Monitor, X,
    Clock, ArrowRight, GripVertical, LayoutGrid,
    Check, RotateCcw, Copy, ExternalLink,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SECTION_ORDER = ['favorites', 'recent', 'achievements', 'heatmap'];

const STATUS_CONFIG = {
    watching:      { label: 'Assistindo', color: 'bg-green-500/90' },
    completed:     { label: 'Completo',   color: 'bg-blue-500/90' },
    plan_to_watch: { label: 'Planejado',  color: 'bg-gray-500/90' },
    paused:        { label: 'Pausado',    color: 'bg-yellow-500/90' },
    dropped:       { label: 'Dropado',    color: 'bg-red-500/90' },
};

// ─── Recent Activity ──────────────────────────────────────────────────────────
function RecentActivity({ library }) {
    const recentAnimes = useMemo(() => {
        if (!library || library.length === 0) return [];
        return [...library]
            .sort((a, b) => (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0))
            .slice(0, 6);
    }, [library]);

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-button-accent" />
                    Atividade Recente
                </h3>
                <Link
                    to="/library"
                    className="flex items-center gap-1.5 text-xs font-bold text-button-accent hover:text-text-primary transition-colors group"
                >
                    Ver minha biblioteca
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {recentAnimes.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-6 opacity-60">
                    Nenhum anime na biblioteca ainda.
                </p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {recentAnimes.map((anime, index) => {
                        const statusCfg = STATUS_CONFIG[anime.status] || STATUS_CONFIG.plan_to_watch;
                        return (
                            <motion.div
                                key={anime.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/anime/${anime.id}`} className="block group relative" title={anime.title}>
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                                        <img
                                            src={anime.image || anime.smallImage}
                                            alt={anime.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <div className={`absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-white text-center ${statusCfg.color} backdrop-blur-sm`}>
                                            {statusCfg.label}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-semibold text-text-secondary group-hover:text-primary line-clamp-2 leading-tight transition-colors">
                                        {anime.title}
                                    </p>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Sortable Section Wrapper ─────────────────────────────────────────────────
function SortableSection({ id, isEditing, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    if (!isEditing) {
        return <div>{children}</div>;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative flex gap-3 items-stretch group/section rounded-2xl transition-all ${
                isDragging ? 'ring-2 ring-button-accent ring-offset-2 ring-offset-bg-primary scale-[1.01]' : ''
            }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="flex-shrink-0 flex items-center px-1 cursor-grab active:cursor-grabbing text-text-secondary hover:text-button-accent transition-colors touch-none"
                title="Arrastar para reordenar"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Block content with edit-mode border */}
            <div className="flex-1 min-w-0 outline outline-2 outline-dashed outline-button-accent/30 rounded-2xl hover:outline-button-accent/60 transition-all">
                {children}
            </div>
        </div>
    );
}

// ─── Section labels for the overlay ──────────────────────────────────────────
const SECTION_LABELS = {
    favorites:    '⭐ Favoritos',
    recent:       '🕒 Atividade Recente',
    achievements: '🏆 Conquistas',
    heatmap:      '🗓️ Heatmap de Atividade',
};

// ─── Main Profile Page ────────────────────────────────────────────────────────
export function Profile() {
    const { user, signInGoogle, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading, updateProfileData } = useUserProfile();
    const { library } = useAnimeLibrary();
    const { characterLibrary } = useCharacterLibrary();
    const { favoriteStudios, toggleFavorite } = useFavoriteStudios();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // ── Layout drag state ─────────────────────────────────────────────────────
    const { toast } = useToast();
    const [isEditingLayout, setIsEditingLayout] = useState(false);
    const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);
    const [savedOrder, setSavedOrder] = useState(DEFAULT_SECTION_ORDER);
    const [activeDragId, setActiveDragId] = useState(null);
    const [isSavingLayout, setIsSavingLayout] = useState(false);

    // Sync order from Firestore when profile loads
    useEffect(() => {
        if (profile?.profileSectionOrder?.length) {
            const saved = profile.profileSectionOrder;
            // Append any new sections not yet in the saved order
            const merged = [...saved, ...DEFAULT_SECTION_ORDER.filter(id => !saved.includes(id))];
            setSectionOrder(merged);
            setSavedOrder(merged);
        }
    }, [profile?.profileSectionOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = ({ active }) => setActiveDragId(active.id);

    const handleDragEnd = ({ active, over }) => {
        setActiveDragId(null);
        if (active.id !== over?.id) {
            setSectionOrder(prev => {
                const oldIndex = prev.indexOf(active.id);
                const newIndex = prev.indexOf(over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const handleSaveLayout = async () => {
        setIsSavingLayout(true);
        try {
            await updateProfileData({ profileSectionOrder: sectionOrder });
            setSavedOrder(sectionOrder);
        } catch (err) {
            console.error('Failed to save layout order:', err);
        } finally {
            setIsSavingLayout(false);
            setIsEditingLayout(false);
        }
    };

    const handleCancelLayout = () => {
        setSectionOrder(savedOrder);
        setIsEditingLayout(false);
    };

    usePageTitle('Meu Perfil');

    // ── Sorted favorites ──────────────────────────────────────────────────────
    const sortedFavorites = useMemo(() => {
        const favorites = library?.filter(a => a.isFavorite) || [];
        const order = profile?.favoritesOrder || [];
        if (!order.length) return favorites;
        const orderMap = new Map(order.map((id, index) => [String(id), index]));
        return [...favorites].sort((a, b) => {
            const idxA = orderMap.get(String(a.id)) ?? Infinity;
            const idxB = orderMap.get(String(b.id)) ?? Infinity;
            return idxA - idxB;
        });
    }, [library, profile?.favoritesOrder]);

    const sortedCharFavorites = useMemo(() => {
        const favorites = characterLibrary || [];
        const order = profile?.favoriteCharactersOrder || [];
        if (!order.length) return favorites;
        const orderMap = new Map(order.map((id, index) => [String(id), index]));
        return [...favorites].sort((a, b) => {
            const idxA = orderMap.get(String(a.id)) ?? Infinity;
            const idxB = orderMap.get(String(b.id)) ?? Infinity;
            return idxA - idxB;
        });
    }, [characterLibrary, profile?.favoriteCharactersOrder]);

    const handleFavoritesReorder = useCallback(async (newOrderIds) => {
        try { await updateProfileData({ favoritesOrder: newOrderIds }); }
        catch (err) { console.error('Failed to update favorites order:', err); }
    }, [updateProfileData]);

    const handleCharFavoritesReorder = useCallback(async (newOrderIds) => {
        try { await updateProfileData({ favoriteCharactersOrder: newOrderIds }); }
        catch (err) { console.error('Failed to update char favorites order:', err); }
    }, [updateProfileData]);

    const handleSetPreferredView = useCallback(async (view) => {
        try { await updateProfileData({ preferredFavoritesView: view }); }
        catch (err) { console.error('Failed to set preferred view:', err); }
    }, [updateProfileData]);

    // ── Render helpers ────────────────────────────────────────────────────────
    const renderSection = (id) => {
        if (id === 'favorites') return (
            <FavoritesWidget
                animeFavorites={sortedFavorites}
                characterFavorites={sortedCharFavorites}
                onReorderAnimes={handleFavoritesReorder}
                onReorderCharacters={handleCharFavoritesReorder}
                preferredView={profile?.preferredFavoritesView}
                onSetPreferredView={handleSetPreferredView}
            />
        );
        if (id === 'recent') return <RecentActivity library={library} />;
        if (id === 'achievements') return <AchievementBadges />;
        if (id === 'heatmap') return <ActivityHeatmap activityLog={profile?.activityLog} />;
        return null;
    };

    const loading = authLoading || (user && profileLoading);

    if (loading) {
        return (
            <div className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 pb-10">
                <div className="relative mb-20">
                    <Skeleton className="h-48 md:h-64 w-full rounded-2xl" />
                    <div className="absolute -bottom-16 left-8 flex items-end">
                        <div className="w-32 h-32 rounded-full border-4 border-bg-primary bg-bg-tertiary overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-80 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-60 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Faça login para acessar</h2>
                    <p className="text-gray-400">
                        Crie sua biblioteca, acompanhe seus animes favoritos e ganhe conquistas exclusivas.
                    </p>
                    <button
                        onClick={signInGoogle}
                        className="w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
                        Entrar com Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 pb-10">
                <ProfileHeader
                    user={user}
                    profile={profile}
                    onEdit={() => setIsModalOpen(true)}
                    onShare={() => setIsShareModalOpen(true)}
                />

                <ProfileStats />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                    {/* ── Main Column (sortable) ──────────────────────────── */}
                    <div className="lg:col-span-2">

                        {/* Layout Edit Toolbar */}
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <AnimatePresence mode="wait">
                                {isEditingLayout ? (
                                    <motion.div
                                        key="editing"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <span className="text-sm text-button-accent font-semibold flex items-center gap-1.5">
                                            <GripVertical className="w-4 h-4" />
                                            Arraste os blocos para reordenar
                                        </span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={handleCancelLayout}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border border-border-color text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Cancelar
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={handleSaveLayout}
                                                disabled={isSavingLayout}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-green-500 hover:bg-green-400 text-white transition-all disabled:opacity-60"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                {isSavingLayout ? 'Salvando...' : 'Salvar'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="ml-auto"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsEditingLayout(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-border-color text-text-secondary hover:text-text-primary hover:bg-bg-secondary hover:border-button-accent/50 transition-all"
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" /> Personalizar Layout
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* DnD Context */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4 md:space-y-8">
                                    {sectionOrder.map(id => (
                                        <SortableSection key={id} id={id} isEditing={isEditingLayout}>
                                            {renderSection(id)}
                                        </SortableSection>
                                    ))}
                                </div>
                            </SortableContext>

                            {/* Drag Overlay — ghost block while dragging */}
                            <DragOverlay>
                                {activeDragId ? (
                                    <div className="bg-bg-secondary border-2 border-button-accent rounded-2xl p-4 shadow-2xl opacity-90 flex items-center gap-3">
                                        <GripVertical className="w-5 h-5 text-button-accent" />
                                        <span className="font-bold text-text-primary">
                                            {SECTION_LABELS[activeDragId]}
                                        </span>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    {/* ── Sidebar ─────────────────────────────────────────── */}
                    <div className="space-y-3 md:space-y-6">

                        {/* Gêneros Favoritos */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                <Hash className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Gêneros Favoritos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile?.favoriteGenres && profile.favoriteGenres.length > 0 ? (
                                    profile.favoriteGenres.map(genre => (
                                        <span key={genre} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer">
                                            {genre}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Nenhum gênero adicionado.</p>
                                )}
                            </div>
                        </div>

                        {/* Estúdios Favoritos */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Estúdios Favoritos
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {favoriteStudios && favoriteStudios.length > 0 ? (
                                    favoriteStudios.slice(0, 3).map(studio => (
                                        <Link
                                            key={studio.mal_id}
                                            to={`/studio/${studio.mal_id}`}
                                            className="group relative flex flex-col items-center bg-bg-tertiary rounded-xl p-2 border border-transparent hover:border-primary transition-all overflow-hidden"
                                        >
                                            <div className="w-full aspect-square bg-white rounded-lg mb-2 flex items-center justify-center p-2 relative">
                                                {studio.image ? (
                                                    <img src={studio.image} alt={studio.name} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <Monitor className="w-8 h-8 text-gray-300" />
                                                )}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); toggleFavorite(studio); }}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Deixar de seguir"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-center line-clamp-1 group-hover:text-primary transition-colors w-full">
                                                {studio.name}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="col-span-3 text-sm text-gray-500 italic">Nenhum estúdio seguido.</p>
                                )}
                            </div>
                        </div>

                        {/* Conexões */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6">
                            <h3 className="font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Conexões
                            </h3>
                            <ul className="space-y-2">
                                {profile?.connections?.discord && (
                                    <li>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(profile.connections.discord); toast.success('Username copiado!'); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all group"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.031.056A19.9 19.9 0 0 0 5.99 21.2a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.088.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029z"/></svg>
                                            <span className="text-sm font-semibold text-[#5865F2] flex-1 text-left truncate">{profile.connections.discord}</span>
                                            <Copy className="w-3.5 h-3.5 text-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </li>
                                )}
                                {profile?.connections?.twitter && (
                                    <li>
                                        <a
                                            href={`https://x.com/${profile.connections.twitter.replace('@','')}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                            <span className="text-sm font-semibold text-text-primary flex-1 text-left truncate">{profile.connections.twitter}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                )}
                                {profile?.connections?.instagram && (
                                    <li>
                                        <a
                                            href={`https://instagram.com/${profile.connections.instagram.replace('@','')}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 transition-all group"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="url(#ig-p)"><defs><linearGradient id="ig-p" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                            <span className="text-sm font-semibold text-pink-400 flex-1 text-left truncate">{profile.connections.instagram}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                )}
                                {!profile?.connections?.discord && !profile?.connections?.twitter && !profile?.connections?.instagram && (
                                    <p className="text-sm text-gray-500 italic">Nenhuma rede social conectada.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={profile}
                onSave={updateProfileData}
            />

            <ShareProfileModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                user={user}
                profile={profile}
                favorites={sortedFavorites}
                library={library}
            />
        </>
    );
}