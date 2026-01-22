import { TrendingUp, Clock, Star } from 'lucide-react';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';

export function ProfileStats() {
  const { library } = useAnimeLibrary();

  // Calcular Estatísticas Reais
  const completedAnimes = library.filter(a => a.status === 'completed').length;
  const totalEpisodes = library.reduce((acc, curr) => acc + (curr.currentEp || 0), 0);

  // Média de Notas (Assumindo que temos um campo 'score', por enquanto pode ser 0 ou mockado se não tiver UI pra editar)
  const ratedAnimes = library.filter(a => a.score > 0);
  const meanScore = ratedAnimes.length > 0
    ? (ratedAnimes.reduce((acc, curr) => acc + curr.score, 0) / ratedAnimes.length).toFixed(1)
    : "0.0";

  const stats = [
    {
      label: "Animes Completos",
      value: completedAnimes,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-green-500",
      change: null, // Poderia ser calculado se tivéssemos histórico
      bgGlow: "bg-primary/20"
    },
    {
      label: "Episódios Vistos",
      value: totalEpisodes.toLocaleString(),
      icon: <span className="text-xs">eps</span>,
      color: "text-gray-400",
      change: null,
      bgGlow: "bg-blue-500/20"
    },
    {
      label: "Nota Média",
      value: meanScore,
      icon: <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />,
      color: null,
      change: null,
      bgGlow: "bg-yellow-500/20"
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[var(--bg-secondary)] backdrop-blur-md border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-1 relative overflow-hidden group hover:bg-[var(--bg-tertiary)] transition-all">
          <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl group-hover:bg-opacity-50 transition-all ${stat.bgGlow}`}></div>
          <span className="text-[var(--text-secondary)] text-sm font-medium">{stat.label}</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</span>
            {stat.change && (
              <span className={`text-xs font-bold mb-1.5 flex items-center ${stat.color}`}>
                {stat.icon} {stat.change}
              </span>
            )}
            {!stat.change && stat.icon && (
              <span className="mb-1.5">{stat.icon}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}