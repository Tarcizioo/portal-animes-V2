import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';
import clsx from 'clsx';
import { SettingsModal } from '@/components/settings/SettingsModal';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Link Base Styles
  const linkBase = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-left";
  const linkActive = "bg-button-accent text-text-on-primary shadow-lg shadow-button-accent/25";
  const linkInactive = "text-text-secondary hover:bg-bg-tertiary hover:text-primary transition-colors";

  return (
    <>
      {/* --- SETTINGS MODAL --- */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* --- MOBILE TRIGGER (Botão Flutuante) --- */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-bg-secondary rounded-lg shadow-lg border border-border-color text-text-primary active:scale-95 transition-transform"
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
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-bg-secondary border-r border-border-color flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>

        {/* 1. LOGO COM O RAIO ⚡ */}
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-primary tracking-tighter group">
            <div className="w-8 h-8 bg-primary group-hover:bg-primary-hover transition-colors rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
              {/* Ícone de Raio preenchido */}
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="text-text-primary group-hover:text-primary transition-colors">
              Portal<span className="text-primary">Animes</span>
            </span>
          </Link>
        </div>

        {/* 2. NAVEGAÇÃO */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          <div className="text-xs font-bold text-text-secondary/60 uppercase px-4 mb-2 tracking-wider">Menu</div>

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
            <div className="h-px bg-border-color mx-4" />
          </div>

          <div className="text-xs font-bold text-text-secondary/60 uppercase px-4 mb-2 tracking-wider">Geral</div>

          {/* Changed from NavLink to Button for Settings */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsSettingsOpen(true);
            }}
            className={clsx(linkBase, linkInactive)}
          >
            <Settings className="w-5 h-5" /> Configurações
          </button>
        </nav>

        {/* 3. PERFIL AGORA É CLICÁVEL (Link) */}
        <div className="p-4 border-t border-border-color bg-bg-tertiary">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Efeito Hover suave no fundo */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />

            {/* Avatar */}
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-button-accent flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">

              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-secondary rounded-full"></span>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0 z-10">
              <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                Visitante
              </h4>
              <p className="text-xs text-text-secondary truncate">
                Visualizar perfil
              </p>
            </div>

            {/* Ícone de Sair */}
            <div className="z-10 p-1.5 text-text-secondary group-hover:text-primary transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </aside>
    </>
  );
}