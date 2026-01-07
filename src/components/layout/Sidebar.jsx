import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom'; // Adicionado Link
import { 
  Home, 
  Compass, 
  Heart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Zap // <--- O ícone de Raio importado aqui
} from 'lucide-react';
import clsx from 'clsx';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Link Base Styles
  const linkBase = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium";
  const linkActive = "bg-primary text-white shadow-lg shadow-primary/25";
  const linkInactive = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary";

  return (
    <>
      {/* --- MOBILE TRIGGER (Botão Flutuante) --- */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white active:scale-95 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* --- OVERLAY (Fundo escuro no mobile) --- */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* 1. LOGO COM O RAIO ⚡ */}
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-primary tracking-tighter group">
            <div className="w-8 h-8 bg-primary group-hover:bg-primary-hover transition-colors rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
              {/* Ícone de Raio preenchido */}
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="text-gray-800 dark:text-white group-hover:text-primary transition-colors">
              Portal<span className="text-primary">Animes</span>
            </span>
          </Link>
        </div>

        {/* 2. NAVEGAÇÃO */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          <div className="text-xs font-bold text-gray-400 uppercase px-4 mb-2 tracking-wider">Menu</div>
          
          <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => clsx(linkBase, isActive ? linkActive : linkInactive)}>
            <Home className="w-5 h-5" /> Início
          </NavLink>

          <NavLink to="/catalog" onClick={() => setIsOpen(false)} className={({ isActive }) => clsx(linkBase, isActive ? linkActive : linkInactive)}>
            <Compass className="w-5 h-5" /> Catálogo
          </NavLink>

          <NavLink to="/favorites" onClick={() => setIsOpen(false)} className={({ isActive }) => clsx(linkBase, isActive ? linkActive : linkInactive)}>
            <Heart className="w-5 h-5" /> Favoritos
          </NavLink>

          <div className="pt-4 pb-2">
            <div className="h-px bg-gray-200 dark:bg-white/5 mx-4" />
          </div>

          <div className="text-xs font-bold text-gray-400 uppercase px-4 mb-2 tracking-wider">Geral</div>
          
          <NavLink to="/settings" onClick={() => setIsOpen(false)} className={({ isActive }) => clsx(linkBase, isActive ? linkActive : linkInactive)}>
            <Settings className="w-5 h-5" /> Configurações
          </NavLink>
        </nav>

        {/* 3. PERFIL AGORA É CLICÁVEL (Link) */}
        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
          {/* Mudamos de div para Link e adicionamos o destino "to" */}
          <Link 
            to="/profile" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Efeito Hover suave no fundo */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />

            {/* Avatar */}
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent-purple flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0 z-10">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-primary transition-colors">
                Visitante
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Visualizar perfil
              </p>
            </div>

            {/* Ícone de Sair (Botão isolado para não navegar ao clicar nele especificamente, se desejado, mas aqui deixei visual) */}
            <div className="z-10 p-1.5 text-gray-400 group-hover:text-primary transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </aside>
    </>
  );
}