import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { FavoritesWidget } from '@/components/profile/FavoritesWidget';
import { Skeleton } from '@/components/ui/Skeleton';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';
import { useToast } from '@/context/ToastContext';
import {
    Hash, Link as LinkIcon, AlertCircle, Lock,
    Clock, ArrowRight, Copy, ExternalLink,
    PlayCircle, CheckCircle, BookMarked, PauseCircle, XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/context/AuthContext';
import { useCompatibility } from '@/hooks/useCompatibility';
import { CompatibilityModal } from '@/components/profile/CompatibilityModal';
import { motion } from 'framer-motion';

const DEFAULT_SECTION_ORDER = ['favorites', 'recent', 'achievements', 'heatmap'];

// ─── Status config for the recent-activity badges ─────────────────────────────
const STATUS_CONFIG = {
    watching:      { label: 'Assistindo', color: 'bg-green-500/90',  icon: PlayCircle },
    completed:     { label: 'Completo',   color: 'bg-blue-500/90',   icon: CheckCircle },
    plan_to_watch: { label: 'Planejado',  color: 'bg-gray-500/90',   icon: BookMarked },
    paused:        { label: 'Pausado',    color: 'bg-yellow-500/90', icon: PauseCircle },
    dropped:       { label: 'Dropado',    color: 'bg-red-500/90',    icon: XCircle },
};

// ─── Recent Activity section ──────────────────────────────────────────────────
function RecentActivity({ library, uid }) {
    const recentAnimes = useMemo(() => {
        if (!library || library.length === 0) return [];
        return [...library]
            .sort((a, b) => (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0))
            .slice(0, 6);
    }, [library]);

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-button-accent" />
                    Atividade Recente
                </h3>
                <Link
                    to={`/u/${uid}/library`}
                    className="flex items-center gap-1.5 text-xs font-bold text-button-accent hover:text-text-primary transition-colors group"
                >
                    Ver biblioteca completa
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {recentAnimes.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-6 opacity-60">
                    Nenhuma atividade ainda.
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
                                <Link
                                    to={`/anime/${anime.id}`}
                                    className="block group relative"
                                    title={anime.title}
                                >
                                    {/* Cover */}
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                                        <img
                                            src={anime.image || anime.smallImage}
                                            alt={anime.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        {/* Status badge */}
                                        <div className={`absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-white text-center ${statusCfg.color} backdrop-blur-sm`}>
                                            {statusCfg.label}
                                        </div>
                                    </div>
                                    {/* Title */}
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

// ─── Public Profile Page ──────────────────────────────────────────────────────
export function PublicProfile() {
    const { uid } = useParams();
    const { profile, library, characterFavorites, loading, error } = usePublicProfile(uid);
    const { toast } = useToast();

    const { user: currentUser } = useAuth();
    const isOwnProfile = currentUser?.uid === uid;

    // Compatibility (only when viewing someone else's profile)
    const { score: compatScore, sharedAnimes, sharedCount, genreOverlap, scoreAffinity,
            commonGenres, myAvgScore, pubAvgScore } =
        useCompatibility(!isOwnProfile ? library : []);
    const [isCompatModalOpen, setCompatModalOpen] = useState(false);

    usePageTitle(profile ? `Perfil de ${profile.displayName}` : 'Perfil Público');

    const sortedFavorites = useMemo(() => {
        const favorites = library?.filter(a => a.isFavorite) || [];
        const order = profile?.favoritesOrder || [];
        if (!order.length) return favorites;
        const orderMap = new Map(order.map((id, index) => [String(id), index]));
        return [...favorites].sort((a, b) => {
            const indexA = orderMap.get(String(a.id)) ?? Infinity;
            const indexB = orderMap.get(String(b.id)) ?? Infinity;
            return indexA - indexB;
        });
    }, [library, profile?.favoritesOrder]);

    // Section order saved by the profile owner
    const sectionOrder = useMemo(() => {
        const saved = profile?.profileSectionOrder;
        if (saved?.length) {
            // Append any new sections not in the saved order
            return [...saved, ...DEFAULT_SECTION_ORDER.filter(id => !saved.includes(id))];
        }
        return DEFAULT_SECTION_ORDER;
    }, [profile?.profileSectionOrder]);

    const renderSection = (id) => {
        if (id === 'favorites') return (
            <FavoritesWidget
                animeFavorites={sortedFavorites}
                characterFavorites={characterFavorites}
                readOnly={true}
            />
        );
        if (id === 'recent')       return <RecentActivity library={library} uid={uid} />;
        if (id === 'achievements') return <AchievementBadges readOnly={true} publicLibrary={library} publicProfile={profile} />;
        if (id === 'heatmap')      return <ActivityHeatmap activityLog={profile?.activityLog} />;
        return null;
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">
                        <Skeleton className="h-64 w-full rounded-2xl mb-20" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    {error === 'Este perfil é privado.' ? (
                        <>
                            <div className="bg-bg-secondary p-6 rounded-full inline-block mb-2">
                                <Lock className="w-16 h-16 text-text-secondary mx-auto" />
                            </div>
                            <h2 className="text-3xl font-bold">Perfil Privado</h2>
                            <p className="text-text-secondary max-w-md mx-auto">
                                Este usuário optou por manter seu perfil e biblioteca privados.
                            </p>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                            <h2 className="text-3xl font-bold">Usuário não encontrado</h2>
                            <p className="text-text-secondary">O perfil que você procura não existe.</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-surface-dark scrollbar-track-bg-primary">
            <div className="max-w-7xl mx-auto space-y-8 pb-10">

                <ProfileHeader
                    user={null}
                    profile={profile}
                    readOnly={true}
                    onCompatibility={!isOwnProfile && currentUser ? () => setCompatModalOpen(true) : undefined}
                    compatibilityScore={!isOwnProfile && currentUser ? compatScore : null}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {sectionOrder.map(id => (
                            <div key={id}>{renderSection(id)}</div>
                        ))}
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">

                        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
                            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-button-accent" /> Gêneros Favoritos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.favoriteGenres?.map(genre => (
                                    <span key={genre} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-text-secondary">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
                            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-button-accent" /> Conexões
                            </h3>
                            <ul className="space-y-2">
                                {profile.connections?.discord && (
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
                                {profile.connections?.twitter && (
                                    <li>
                                        <a href={`https://x.com/${profile.connections.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                            <span className="text-sm font-semibold text-text-primary flex-1 text-left truncate">{profile.connections.twitter}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                )}
                                {profile.connections?.instagram && (
                                    <li>
                                        <a href={`https://instagram.com/${profile.connections.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 transition-all group"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="url(#ig-pub)"><defs><linearGradient id="ig-pub" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                            <span className="text-sm font-semibold text-pink-400 flex-1 text-left truncate">{profile.connections.instagram}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                )}
                                {!profile.connections?.discord && !profile.connections?.twitter && !profile.connections?.instagram && (
                                    <p className="text-sm text-text-secondary italic">Nenhuma rede social conectada.</p>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </div>

        <CompatibilityModal
            isOpen={isCompatModalOpen}
            onClose={() => setCompatModalOpen(false)}
            score={compatScore ?? 0}
            sharedAnimes={sharedAnimes ?? []}
            sharedCount={sharedCount ?? 0}
            genreOverlap={genreOverlap ?? 0}
            scoreAffinity={scoreAffinity ?? 0}
            commonGenres={commonGenres ?? []}
            myAvgScore={myAvgScore ?? 0}
            pubAvgScore={pubAvgScore ?? 0}
            otherName={profile?.displayName ?? 'este usuário'}
        />
        </>
    );
}
