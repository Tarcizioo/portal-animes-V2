import { Trophy, Tv, Star, BookOpen, Zap, Clock } from 'lucide-react';

export const BADGES = [
    {
        id: 'first_step',
        name: 'Primeiro Passo',
        description: 'Adicionou o primeiro anime à biblioteca.',
        icon: BookOpen,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        requirement: (stats) => stats.totalAnimes >= 1
    },
    {
        id: 'otaku_initiate',
        name: 'Iniciado',
        description: 'Completou 5 animes.',
        icon: Tv,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        requirement: (stats) => stats.completedAnimes >= 5
    },
    {
        id: 'veteran',
        name: 'Veterano',
        description: 'Completou 20 animes.',
        icon: Trophy,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        requirement: (stats) => stats.completedAnimes >= 20
    },
    {
        id: 'marathonist',
        name: 'Maratonista',
        description: 'Assistiu a 100 episódios.',
        icon: Clock,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        requirement: (stats) => stats.episodesWatched >= 100
    },
    {
        id: 'critic',
        name: 'Crítico',
        description: 'Avaliou 5 animes.',
        icon: Star,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        requirement: (stats, library) => library.filter(a => a.score > 0).length >= 5
    },
    {
        id: 'collector',
        name: 'Colecionador',
        description: 'Tem 10+ animes na lista.',
        icon: Zap,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        requirement: (stats) => stats.totalAnimes >= 10
    }
];
