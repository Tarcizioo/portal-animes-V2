import { Home, Compass, Heart, Clock, Settings, LogOut, Zap, User } from 'lucide-react'; // <--- Import User
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-primary/10 text-primary shadow-lg shadow-primary/10' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-background-dark border-r border-white/5 py-8 px-4 z-50">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/40">
           <Zap className="w-6 h-6 text-white fill-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-wide">Portal</span>
      </div>

      {/* MENU DE NAVEGAÇÃO */}
      <nav className="flex-1 flex flex-col gap-2 w-full">
        
        <Link to="/" className={getLinkClass('/')}>
          <Home className="w-5 h-5" />
          <span>Início</span>
        </Link>

        <Link to="/catalog" className={getLinkClass('/catalog')}>
          <Compass className="w-5 h-5" />
          <span>Explorar</span>
        </Link>

        {/* --- NOVO LINK DE PERFIL --- */}
        <Link to="/profile" className={getLinkClass('/profile')}>
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </Link>

        <Link to="#" className={getLinkClass('/favorites')}>
          <Heart className="w-5 h-5" />
          <span>Favoritos</span>
        </Link>

        <Link to="#" className={getLinkClass('/history')}>
          <Clock className="w-5 h-5" />
          <span>Histórico</span>
        </Link>
      </nav>

      {/* RODAPÉ */}
      <div className="flex flex-col gap-2 w-full mt-auto">
        <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium">
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </button>
        <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>

    </aside>
  );
}