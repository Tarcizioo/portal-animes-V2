import { Edit2 } from 'lucide-react';

export function ProfileHeader({ user, profile, onEdit }) {
  // Safe Fallbacks (Prioridade: Profile Firestore -> Auth User -> Placeholder)
  const banner = profile?.bannerURL || user?.bannerURL || "https://placehold.co/1200x400/1a1a1a/FFF?text=Banner+Anime";
  const photo = profile?.photoURL || user?.photoURL || "https://placehold.co/200x200/6366f1/FFF?text=User";
  const name = profile?.displayName || user?.displayName || "Usuário";
  const isOnline = true; // Poderia ser um campo 'lastActive' do Firestore

  return (
    <div className="relative mb-20">
      {/* Banner */}
      <div className="h-72 w-full rounded-3xl overflow-hidden relative shadow-2xl group">
        <img
          src={banner}
          alt="Banner"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/30 opacity-90"></div>

        {/* Status Badge */}
        <div className="absolute top-6 right-6 flex gap-2">
          <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span> {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Avatar e Ações */}
      <div className="absolute -bottom-16 left-8 sm:left-12 flex items-end gap-6">
        <div className="group relative">
          <div className="w-36 h-36 rounded-full p-1.5 bg-background-light dark:bg-background-dark">
            <img
              src={photo}
              alt={name}
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#1e1e24]"
            />
          </div>
          <button
            onClick={onEdit}
            className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all transform hover:scale-110 cursor-pointer z-10"
            title="Editar Perfil"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Nome e Info (Novo) */}
        <div className="mb-4 space-y-1">
          <h1 className="text-3xl font-bold text-white">{name}</h1>
          <p className="text-gray-400 text-sm">Membro desde {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}