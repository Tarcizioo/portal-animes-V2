import { Plus, MoreVertical, PlayCircle, Search, Eye, CheckCircle, Clock, PauseCircle, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';

export function AnimeTrackerList() {
  const [activeTab, setActiveTab] = useState('assistindo');
  const [searchQuery, setSearchQuery] = useState('');

  // Dados Mockados (Simulando uma lista maior)
  const [animes, setAnimes] = useState([
    {
      id: 1,
      title: "Cyberpunk: Edgerunners",
      image: "https://placehold.co/400x600/1a1a1a/FFF?text=Cyberpunk",
      currentEp: 5,
      totalEp: 10,
      status: "assistindo",
    },
    {
      id: 2,
      title: "Jujutsu Kaisen 2nd Season",
      image: "https://placehold.co/400x600/2a2a2a/FFF?text=Jujutsu",
      currentEp: 18,
      totalEp: 24,
      status: "assistindo",
    },
    {
      id: 3,
      title: "Attack on Titan: Final Season",
      image: "https://placehold.co/400x600/3a3a3a/FFF?text=AOT",
      currentEp: 28,
      totalEp: 28,
      status: "completos",
    },
    {
      id: 4,
      title: "Solo Leveling",
      image: "https://placehold.co/400x600/4a4a4a/FFF?text=Solo",
      currentEp: 0,
      totalEp: 12,
      status: "planejados",
    },
     {
      id: 5,
      title: "One Piece",
      image: "https://placehold.co/400x600/5a5a5a/FFF?text=One+Piece",
      currentEp: 1080,
      totalEp: 1100,
      status: "assistindo",
    }
  ]);

  // Configuração das Abas
  const tabs = [
    { id: 'todos', label: 'Todos', icon: LayoutGrid },
    { id: 'assistindo', label: 'Assistindo', icon: Eye },
    { id: 'completos', label: 'Completos', icon: CheckCircle },
    { id: 'planejados', label: 'Planejados', icon: Clock },
  ];

  // Configuração de Cores por Status
  const statusConfig = {
    assistindo: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", bar: "bg-green-500" },
    completos: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", bar: "bg-blue-500" },
    planejados: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", bar: "bg-gray-500" },
    pausados: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", bar: "bg-yellow-500" },
  };

  // Lógica de Filtro
  const filteredAnimes = animes.filter(anime => {
    const matchesTab = activeTab === 'todos' ? true : anime.status === activeTab;
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleIncrement = (id) => {
    setAnimes(current => current.map(anime => {
      if (anime.id === id && anime.currentEp < anime.totalEp) {
        return { ...anime, currentEp: anime.currentEp + 1 };
      }
      return anime;
    }));
  };

  return (
    <div className="mt-8 font-sans">
      
      {/* CABEÇALHO COM TÍTULO E BUSCA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
          Biblioteca Pessoal
        </h3>
        
        {/* Barra de Busca Pequena */}
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Filtrar animes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16161a] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* ABAS DE FILTRO (Estilo Pill) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800 mb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border
                ${isActive 
                  ? 'bg-primary text-white border-primary shadow-[0_0_15px_-5px_rgba(99,102,241,0.6)]' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {/* Contador (Opcional) */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-gray-500'}`}>
                {tab.id === 'todos' ? animes.length : animes.filter(a => a.status === tab.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* GRID DE CARDS */}
      {filteredAnimes.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredAnimes.map((anime) => {
            const styles = statusConfig[anime.status] || statusConfig.assistindo;
            const progress = anime.totalEp > 0 ? (anime.currentEp / anime.totalEp) * 100 : 0;
            
            return (
              <div 
                key={anime.id} 
                className="group flex gap-4 bg-[#16161a] border border-white/5 rounded-2xl p-3 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:bg-[#1c1c21]"
              >
                {/* Imagem */}
                <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-900 shadow-md">
                  <img 
                    src={anime.image} 
                    alt={anime.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-gray-100 truncate text-sm md:text-base leading-snug group-hover:text-primary transition-colors">
                        {anime.title}
                      </h4>
                      <button className="text-gray-500 hover:text-white transition-colors p-1 -mr-2 -mt-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${styles.color} ${styles.bg} ${styles.border}`}>
                      {anime.status}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-end justify-between text-xs font-mono mb-1.5">
                      <span className="text-gray-500">Progresso</span>
                      <span className="text-gray-200 font-bold">
                        {anime.currentEp} <span className="text-gray-600">/ {anime.totalEp || '?'}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${styles.bar}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {/* Botão + só aparece se não estiver completo */}
                      {anime.status !== 'completos' && (
                        <button 
                          onClick={() => handleIncrement(anime.id)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:bg-primary hover:text-white hover:border-primary active:scale-90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                      
                      {/* Se estiver completo, mostra Check */}
                      {anime.status === 'completos' && (
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // ESTADO VAZIO (Quando não tem animes no filtro)
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-gray-400 font-medium">Nenhum anime encontrado nesta lista.</p>
          <button className="mt-4 text-primary text-sm font-bold hover:underline">
            Explorar Catálogo
          </button>
        </div>
      )}
    </div>
  );
}