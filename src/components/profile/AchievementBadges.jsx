import { Award, Film, Heart, MessageSquare, Lock } from 'lucide-react';

export function AchievementBadges() {
  const badges = [
    { icon: Award, color: "orange", title: "Maratonista", level: "Nível 5", unlocked: true },
    { icon: Film, color: "indigo", title: "Cinéfilo", level: "Nível 3", unlocked: true },
    { icon: Heart, color: "pink", title: "Apoiador", level: "VIP", unlocked: true },
    { icon: MessageSquare, color: "teal", title: "Crítico", level: "Nível 8", unlocked: true },
    { icon: Lock, color: "red", title: "Lendário", level: "Bloqueado", unlocked: false },
  ];

  const colorClasses = {
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 group-hover:text-orange-400 hover:border-orange-500/50 shadow-orange-500/30",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 group-hover:text-indigo-400 hover:border-indigo-500/50 shadow-indigo-500/30",
    pink: "text-pink-500 bg-pink-500/10 border-pink-500/20 group-hover:text-pink-400 hover:border-pink-500/50 shadow-pink-500/30",
    teal: "text-teal-500 bg-teal-500/10 border-teal-500/20 group-hover:text-teal-400 hover:border-teal-500/50 shadow-teal-500/30",
    red: "text-red-500 bg-red-500/10 border-red-500/20 group-hover:shadow-red-500/30",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Conquistas</h3>
        <a href="#" className="text-primary text-sm font-medium hover:underline">Ver todas</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          const isLocked = !badge.unlocked;
          const baseClasses = "group relative bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 overflow-hidden transition-all shadow-sm";
          const lockedClasses = "opacity-50 hover:opacity-100 grayscale hover:grayscale-0";
          const hoverBorder = !isLocked ? `hover:border-${badge.color}-500/50` : '';

          return (
            <div key={index} className={`${baseClasses} ${isLocked ? lockedClasses : hoverBorder}`}>
              {/* Background Glow (só aparece no hover se desbloqueado) */}
              {!isLocked && (
                 <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              )}
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${colorClasses[badge.color]} ${!isLocked ? 'group-hover:shadow-[0_0_15px_rgba(var(--tw-shadow-color))]' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="text-center z-10">
                <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">{badge.title}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{badge.level}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}