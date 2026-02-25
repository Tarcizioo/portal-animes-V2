import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { FavoritesWidget } from '@/components/profile/FavoritesWidget';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    Hash, Link as LinkIcon, AlertCircle, Lock,
    Clock, ArrowRight, PlayCircle, CheckCircle,
    BookMarked, PauseCircle, XCircle
} from 'lucide-react';
import { useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { motion } from 'framer-motion';

const DEFAULT_SECTION_ORDER = ['favorites', 'recent', 'achievements'];

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
    const sectionOrder = useMemo(
        () => profile?.profileSectionOrder?.length
            ? profile.profileSectionOrder
            : DEFAULT_SECTION_ORDER,
        [profile?.profileSectionOrder]
    );

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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-surface-dark scrollbar-track-bg-primary">
            <div className="max-w-7xl mx-auto space-y-8 pb-10">

                <ProfileHeader user={null} profile={profile} readOnly={true} />

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
                            <ul className="space-y-3 text-sm text-text-secondary">
                                {profile.connections?.discord && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500" /> {profile.connections.discord}
                                    </li>
                                )}
                                {profile.connections?.twitter && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" /> {profile.connections.twitter}
                                    </li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
