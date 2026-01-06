import { Edit2, Share2, MapPin } from 'lucide-react'; // Usando lucide-react como no resto do projeto

export function ProfileHeader() {
  return (
    <div className="relative mb-20">
      {/* Banner */}
      <div className="h-72 w-full rounded-3xl overflow-hidden relative shadow-2xl">
        <img 
          src="https://placehold.co/1200x400/1a1a1a/FFF?text=Banner+Anime" 
          alt="Banner" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/30 opacity-90"></div>
        
        {/* Status Badge */}
        <div className="absolute top-6 right-6 flex gap-2">
          <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
          </span>
        </div>
      </div>

      {/* Avatar e Ações */}
      <div className="absolute -bottom-16 left-8 sm:left-12 flex items-end">
        <div className="group relative">
          <div className="w-36 h-36 rounded-full p-1.5 bg-background-light dark:bg-background-dark">
            <img 
              src="https://placehold.co/200x200/6366f1/FFF?text=H" 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#1e1e24]" 
            />
          </div>
          <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 cursor-pointer">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}