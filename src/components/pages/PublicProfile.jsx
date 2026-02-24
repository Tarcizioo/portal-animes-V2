import { useParams } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AchievementBadges } from '@/components/profile/AchievementBadges';
import { FavoritesWidget } from '@/components/profile/FavoritesWidget';
import { Skeleton } from '@/components/ui/Skeleton';
import { Hash, Link as LinkIcon, AlertCircle, Lock } from 'lucide-react'; // [Modified]
import { useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';

export function PublicProfile() {
    const { uid } = useParams();
    const { profile, library, characterFavorites, loading, error } = usePublicProfile(uid);

    usePageTitle(profile ? `Perfil de ${profile.displayName}` : 'Perfil Público');

    // Calcular favoritos ordenados (Assim como no Profile privado)
    const sortedFavorites = useMemo(() => {
        const favorites = library?.filter(a => a.isFavorite) || [];
        const order = profile?.favoritesOrder || [];

        if (!order.length) return favorites;
        const orderMap = new Map(order.map((id, index) => [String(id), index]));

        return [...favorites].sort((a, b) => {
            const indexA = orderMap.get(String(a.id)) ?? Infinity;
            const indexB = orderMap.get(String(b.id)) ?? Infinity;
            if (indexA === indexB) return 0;
            return indexA - indexB;
        });
    }, [library, profile?.favoritesOrder]);

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

                {/* Header Read-Only */}
                <ProfileHeader
                    user={null} // Passar null esconde botão de Edit
                    profile={profile}
                    readOnly={true}
                />

                {/* Stats (Precisamos adaptar ProfileStats para aceitar props se ele depender de contexto) 
                NOTA: Se ProfileStats usa useAnimeLibrary interno, ele vai mostrar as stats do USUÁRIO LOGADO, não do público.
                Vamos precisar refatorar ProfileStats ou criar um PublicStats. 
                Por enquanto, vou assumir que precisarei passar props ou criar um componente novo.
                Vou usar um placeholder se ProfileStats for rígido.
            */}
                {/* TODO: Refatorar ProfileStats para aceitar 'library' como prop opcional */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Widget de Favoritos (Read-Only) */}
                        <FavoritesWidget
                            animeFavorites={sortedFavorites}
                            characterFavorites={characterFavorites}
                            readOnly={true}
                        />
                        <AchievementBadges 
                            readOnly={true} 
                            publicLibrary={library} 
                            publicProfile={profile} 
                        />
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">

                        {/* Gêneros */}
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

                        {/* Conexões */}
                        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
                            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-button-accent" /> Conexões
                            </h3>
                            <ul className="space-y-3 text-sm text-text-secondary">
                                {profile.connections?.discord && (
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500" /> {profile.connections.discord}</li>
                                )}
                                {profile.connections?.twitter && (
                                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> {profile.connections.twitter}</li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

